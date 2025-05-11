import { Link, useLocation } from "react-router-dom";

const AuthError = () => {
  const { state }   = useLocation();
  const code        = state?.errorCode  || "unknown_error";
  const description = state?.errorText  || "No additional information.";

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-900 text-white">
      <h1 className="text-2xl font-semibold mb-4">Authorization failed</h1>

      <div className="bg-zinc-800 p-4 rounded mb-6 w-80 text-sm break-all">
        <p><span className="text-green-400">error</span>: {code}</p>
        <p><span className="text-green-400">description</span>: {description}</p>
      </div>

      <Link to="/" className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded">
        Try again
      </Link>
    </div>
  );
};

export default AuthError;
