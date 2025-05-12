import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import Footer from "../../components/Footer"
import "./Registration.css";

const CLIENT_ID = "f8c7889eef0c4aa08b9aaffe72365873";
const SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
const REDIRECT_URL_AFTER_LOGIN = window.location.origin;
const SPACE_DELIMITER = "%20";
const SCOPES = [
  "playlist-read-private",
];
const SCOPES_URL_PARAM = SCOPES.join(SPACE_DELIMITER);

const getReturnedParamsFromSpotifyAuth = (hash) => {
  const stringAfterHash = hash.substring(1);
  const paramsInUrl = stringAfterHash.split("&");
  const paramsSplitUp = paramsInUrl.reduce((acc, currentValue) => {
    const [key, value] = currentValue.split("=");
    acc[key] = value;
    return acc;
  }, {});
  return paramsSplitUp;
};

const Registration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash) {
      const { access_token, expires_in, token_type } =
        getReturnedParamsFromSpotifyAuth(window.location.hash);
      localStorage.clear();
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("tokenType", token_type);
      localStorage.setItem("expiresIn", expires_in);
      navigate(ROUTES.PLAYLISTS);
    }
  }, [navigate]);

  const handleLogin = () => {
    window.location = `${SPOTIFY_AUTHORIZE_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL_AFTER_LOGIN}&scope=${SCOPES_URL_PARAM}&response_type=token&show_dialog=true`;
  };

  return (
    <div className="registration-wrapper">
      {/* Контент */}
      <div className="registration-container">
        <h1>YOUR <br /> SPOTIFY <br /> MBTI</h1>
        <p>Find out your Spotify MBTI based on your music taste.</p>

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
