import { useState } from "react";
import { FaBars, FaTimes, FaTools, FaChartPie, FaClipboardCheck, FaUser } from "react-icons/fa";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./MenuProductionPage.css";

export default function MenuMethodePage() {
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
        <h3 className="sidebar-title">Méthodes</h3>
        <ul>
          <li >
            <Link to="status" onClick={() => setOpen(!open)}>
              <FaTools /> Update-Status-DI
            </Link>
          </li>
          <li >
            <Link to="tous" className="last" onClick={() => setOpen(!open)}>
            <FaBars /> DI & rapports
            </Link>
          </li>
          <li >
            <Link to="arret" onClick={() => setOpen(!open)}>
              <FaUser /> Analyse & KPI
            </Link>
          </li>
          <li>
            <Link to="arret2" onClick={() => setOpen(!open)} >
              <FaChartPie /> Analyse & KPI Equipements
            </Link>
          </li>
          <li >
            <Link to="intervenant-stat" onClick={() => setOpen(!open)}>
              <FaUser /> Performance Techniciens
            </Link>
          </li>

          <li>
            <Link to="rapp" onClick={() => setOpen(!open)}>
              <FaClipboardCheck /> Rapports d'interventions
            </Link>
          </li>
          
          <li >
            <Link to="compteurs/releve" onClick={() => setOpen(!open)}>
              <FaUser /> Ajouter Releve Compteur
            </Link>
          </li>
          <li >
            <Link to="compteurs" onClick={() => setOpen(!open)}>
              <FaUser /> Liste Releves Compteur
            </Link>
          </li>
          <li >
            <Link to="mpcalendarP" className="prev" onClick={() => setOpen(!open)}>
              <FaTools /> Planing Préventif
            </Link>
          </li>

          <li >
            <Link to="mpcalendarR" className="prev" onClick={() => setOpen(!open)}>
              <FaTools /> Réalisation Préventive
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
