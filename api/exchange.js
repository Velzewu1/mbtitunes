// /api/exchange.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { code, verifier } = await req.json();
  if (!code || !verifier) {
    return res
      .status(400)
      .json({ error: "invalid_request", message: "Missing code or verifier" });
  }

  const CLIENT_ID    = process.env.SPOTIFY_CLIENT_ID;
  const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

  // sanity check—if these aren’t set, throw a clear error
  if (!CLIENT_ID || !REDIRECT_URI) {
    return res
      .status(500)
      .json({ error: "server_error", message: "Missing SPOTIFY env-vars" });
  }

  const body = new URLSearchParams({
    grant_type:    "authorization_code",
    code,
    redirect_uri:  REDIRECT_URI,
    client_id:     CLIENT_ID,
    code_verifier: verifier,
  });

  const spotifyRes = await fetch("https://accounts.spotify.com/api/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });

  const data = await spotifyRes.json();
  if (!spotifyRes.ok) {
    return res.status(spotifyRes.status).json(data);
  }

  return res.status(200).json({
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    expires_in:    data.expires_in,
  });
}
