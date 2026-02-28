import { useState } from "react";
import { FaBars, FaTimes, FaTools, FaClipboardCheck, FaTrash, FaBeer } from "react-icons/fa";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./MenuProductionPage.css";

export default function MenuInventairePage() {
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
        <h3 className="sidebar-title">Inventaire</h3>
        <ul>
          <li>
            <Link to="inventaire" onClick={() => setOpen(!open)}>
              <FaTools /> Inventaire Equipements
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
