import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MaintenanceGridPage.css";

const MaintenanceGridPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [interventions, setInterventions] = useState([]);
  const [filteredInterventions, setFilteredInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    ligne: "",
    equipement: "",
    dateDebut: "",
    dateFin: "",
    statut: "",
  });

  const navigate = useNavigate();

  // Charger les interventions
  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/interventions`);
        const filtered = res.data.filter(
          (i) =>
            i.statut === "ouvert" ||
            i.statut === "en_cours"
        );
        setInterventions(filtered);
        setFilteredInterventions(filtered);
      } catch (err) {
        console.error("Erreur chargement interventions :", err);
        toast.error("Erreur chargement interventions (voir console)");
      } finally {
        setLoading(false);
      }
    };
    fetchInterventions();
  }, []);

  // 🧠 Fonction de filtrage local
  const applyFilters = () => {
    let result = [...interventions];

    if (filters.ligne)
      result = result.filter((i) => i.ligne?.nom === filters.ligne);

    if (filters.equipement)
      result = result.filter(
        (i) => i.equipement?.code === filters.equipement
      );

    if (filters.statut)
      result = result.filter((i) => i.statut === filters.statut);

    if (filters.dateDebut)
      result = result.filter(
        (i) =>
          new Date(i.createdAt) >= new Date(filters.dateDebut)
      );

    if (filters.dateFin)
      result = result.filter(
        (i) => new Date(i.createdAt) <= new Date(filters.dateFin)
      );

    setFilteredInterventions(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Recevoir une DI
  const handleStart = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/api/interventions/${id}`, {
        statut: "en_cours",
      });
  
      const updated = res.data;
  
      // Mettre à jour la liste principale
      setInterventions((prev) => {
        const newList = prev.map((i) =>
          i._id === id ? { ...i, statut: "en_cours" } : i
        );
        // Réappliquer les filtres ici directement
        const newFiltered = newList.filter((i) => {
          let ok = true;
          if (filters.ligne) ok = ok && i.ligne?.nom === filters.ligne;
          if (filters.equipement) ok = ok && i.equipement?.code === filters.equipement;
          if (filters.statut) ok = ok && i.statut === filters.statut;
          if (filters.dateDebut) ok = ok && new Date(i.createdAt) >= new Date(filters.dateDebut);
          if (filters.dateFin) ok = ok && new Date(i.createdAt) <= new Date(filters.dateFin);
          return ok;
        });
        setFilteredInterventions(newFiltered);
        return newList;
      });
  
      toast.success("✅ DI reçue — statut passé en EN_COURS");
    } catch (err) {
      console.error("Erreur lors du changement de statut :", err);
      toast.error("❌ Erreur lors du changement de statut (voir console)");
    }
  };
  
  

  // Aller au rapport
  const handleReport = (id, statut) => {
    if (statut !== "en_cours" && statut !== "en cours") {
      toast.info(
        "Vous devez d'abord recevoir la DI (mettre en 'en_cours')."
      );
      return;
    }

    navigate(`/menumaintenancepage/intervention/${id}`, {
      state: { interventionId: id },
    });
  };

  // Modale
  const handleOpenModal = (item) => { 
  console.log("item selectionné :", item)
  setSelected(item)}

  if (loading) return <p className="loading-text">Chargement...</p>;

  return (
    <div className="dashboard-wrapper">
      <h1 className="page-title">Demandes d’intervention</h1>

      {/* 🔍 Barre de filtres */}
      <div className="filters-bar">
        <div className="filters1">
          <div>
          <select name="ligne" value={filters.ligne} onChange={handleFilterChange}>
            <option value="">-- Ligne --</option>
            {[...new Set(interventions.map((i) => i.ligne?.nom))].map(
              (ligne, idx) =>
                ligne && (
                  <option key={idx} value={ligne}>
                    {ligne}
                  </option>
                )
            )}
          </select>
          </div>
          <div>
          <select
            name="equipement"
            value={filters.equipement}
            onChange={handleFilterChange}
          >
            <option value="">-- Équipement --</option>
            {[...new Set(interventions.map((i) => i.equipement?.code))].map(
              (eq, idx) =>
                eq && (
                  <option key={idx} value={eq}>
                    {eq}
                  </option>
                )
            )}
          </select>
          </div>

         

          <input
            type="date"
            name="dateDebut"
            value={filters.dateDebut}
            onChange={handleFilterChange}
          />

          <input
            type="date"
            name="dateFin"
            value={filters.dateFin}
            onChange={handleFilterChange}
          />

          <select
            name="statut"
            value={filters.statut}
            onChange={handleFilterChange}
          >
            <option value="">-- Statut --</option>
            <option value="ouvert">Ouvert</option>
            <option value="en_cours">En cours</option>
          </select>

          <button onClick={applyFilters}>Filtrer</button>
        </div>
      </div>

      {/* 🧾 Grille */}
      <div className="intervention-grid">
        {filteredInterventions.length === 0 && (
          <p style={{ gridColumn: "1/-1", textAlign: "center" }}>
            Aucune DI trouvée avec ces filtres.
          </p>
        )}

        {filteredInterventions.map((item) => (
          <div className="intervention-card" key={item._id}>
            <div className={`status-badge ${item.statut?.replace(" ", "_") || "unknown"}`}>
              {String(item.statut).toUpperCase()}
            </div>
            <h5 className="col2">{item.demandeurNom}</h5>
            <h3 className="col1">{item.numero || "-"}</h3>
            <h3 className="col1">{item.ligne?.nom || "Équipement inconnu"}</h3>
            <h4 className="col2">{item.equipement?.code || "Équipement inconnu"}</h4>
           
            <p><strong>Désignation :</strong> {item.equipement?.designation || "-"}</p>
            
            <p><strong>DI Créée le :</strong> {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}</p>
          
            
           

            <div className="btn-group1">
              <button type="button" className="bouton-detail" onClick={() => handleOpenModal(item)}>
                Voir détails
              </button>

              {item.statut === "ouvert" || item.statut === "OUVERT" ? (
                <button type="button" className="bouton-start" onClick={() => handleStart(item._id)}>
                  Recevoir DI
                </button>
              ) : null}

              <button
                type="button"
                className="bouton-report"
                disabled={!(item.statut === "en_cours" || item.statut === "EN_COURS" || item.statut === "en cours")}
                onClick={() => handleReport(item._id, item.statut)}
              >
                Renseigner le rapport
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODALE */}
     {selected && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.7)",
      color: "black",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999999,
    }}
    onClick={() => setSelected(null)}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "12px",
        width: "80%",
        maxWidth: "600px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h2>Détails DI : {selected.numero || selected._id}</h2>
      
            <p><strong>Ligne :</strong> {selected.ligne?.nom || "-"}</p>
            <p><strong>Équipement :</strong> {selected.equipement?.designation || "-"} ({selected.equipement?.code || "-"})</p>
            <p><strong>Demandeur :</strong> {selected.demandeurNom || selected.demandeur || "-"}</p>
            <p><strong>Description :</strong> {selected.descriptionAnomalie || "-"}</p>
            <p><strong>Statut :</strong> {selected.statut || "-"}</p>
            <p><strong>Créée le :</strong> {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "-"}</p>
            <p><strong className="neutre">Arrêt ligne :</strong> {String(selected.ligneAsubiArret ?? "false")}</p>
            <p><strong className="rouge">Date & Heure Arrêt ligne :</strong> {selected.dateHeureArretLigne ? selected.dateHeureArretLigne.replace('T', ' ').slice(0, 16) : "-"}</p>
            <p><strong className="vert">Date & Heure Démarrage ligne :</strong> {selected.dateHeureDemarrageLigne ? selected.dateHeureDemarrageLigne.replace('T', ' ').slice(0, 16) : "-"}</p>
            
            <p><strong className="neutre">Arrêt equipement :</strong> {String(selected.equipementAsubiArret ?? "false")}</p>
            <p><strong className="rouge">Date & Heure Arrêt equipement :</strong> {selected.dateHeureArretEquipement ? selected.dateHeureArretEquipement.replace('T', ' ').slice(0, 16) : "-"}</p>
            <p><strong className="vert">Date & Heure Démarrage equipement :</strong> {selected.dateHeureDemarrageEquipement ? selected.dateHeureDemarrageEquipement.replace('T', ' ').slice(0, 16) : "-"}</p>
      
      {/* =================================================== */}
  {/* DESSIN / FRISE CHRONOLOGIQUE DE L'ARRÊT LIGNE       */}
  {/* =================================================== */}
  {selected.ligneAsubiArret && selected.dateHeureArretLigne && selected.dateHeureDemarrageLigne && (
    <div style={{ marginTop: "20px", padding: "15px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
      <p style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#64748b", marginBottom: "8px", textAlign: "center", textTransform: "uppercase" }}>
        Chronométrie de l'Arrêt Ligne
      </p>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", margin: "25px 10px 10px 10px" }}>
        {/* Ligne horizontale */}
        <div style={{ position: "absolute", top: "50%", left: "0", right: "0", height: "4px", backgroundColor: "#ef4444", transform: "translateY(-50%)", zIndex: 1 }}></div>
        
        {/* Point de départ (Arrêt) */}
        <div style={{ zIndex: 2, background: "#ffffff", padding: "0 5px", textAlign: "left" }}>
          <span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ef4444", marginRight: "5px" }}></span>
          <strong style={{ fontSize: "0.85rem", color: "#ef4444" }}>Arrêt</strong>
          <div style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: "600" }}>
            {selected.dateHeureArretLigne.replace('T', ' ').slice(0, 16)}
          </div>
        </div>

        {/* Badge durée au centre */}
        <div style={{ zIndex: 3, background: "#1e293b", color: "#ffffff", padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          ⏱️ {(() => {
            const start = new Date(selected.dateHeureArretLigne);
            const end = new Date(selected.dateHeureDemarrageLigne);
            const diffMs = end - start;
            if (isNaN(diffMs) || diffMs < 0) return "Durée invalide";
            const diffMins = Math.floor(diffMs / 60000);
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            return hours > 0 ? `${hours}h ${mins}min` : `${diffMins} min`;
          })()}
        </div>

        {/* Point d'arrivée (Démarrage) */}
        <div style={{ zIndex: 2, background: "#ffffff", padding: "0 5px", textAlign: "right" }}>
          <div style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: "600" }}>
            {selected.dateHeureDemarrageLigne.replace('T', ' ').slice(0, 16)}
          </div>
          <strong style={{ fontSize: "0.85rem", color: "#10b981" }}>Démarrage</strong>
          <span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#10b981", marginLeft: "5px" }}></span>
        </div>
      </div>
    </div>
  )}

      <button className="btn-mod" onClick={() => setSelected(null)}>Fermer</button>
    </div>
  </div>
)}
<ToastContainer position="top-center" autoClose={2000} />

    </div> 
  );
};

export default MaintenanceGridPage;
