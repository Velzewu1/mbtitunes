// src/pages/Registration/Registration.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import Footer from "../../components/Footer";
import "./Registration.css";
import {
  generateCodeVerifier,
  generateCodeChallenge
} from "../../utils/pkce";

const CLIENT_ID    = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const SCOPES       = ["playlist-read-private"];

const Registration = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    // 1️⃣ Генерируем PKCE verifier & challenge
    const verifier = generateCodeVerifier();
    localStorage.setItem("pkce_verifier", verifier);
    const challenge = await generateCodeChallenge(verifier);

    // 2️⃣ Составляем URL Spotify
    const url = new URL("https://accounts.spotify.com/authorize");
    url.searchParams.set("client_id",             CLIENT_ID);
    url.searchParams.set("response_type",         "code");
    url.searchParams.set("redirect_uri",          REDIRECT_URI);
    url.searchParams.set("scope",                 SCOPES.join(" "));
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("code_challenge",        challenge);
    url.searchParams.set("show_dialog",           "true");

    window.location.href = url.toString();
  };

  return (
    <div className="registration-wrapper">
      {/* …декор… */}
      <div className="registration-container">
        <h1>YOUR <br /> SPOTIFY <br /> OUTFIT</h1>
        <p>Secure PKCE Authorization Code flow.</p>
        <button className="spotify-button" onClick={handleLogin}>
          <img src="/resources/img/spotifylogo.png" alt="Spotify" />
          Connect Spotify
        </button>
        <p className="note">ℹ️ Make sure you're not in incognito</p>
      </div>
      <Footer />
    </div>
  );
};

export default Registration;
