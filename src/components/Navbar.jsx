import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaSave, FaTools, FaFilter, FaUndo } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
 


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand"> FixMe-dz</div>
      
      {user && (
        <div className="navbar-links">
          
          <div className="nav-info">
          <span className="nav-name"> {user.name }</span>
          <span className="nav-role"> {user.role }</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      )}
    </nav>
  );
}
