import { useState } from "react";
import { FaBars, FaTimes, FaTools, FaClipboardCheck, FaTrash, FaBeer } from "react-icons/fa";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./MenuProductionPage.css";

export default function MenuProductionPage() {
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
        <h2 className="sidebar-title">Production</h2>
        <ul>
          <li>
            <Link to="interventions">
              <FaTools /> Nouvelle Demande d'intervention
            </Link>
          </li>
          <li >
            <Link to="production-reception">
              <FaClipboardCheck /> Réceptionner Demande d'intervention
            </Link>
          </li>
          <li >
            <Link to="canceldi">
              <FaTrash /> Annuler Demande d'intervention
            </Link>
          </li>
          <li>
            <Link to="di">
              <FaClipboardCheck /> Mes Demandes d'intervention
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
