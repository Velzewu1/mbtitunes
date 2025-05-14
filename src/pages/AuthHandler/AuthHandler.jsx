// src/pages/AuthHandler/AuthHandler.jsx
import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const readFragment = (hash) => new URLSearchParams(hash.replace(/^#/, ""));

const AuthHandler = () => {
  const navigate = useNavigate();

  const handleRedirect = useCallback(() => {
    const params = readFragment(window.location.hash);
    const access_token = params.get("access_token");
    const token_type   = params.get("token_type");
    const expires_in   = params.get("expires_in");

    // If Spotify explicitly sent an error…
    const error             = params.get("error");
    const error_description = params.get("error_description");

    if (error) {
      navigate("/auth-error", {
        state: { error, description: error_description },
        replace: true,
      });
      return;
    }

    // Missing the expected fields?
    if (!access_token || !token_type || !expires_in) {
      navigate("/auth-error", {
        state: {
          error:       "unknown_error",
          description: "Missing parameters in redirect.",
        },
        replace: true,
      });
      return;
    }

    // Success: store token and schedule auto-logout
    const expiresAt = Date.now() + Number(expires_in) * 1000;
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("tokenType",   token_type);
    localStorage.setItem("expiresAt",   String(expiresAt));

    const logoutTimer = setTimeout(() => {
      localStorage.clear();
      navigate("/", { replace: true });
    }, Number(expires_in) * 1000);

    return () => clearTimeout(logoutTimer);
  }, [navigate]);

  useEffect(handleRedirect, [handleRedirect]);

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-900 text-white">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mr-3" />
      <span>Authorizing…</span>
    </div>
  );
};

export default AuthHandler;
