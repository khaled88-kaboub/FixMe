import "./AuthPage.css";
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
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
      const res = await axios.post("https://fixme-1.onrender.com/api/auth/register", form);

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
      </div>
      
    </div>
  );
}

