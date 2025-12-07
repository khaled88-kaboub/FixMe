import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  // Pendant le chargement du contexte
  if (loading) return <div>Chargement...</div>;

  // Si pas connecté → redirection vers /login
  if (!user) return <Navigate to="/login" replace />;

  // Si le rôle de l'utilisateur n'est pas autorisé → page d'accueil ou erreur
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Sinon, il peut accéder à la page
  return children;
}