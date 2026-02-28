import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  


  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      // 🔹 Redirection automatique selon le rôle
      redirectUserByRole(data.user.role);
      return data;
    } catch (error) {
      console.error("Erreur de connexion :", error);
      alert("Échec de la connexion, vérifie ton email ou mot de passe.");
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  // 🔹 Fonction pour orienter selon le rôle
  const redirectUserByRole = (role) => {
    switch (role) {
      case "admin":
        navigate("/menuadminpage");
        break;
      case "maintenance":
        navigate("/menumaintenancepage");
        break;
      case "production":
        navigate("/menuproductionpage");
        break;
      case "methode":
        navigate("/menumethodepage");
        break;
        case "inventaire":
          navigate("/menuinventairepage");
          break;
      default:
        navigate("/");
        break;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
