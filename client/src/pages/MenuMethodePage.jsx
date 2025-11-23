import { useState } from "react";
import { FaBars, FaTimes, FaTools, FaClipboardCheck, FaUser } from "react-icons/fa";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./MenuProductionPage.css";

export default function MenuMethodePage() {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="menu-page">
      {/* Bouton toggle */}
      <button className="toggle-btn" onClick={() => setOpen(!open)}>
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "open" : "closed"}`}>
        <h2 className="sidebar-title">Méthodes</h2>
        <ul>
          <li >
            <Link to="lignes" className="gestion">
              <FaIndustry /> Gestion des lignes
            </Link>
          </li>
          <li >
            <Link to="equipements" className="gestion">
              <FaBoxes /> Gestion des équipements
            </Link>
          </li>
          <li >
            <Link to="techniciens" className="gestion">
              <FaUserFriends /> Gestion du personnel
            </Link>
          </li>
          <li >
            <Link to="status">
              <FaTools /> Update-Status-DI
            </Link>
          </li>
          <li >
            <Link to="arret">
              <FaUser /> Analyse & KPI
            </Link>
          </li>
          <li >
            <Link to="intervenant-stat">
              <FaUser /> Performance Techniciens
            </Link>
          </li>
        </ul>
      </aside>

      {/* Contenu dynamique */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
