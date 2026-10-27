import "./AuthPage.css";
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import logo from '../assets/rmc.jpg';
// 📂 Importation du fichier de politique qualité depuis les assets
import qualiteFile from "../assets/politique.pdf"; // Mettez l'extension exacte (ex: .pdf, .png, .jpg)


export default function RegisterPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, form);

      if (res.status === 201) {
        setSuccess("Inscription réussie ! Redirection...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de l'inscription. Réessayez."
      );
    }
  };

  return (
    <div className="auth-page">
         
      <div className="auth-container fade in">
        <h2 className="auth-title">Créer un compte FixMe-dz</h2>
       
       {/* 🖼️ Image ronde sous le titre */}
       <div className="auth-avatar-container">
       <div className="auth-avatar-wrapper">
          <img 
            src={ logo } 
            alt="FixMe-dz Logo" 
            className="auth-avatar" 
          />
        </div>
        </div>
       
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit">S’inscrire</button>
        </form>

        {error && <p className="auth-message">{error}</p>}
        {success && <p className="auth-message" style={{ color: "#00ffb3" }}>{success}</p>}

        <p className="auth-switch">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
         <div className="auth-footer-divider"></div>

          {/* 📜 Lien Politique Qualité élégant */}
          <a href={qualiteFile} 
            target="_blank" 
            rel="noopener noreferrer" className="quality-policy-link">
            <svg 
              className="quality-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Politique Qualité</span>
          </a>
      </div>
      
    </div>
  );
}

