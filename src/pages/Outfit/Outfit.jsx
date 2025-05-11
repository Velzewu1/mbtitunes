import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import Footer from "../../components/Footer";
import genresData from "../../constants/genres_dict.json";
import "./Outfit.css";

const PLAYLIST_TRACKS_ENDPOINT = (playlistId) =>
  `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
const ARTISTS_ENDPOINT = (ids) =>
  `https://api.spotify.com/v1/artists?ids=${ids}`;

const { genres_map } = genresData;

function unifyGenre(spotifyGenre) {
  if (!spotifyGenre) return null;
  const lower = spotifyGenre.toLowerCase();
  for (const mainGenre of Object.keys(genres_map)) {
    const subs = genres_map[mainGenre];
    if (Array.isArray(subs) &&
        subs.some(sub => sub.toLowerCase() === lower)
    ) {
      return mainGenre;
    }
  }
  return null;
}


function normalizeGenreName(name) {
  return name.toLowerCase().replace(/\s+/g, '');
}

const Outfit = () => {
  const [token, setToken] = useState("");
  const [mbti, setMbti] = useState(null);
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();
  const [username, setUsername] = useState("");
  const playlistId = state?.playlistId;

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("Access token:", accessToken);
    if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  useEffect(() => {
    if (!token || !playlistId) {
      console.warn("Missing token or playlistId:", { token, playlistId });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Fetching playlist tracks...");
        const resp = await axios.get(PLAYLIST_TRACKS_ENDPOINT(playlistId), {
          headers: { Authorization: `Bearer ${token}`, "Accept-Language": "en" },
        });
        const items = resp.data.items || [];
        console.log("Playlist items fetched:", items.length);

        const artistIdsSet = new Set();
        items.forEach((item) => {
          const track = item.track;
          if (track && track.artists) {
            track.artists.forEach((artist) => artistIdsSet.add(artist.id));
          }
        });
        const artistIdsArray = Array.from(artistIdsSet);
        console.log("Unique artist IDs:", artistIdsArray.length);

        if (artistIdsArray.length === 0) {
          console.warn("No artist IDs found.");
          setLoading(false);
          return;
        }

        const chunkSize = 50;
        let allArtists = [];
        for (let i = 0; i < artistIdsArray.length; i += chunkSize) {
          const chunk = artistIdsArray.slice(i, i + chunkSize);
          const artistsResp = await axios.get(ARTISTS_ENDPOINT(chunk.join(",")), {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": "en" },
          });
          allArtists = allArtists.concat(artistsResp.data.artists || []);
        }

        console.log("Total artists fetched:", allArtists.length);

        const genreCount = {};
        allArtists.forEach((artist) => {
          const artistGenres = artist.genres || [];
          console.log("Artist genres:", artist.name, artistGenres);
          artistGenres.forEach(g => {
            const unified = unifyGenre(g);
            if (unified) {
              genreCount[unified] = (genreCount[unified] || 0) + 1;
            }
          });          
        });

        console.log("Matched genre counts:", genreCount);

        let topGenre = null;
        let maxCount = 0;
        Object.entries(genreCount).forEach(([genre, count]) => {
          if (count > maxCount) {
            topGenre = genre;
            maxCount = count;
          }
        });

        if (topGenre) {
          const normalized = normalizeGenreName(topGenre);
          console.log("Top genre:", topGenre, "Normalized:", normalized);
          setMbti(normalized);
        } else {
          console.warn("No matching genre found.");
        }
      } catch (error) {
        console.error("Error fetching playlist or artists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, playlistId]);

  useEffect(() => {
    if (!token) return;

    axios
      .get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsername(res.data.display_name || "User");
        console.log("Fetched username:", res.data.display_name);
      })
      .catch((err) => console.error("Error fetching username:", err));
  }, [token]);

  return (
    <div className="outfit-page">
      {!playlistId && <p>No playlist selected.</p>}

      {!loading && !mbti && (
        <p className="color: white">
          Could not determine your MBTI (maybe your taste is too unique or your playlist is too short).
          <br />
          <Link to="/playlists">Try another playlist.</Link>
        </p>
      )}

      {loading && (
        <div className="loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      {!loading && mbti && (
        <div className="phone-frame">
          <div className="genre-title">{mbti.toUpperCase()}</div>
          <p className="username-subtitle">{username}'s spotify MBTI</p>
          <img
            src={`/mbti/${mbti}.png`}
            alt={`${mbti.toUpperCase()} MBTI result`}
            className="mbti-image"
          />
          <div className="footer-text">mbtitunes.vercel.app</div>
          <div>
            <button onClick={() => window.location.reload()}>reload</button>
            <Link to="/playlists">back</Link>
          </div>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Outfit;
