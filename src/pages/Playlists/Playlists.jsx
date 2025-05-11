import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../../components/Footer";
import "./Playlists.css";
import * as ROUTES from "../../constants/routes";

const ENDPOINT = "https://api.spotify.com/v1/me/playlists";

const Playlists = () => {
  const [token, setToken]   = useState("");
  const [data,  setData]    = useState([]);
  const navigate            = useNavigate();

  useEffect(() => {
    const t = localStorage.getItem("accessToken");
    if (t) { setToken(t); fetchPlaylists(t); }
  }, []);

  const fetchPlaylists = (accessToken = token) => {
    if (!accessToken) return console.error("No token");
    axios.get(ENDPOINT, {
      headers: { Authorization: "Bearer " + accessToken, "Accept-Language": "en" }
    })
    .then(res => setData(res.data.items || []))
    .catch(console.error);
  };

  const handleClick = (playlistId) =>
    navigate(ROUTES.MBTI, { state: { playlistId } });   /* ⭐ переходим на MBTI‑страницу */

  return (
    <div className="playlists-wrapper">
      <div className="playlists-container-inner">
        <h1 className="page-title">Your Playlists</h1>
        <button className="fetch-button" onClick={fetchPlaylists}>Reload Playlists</button>

        <div className="playlists-container">
          {data.map(pl => (
            <div key={pl.id} className="playlist-card" onClick={() => handleClick(pl.id)}>
              <img src={pl.images?.[0]?.url || "https://via.placeholder.com/150"} alt={pl.name} className="playlist-image"/>
              <div className="playlist-name" title={pl.name}>
                {pl.name.length > 20 ? pl.name.slice(0, 20) + "…" : pl.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Playlists;
