import { useState } from "react";
import { FaBars, FaTimes, FaRobot, FaClipboardCheck, FaUser, FaLayerGroup, FaIndustry, FaTools, FaKeyboard, FaChartArea, FaChartLine, FaChartPie, FaPersonBooth, FaUserFriends, FaBoxes } from "react-icons/fa";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./MenuProductionPage.css";

export default function MenuAdminPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const closeMenu = () => {
    setOpen(false);
  };
  
  return (
    <div className="menu-page">
      {/* Bouton toggle */}
      <button className="toggle-btn" onClick={() => setOpen(!open)}>
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "open" : "closed"}`}>
        <h3 className="sidebar-title">Portail Admin</h3>
        <ul>
          <li >
            <Link to="lignes" className="gestion" onClick={closeMenu}>
              <FaIndustry /> Gestion des lignes
            </Link>
          </li>
          <li >
            <Link to="equipements" className="gestion" onClick={closeMenu}>
              <FaBoxes /> Gestion des équipements
            </Link>
          </li>
          <li >
            <Link to="fournisseurs" className="gestion" onClick={closeMenu}>
              <FaBoxes /> Gestion des prestataires
            </Link>
          </li>
          <li >
            <Link to="techniciens" className="gestion" onClick={closeMenu}>
              <FaUserFriends /> Gestion du personnel
            </Link>
          </li>
          <li >
            <Link to="users" className="gestion" onClick={closeMenu}>
              <FaUser /> Gestion des roles user
            </Link>
          </li>
          <li>
            <Link to="arret" onClick={closeMenu} >
              <FaChartPie /> Analyse & KPI
            </Link>
          </li>
          
          <li >
            <Link to="intervenant-stat" onClick={closeMenu}>
              <FaChartLine/> Performance Techniciens
            </Link>
          </li>
          <li >
            <Link to="rapport-interventions" className="last" onClick={closeMenu}>
            <FaBars /> Liste rapportd DI
            </Link>
          </li>
          <li >
            <Link to="tous" className="last">
            <FaBars /> DI & rapports
            </Link>
          </li>
          <li >
            <Link to="demande-interventions" className="last" onClick={closeMenu}>
            <FaBars /> Liste DI
            </Link>
          </li>
          <li >
            <Link to="compteurs/releve" onClick={closeMenu}>
              <FaUser /> Ajouter Releve Compteur
            </Link>
          </li>
          <li >
            <Link to="compteurs" onClick={closeMenu}>
              <FaUser /> Liste Releves Compteur
            </Link>
          </li>

          <li >
            <Link to="intervention_fournisseur" onClick={closeMenu}>
              <FaUser /> Prestations Service
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
