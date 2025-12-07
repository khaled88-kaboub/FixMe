import { Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import "./UnauthorizedPage.css";

export default function UnauthorizedPage() {
  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <FaLock className="lock-icon" />
        <h2>Accès refusé</h2>
        <p>Vous n’avez pas la permission d’accéder à cette page.</p>
        <Link to="/" className="back-home">
          ⬅ Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
