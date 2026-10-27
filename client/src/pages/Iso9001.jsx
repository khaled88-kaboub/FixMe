import React, { useState } from "react";
import axios from "axios";
import { 
  FaBookOpen, 
  FaSitemap, 
  FaExclamationTriangle, 
  FaChartLine 
} from "react-icons/fa";
import "./Iso9001.css";
// Importez vos composants respectifs (assurez-vous que les chemins d'accès sont corrects)
import ProcessCoverPage from './ProcessCoverPage'; // Fiche / Page de garde
import ProcessLogigrammePage from './ProcessLogigrammePage'; // Logigramme
import ProcessRisques from './ProcessRisques';     // Matrice des risques
import ProcessIndicators from './ProcessIndicators' // Indicateurs KPI

export default function Iso9001  ()  {
  // État pour gérer l'onglet actif ('garde', 'logigramme', 'risques', 'indicateurs')
  const [activeTab, setActiveTab] = useState("garde");

  return (
    <div className="iso9001-container">
      {/* En-tête global */}
      <div className="iso9001-header">
        <h1>Système de Management de la Qualité (SMQ)</h1>
        <p>Norme ISO 9001 V2015 • Processus Maintenance (PRC-MNT-01-V03)</p>
      </div>

      {/* Menu de Navigation / Onglets */}
      <div className="iso-tabs-nav">
        <button 
          className={`iso-tab-btn ${activeTab === "garde" ? "active" : ""}`}
          onClick={() => setActiveTab("garde")}
        >
          <FaBookOpen /> Fiche de Processus
        </button>

        <button 
          className={`iso-tab-btn ${activeTab === "logigramme" ? "active" : ""}`}
          onClick={() => setActiveTab("logigramme")}
        >
          <FaSitemap /> Logigramme
        </button>

        <button 
          className={`iso-tab-btn ${activeTab === "indicateurs" ? "active" : ""}`}
          onClick={() => setActiveTab("indicateurs")}
        >
          <FaChartLine /> Indicateurs KPI
        </button>
        <button 
          className={`iso-tab-btn ${activeTab === "risques" ? "active" : ""}`}
          onClick={() => setActiveTab("risques")}
        >
          <FaExclamationTriangle /> Matrice des Risques
        </button>

       
      </div>

      {/* Contenu dynamique selon l'onglet sélectionné */}
      <div className="iso-tab-content">
      {activeTab === "garde" && <ProcessCoverPage />}
      {activeTab === "risques" && <ProcessRisques />}
      {activeTab === "indicateurs" && <ProcessIndicators />}
      {activeTab === "logigramme" && <ProcessLogigrammePage />}
      </div>
      
      
    </div>
  );
};


