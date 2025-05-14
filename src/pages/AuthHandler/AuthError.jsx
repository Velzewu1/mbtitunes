// src/pages/AuthError/AuthError.jsx
import React from "react";
import { useLocation, Link } from "react-router-dom";

const AuthError = () => {
  const { state } = useLocation();
  const err  = state?.error       || "unknown_error";
  const desc = state?.description || "No additional info.";

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-900 text-white px-6">
      <h1 className="text-2xl font-semibold mb-4">Authentication Failed</h1>
      <p className="font-mono text-red-400 mb-2">error: {err}</p>
      <p className="text-sm opacity-80 mb-6">{desc}</p>
      <Link to="/" className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded">
        Try Again
      </Link>
    </div>
  );
};

export default AuthError;
