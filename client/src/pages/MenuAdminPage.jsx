import { useState } from "react";
import { FaBars, FaTimes, FaRobot, FaClipboardCheck, FaUser, FaLayerGroup, FaIndustry, FaTools, FaKeyboard, FaChartArea, FaChartLine, FaChartPie, FaPersonBooth, FaUserFriends, FaBoxes } from "react-icons/fa";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./MenuProductionPage.css";

export default function MenuAdminPage() {
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
        <h2 className="sidebar-title">Portail Admin</h2>
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
            <Link to="users" className="gestion">
              <FaUser /> Gestion des roles user
            </Link>
          </li>
          <li>
            <Link to="arret">
              <FaChartPie /> Analyse & KPI
            </Link>
          </li>
          
          <li >
            <Link to="intervenant-stat">
              <FaChartLine/> Performance Techniciens
            </Link>
          </li>
          <li >
            <Link to="rapport-interventions" className="last">
            <FaBars /> Liste rapportd DI
            </Link>
          </li>
          <li >
            <Link to="tous" className="last">
            <FaBars /> DI & rapports
            </Link>
          </li>
          <li >
            <Link to="demande-interventions" className="last">
            <FaBars /> Liste DI
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
