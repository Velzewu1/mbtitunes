// src/pages/Callback/Callback.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as ROUTES from "../../constants/routes";

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get("code");
    const error  = params.get("error");

    if (error) {
      return navigate("/auth-error", {
        replace: true,
        state: {
          error,
          description: params.get("error_description") || ""
        }
      });
    }
    if (!code) {
      return navigate("/auth-error", {
        replace: true,
        state: {
          error: "unknown_error",
          description: "Authorization code not found."
        }
      });
    }

    const verifier = localStorage.getItem("pkce_verifier");
    if (!verifier) {
      return navigate("/auth-error", {
        replace: true,
        state: {
          error: "missing_verifier",
          description: "PKCE verifier not found."
        }
      });
    }

    // 3️⃣ Обмен code → token через serverless /api/exchange
    fetch("/api/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, verifier })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.access_token) {
          throw new Error(data.error || "no_access_token");
        }
        localStorage.setItem("accessToken",  data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        const expiresAt = Date.now() + data.expires_in * 1000;
        localStorage.setItem("expiresAt", String(expiresAt));
        navigate(ROUTES.PLAYLISTS, { replace: true });
      })
      .catch(err => {
        console.error("Exchange failed", err);
        navigate("/auth-error", {
          replace: true,
          state: { error: err.message, description: "" }
        });
      });
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-900 text-white">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mr-3"></div>
      <span>Finishing authorization…</span>
    </div>
  );
};

export default Callback;
