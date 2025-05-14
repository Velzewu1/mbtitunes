// src/utils/pkce.js

/** Base64-URL encode an ArrayBuffer */
function base64Url(buffer) {
  const str = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Generate a random code_verifier (43–128 chars) */
export function generateCodeVerifier() {
  const arr = new Uint8Array(64);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => ("0" + b.toString(16)).slice(-2)).join("");
}

/** SHA-256(code_verifier) → Base64-URL */
export async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64Url(hash);
}
