// api/exchange.js
export default async function handler(req, res) {
  try {
    // Only allow POST
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      res.writeHead(405, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Method Not Allowed" }));
    }

    // 1️⃣ Parse the JSON body manually
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "invalid_json", message: "Could not parse JSON body" })
      );
    }
    const { code, verifier } = parsed;
    if (!code || !verifier) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "invalid_request", message: "Missing code or verifier" })
      );
    }

    // 2️⃣ Read your env vars
    const CLIENT_ID    = process.env.SPOTIFY_CLIENT_ID;
    const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
    if (!CLIENT_ID || !REDIRECT_URI) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "server_error",
          message: "Missing SPOTIFY_CLIENT_ID or SPOTIFY_REDIRECT_URI in env",
        })
      );
    }

    // 3️⃣ Exchange code → token at Spotify
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "authorization_code",
        code,
        redirect_uri:  REDIRECT_URI,
        client_id:     CLIENT_ID,
        code_verifier: verifier,
      }).toString(),
    });

    const data = await tokenRes.json();
    const status = tokenRes.ok ? 200 : 400;

    // 4️⃣ Return Spotify’s JSON straight back
    res.writeHead(status, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(data));
  } catch (err) {
    console.error("Unexpected error in /api/exchange:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "server_error", message: err.message }));
  }
}
