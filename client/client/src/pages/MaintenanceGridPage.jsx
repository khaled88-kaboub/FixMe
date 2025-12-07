import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MaintenanceGridPage.css";

const MaintenanceGridPage = () => {
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
        const res = await axios.get("https://fixme-1.onrender.com/api/interventions");
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
      const res = await axios.put(`https://fixme-1.onrender.com/api/interventions/${id}`, {
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

            <h3>{item.equipement?.code || "Équipement inconnu"}</h3>
            <p><strong>Désignation :</strong> {item.equipement?.designation || "-"}</p>
            <p><strong>Ligne :</strong> {item.ligne?.nom || "-"}</p>
            <p><strong>DI Créée le :</strong> {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}</p>
            <p><strong>Demandeur :</strong> {item.demandeurNom || item.demandeur || "-"}</p>
            <p><strong>Numéro DI :</strong> {item.numero || "-"}</p>

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
            <p><strong>Arrêt ligne :</strong> {String(selected.ligneAsubiArret ?? "false")}</p>
            <p><strong>Date & Heure Arrêt ligne :</strong> {selected.dateHeureArretLigne ? new Date(selected.dateHeureArretLigne).toLocaleString() : "-"}</p>
            <p><strong>Arrêt equipement :</strong> {String(selected.equipementAsubiArret ?? "false")}</p>
            <p><strong>Date & Heure Arrêt equipement :</strong> {selected.dateHeureArretEquipement ? new Date(selected.dateHeureArretEquipement).toLocaleString() : "-"}</p>
      <button className="btn-mod" onClick={() => setSelected(null)}>Fermer</button>
    </div>
  </div>
)}
<ToastContainer position="top-center" autoClose={2000} />

    </div>
  );
};

export default MaintenanceGridPage;
