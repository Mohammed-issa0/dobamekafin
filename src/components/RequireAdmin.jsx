import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/admin";

export default function RequireAdmin({ children }) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;
  if (!isAdmin(user)) return <Navigate to="/" replace />;

  return children;
}
