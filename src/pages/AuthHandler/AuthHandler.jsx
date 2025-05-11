import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const parseHash = (hash) => {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  return Object.fromEntries(p.entries());
};

const AuthHandler = () => {
  const navigate = useNavigate();

  const handleHash = useCallback(() => {
    const params = parseHash(window.location.hash);

   // 1)  Spotify вернул ошибку — сразу на /auth-error
   if (params.error) {
     navigate("/auth-error", {
       replace: true,
       state: {
         code:        params.error,
         description: params.error_description || "No description",
       },
     });
     return;
   }

    // 2)  обычный happy‑path: есть access_token
    const { access_token, token_type, expires_in } = params;
    if (!access_token || !token_type || !expires_in) {
      navigate("/auth-error", { replace: true, state: { code: "missing_token", description: "Token parameters not found" } });
      return;
    }

    const expiresAt = Date.now() + Number(expires_in) * 1000;
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("tokenType",   token_type);
    localStorage.setItem("expiresAt",   expiresAt.toString());

    const timeout = setTimeout(() => {
      localStorage.clear();
      navigate("/", { replace: true });
    }, Number(expires_in) * 1000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  useEffect(handleHash, [handleHash]);

  return (
    <div className="bg-color-white flex h-screen items-center justify-center bg-zinc-900 text-white">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mr-3" />
      <span>Authorizing…</span>
    </div>
  );
};

export default AuthHandler;
