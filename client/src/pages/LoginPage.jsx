import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./AuthPage.css";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 👉 login gère déjà la redirection selon le rôle
      await login(form.email, form.password);
    } catch (err) {
      console.error("Erreur de connexion :", err);
      setError("Email ou mot de passe incorrect.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container fade in">
        <h4 className="auth-title">Connexion à FixMe-dz</h4>
        <form onSubmit={handleSubmit}>
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
          <button type="submit">Se connecter </button>
        </form>
        {error && <p className="auth-message">{error}</p>}
        <p className="auth-switch">
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
