import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import genresDict  from "../../constants/genres_dict.json";
import weightsData  from "../../constants/mbti_weights.json";
import Footer from "../../components/Footer";
import "./Mbti.css";

const TRACKS = (id) => `https://api.spotify.com/v1/playlists/${id}/tracks`;
const ARTISTS = (ids) => `https://api.spotify.com/v1/artists?ids=${ids}`;
const { genres_map } = genresDict;
const weights = weightsData;

function unifyGenre(g) {                   /* сводим sub‑жанр → 20 основных */
  if (!g) return null;
  const lg = g.toLowerCase();
  for (const main in genres_map) {
    const subs = genres_map[main];
    if (subs.some(s => s.toLowerCase() === lg)) return main;
  }
  return null;
}

const Mbti = () => {
  const { state }      = useLocation();
  const playlistId     = state?.playlistId;
  const [token, setT ] = useState("");
  const [loading, setL]= useState(false);
  const [result,setR ] = useState(null);   // { type:"INFP", axes:{I:..,E:..,…}, pct:{I:65,…} }
  const [user, setU  ] = useState("");

  /* 1. токен + ник */
  useEffect(() => {
    const t = localStorage.getItem("accessToken");
    if (!t) return;
    setT(t);
    axios.get("https://api.spotify.com/v1/me", { headers:{Authorization:`Bearer ${t}`} })
      .then(r => setU(r.data.display_name || "User"))
      .catch(console.error);
  }, []);

  /* 2. основная работа */
  useEffect(() => {
    if (!token || !playlistId) return;
    (async () => {
      setL(true);
      try {
        /* 2.1 треки плейлиста */
        const items = (await axios.get(TRACKS(playlistId), {
          headers:{Authorization:`Bearer ${token}`, "Accept-Language":"en"}
        })).data.items || [];

        /* 2.2 уникальные артисты */
        const ids = [...new Set(items.flatMap(it => it.track?.artists?.map(a => a.id)))];
        if (!ids.length) throw new Error("playlist is empty");

        /* 2.3 жанры всех артистов */
        let artists = [];
        for (let i=0;i<ids.length;i+=50){
          const chunk = ids.slice(i,i+50).join(",");
          const res   = await axios.get(ARTISTS(chunk), { headers:{Authorization:`Bearer ${token}`} });
          artists     = artists.concat(res.data.artists || []);
        }

        /* 2.4 считаем жанры */
        const axis = {I:0,E:0,N:0,S:0,T:0,F:0,J:0,P:0};
        artists.forEach(a => {
          (a.genres || []).forEach(g => {
            const main = unifyGenre(g);
            const w    = weights[main];
            if (!w) return;
            Object.entries(w).forEach(([k,val]) => axis[k]+=val);
          });
        });

        const safe = (a,b)=>axis[a]+axis[b]||1;                 // защита от /0
        const letter = (a,b)=> axis[a]>=axis[b]?a:b;
        const pct = (a,b)=> Math.round(100*axis[a]/safe(a,b));

        const type = `${letter("I","E")}${letter("N","S")}${letter("T","F")}${letter("J","P")}`;

        setR({
          type,
          axes: axis,
          pct : {
            I:pct("I","E"), E:100-pct("I","E"),
            N:pct("N","S"), S:100-pct("N","S"),
            T:pct("T","F"), F:100-pct("T","F"),
            J:pct("J","P"), P:100-pct("J","P")
          }
        });
      } catch(e){ console.error(e); }
      finally   { setL(false); }
    })();
  }, [token,playlistId]);

  /* ---------- UI ---------- */
  return (
    <div className="mbti-page">
      {!playlistId && <p>Playlist not selected.</p>}

      {loading && <div className="loader-wrapper"><div className="loader"/></div>}

      {!loading && result && (
        <div className="mbti-card">
          <h2>{user}'s MBTI result</h2>
          <div className="mbti-type">{result.type}</div>

          <div className="axes">
            {["I/E","N/S","T/F","J/P"].map(pair=>{
              const [a,b]=pair.split("/");
              return (
                <div key={pair} className="axis-line">
                  <span>{a}</span>
                  <div className="bar">
                    <div className="fill"
                         style={{width:`${result.pct[a]}%`}}
                         title={`${result.pct[a]} % ${a}`}/>
                  </div>
                  <span>{b}</span>
                </div>
              );
            })}
          </div>

          <div className="buttons">
            <button onClick={()=>window.location.reload()}>re‑calc</button>
            <Link  to="/playlists">choose another playlist</Link>
          </div>
        </div>
      )}

      {!loading && !result && playlistId && (
        <p>Cannot detect genres in this playlist. <Link to="/playlists">Try another one</Link>.</p>
      )}

      <Footer/>
    </div>
  );
};

export default Mbti;
