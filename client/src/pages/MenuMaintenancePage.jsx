import { useState } from "react";
import { FaBars, FaTimes, FaTools, FaClipboardCheck } from "react-icons/fa";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./MenuProductionPage.css";

export default function MenuMaintenancePage() {
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
        <h3 className="sidebar-title">Maintenance</h3>
        <ul>
          <li className={location.pathname.includes("/new") ? "active" : ""}>
            <Link to="grid" onClick={() => setOpen(!open)}>
              <FaTools /> Ajouter Rapport DI
            </Link>
          </li>
          <li className={location.pathname.includes("/reception") ? "active" : ""}>
            <Link to="maintenance-cloture" onClick={() => setOpen(!open)}>
              <FaClipboardCheck /> Cloturer DI
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
