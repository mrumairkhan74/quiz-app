import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_BACKEND_URI;

const ProtectedRoute = ({ isLoggedIn, setIsLoggedIn, children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${apiUrl}/user/me`, { withCredentials: true }) // ✅ must be GET
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false))
      .finally(() => setLoading(false));
  }, [setIsLoggedIn]);

  if (loading) {
    return <p>Checking session...</p>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
