// api/exchange.js
export default async function handler(req, res) {
  const { code, verifier } = await req.json();
  const body = new URLSearchParams({
    grant_type:    "authorization_code",
    code,
    redirect_uri:  process.env.VITE_REDIRECT_URI,
    client_id:     process.env.VITE_SPOTIFY_CLIENT_ID,
    code_verifier: verifier,
  });

  const spotifyRes = await fetch("https://accounts.spotify.com/api/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });

  const data = await spotifyRes.json();
  return res.status(spotifyRes.ok ? 200 : 400).json(data);
}
