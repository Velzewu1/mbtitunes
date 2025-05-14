// api/exchange.js
export default async function handler(req, res) {
  console.log("⇢ /api/exchange invoked", req.method);

  if (req.method !== "POST") {
    console.log("↳ rejected non-POST");
    res.setHeader("Allow", "POST");
    res.writeHead(405, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Method Not Allowed" }));
  }

  // 1. Read raw body
  let raw = "";
  try {
    for await (const chunk of req) raw += chunk;
    console.log("↳ raw body:", raw);
  } catch (e) {
    console.error("↳ error reading body:", e);
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "bad_request", message: "Failed to read body" }));
  }

  // 2. Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(raw);
    console.log("↳ parsed JSON:", parsed);
  } catch (e) {
    console.error("↳ JSON.parse error:", e);
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "invalid_json", message: e.message }));
  }

  const { code, verifier } = parsed;
  console.log("↳ code & verifier:", code, verifier);

  // 3. Env-vars check
  const CLIENT_ID    = process.env.SPOTIFY_CLIENT_ID;
  const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
  console.log("↳ env CLIENT_ID, REDIRECT_URI:", CLIENT_ID, REDIRECT_URI);

  if (!CLIENT_ID || !REDIRECT_URI) {
    console.error("↳ missing env-vars");
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({ error: "server_error", message: "Missing SPOTIFY_CLIENT_ID or SPOTIFY_REDIRECT_URI" })
    );
  }

  // 4. Exchange with Spotify
  try {
    const exchangeBody = new URLSearchParams({
      grant_type:    "authorization_code",
      code,
      redirect_uri:  REDIRECT_URI,
      client_id:     CLIENT_ID,
      code_verifier: verifier,
    }).toString();

    console.log("↳ calling Spotify /api/token…");
    const spotifyRes = await fetch("https://accounts.spotify.com/api/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    exchangeBody,
    });

    const data = await spotifyRes.json();
    console.log("↳ Spotify response:", spotifyRes.status, data);

    res.writeHead(spotifyRes.ok ? 200 : 400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(data));
  } catch (e) {
    console.error("↳ error calling Spotify:", e);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "server_error", message: e.message }));
  }
}
