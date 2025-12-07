import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Didetails.css";

const Didetails = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntervention, setSelectedIntervention] = useState(null); // 🔹 Intervention pour modal

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/interventions`);
        const filtered = res.data.filter(
          (i) => i.statut === "ouvert" ||
           i.statut === "en_cours"
        );
        setInterventions(filtered);
        setLoading(false);
      } catch (err) {
        console.error("Erreur chargement interventions :", err);
      }
    };
    fetchInterventions();
  }, []);

  const handleStart = async (id) => {
    try {
      await axios.put(`${API_URL}/api/interventions/${id}`, {
        statut: "en_cours",
      });
      setInterventions((prev) =>
        prev.map((i) => (i._id === id ? { ...i, statut: "en_cours" } : i))
      );
    } catch (err) {
      console.error("Erreur lors du changement de statut :", err);
    }
  };

  const handleReport = (id, statut) => {
    if (statut !== "en_cours") return;
    window.location.href = "/InterventionReportPage";
  };

  const handleCloseModal = () => setSelectedIntervention(null);

  if (loading) return <p className="loading-text">Chargement...</p>;

  return (
    <div className="dashboard-wrapper">
      <h1 className="page-title">Demandes d’intervention</h1>

      <div className="intervention-grid">
        {interventions.map((item) => (
          <div className="intervention-card" key={item._id}>
            <div className={`status-badge ${item.statut}`}>
              {item.statut.toUpperCase()}
            </div>

            <h3>{item.equipement?.code || "Équipement inconnu"}</h3>
            <p><strong>Désignation :</strong> {item.equipement?.designation}</p>
            <p><strong>Ligne :</strong> {item.ligne?.nom}</p>
            <p><strong>DI Créée le :</strong> {new Date(item.createdAt).toLocaleString()}</p>
            <p><strong>Demandeur :</strong> {item.demandeurNom}</p>
            <p><strong>Numéro DI :</strong> {item.numero}</p>

            <div className="btn-group">
              <button className="btn btn-detail" onClick={() => setSelectedIntervention(item)}>
                Voir détails
              </button>

              {item.statut === "ouvert" && (
                <button className="btn btn-start" onClick={() => handleStart(item._id)}>
                  Recevoir DI
                </button>
              )}

              <button
                className="btn btn-report"
                disabled={item.statut !== "en_cours"}
                onClick={() => handleReport(item._id, item.statut)}
              >
                Renseigner le rapport
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- Modal --- */}
      {selectedIntervention && (
  <div className="modal-overlay modal-show" onClick={handleCloseModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={handleCloseModal}>
        &times;
      </button>
      <h2>Détails de l'intervention</h2>
      <p><strong>Numéro DI :</strong> {selectedIntervention.numero}</p>
      <p><strong>Statut :</strong> {selectedIntervention.statut}</p>
      <p><strong>Ligne :</strong> {selectedIntervention.ligne?.nom}</p>
      <p><strong>Équipement :</strong> {selectedIntervention.equipement?.designation} ({selectedIntervention.equipement?.code})</p>
      <p><strong>Date création :</strong> {new Date(selectedIntervention.createdAt).toLocaleString()}</p>
      <p><strong>Demandeur :</strong> {selectedIntervention.demandeurNom}</p>
      <p><strong>Description anomalie :</strong> {selectedIntervention.descriptionAnomalie}</p>
      <p><strong>Articles consommés :</strong> {selectedIntervention.articles?.map(a => a.nom).join(", ") || "Aucun"}</p>
      <p><strong>Intervenants :</strong> {selectedIntervention.intervenants?.map(i => `${i.nom} (${i.duree})`).join(", ") || "Aucun"}</p>
      <p><strong>Remarques :</strong> {selectedIntervention.remarques || "Aucune"}</p>
      <p><strong>Date démarrage équipement :</strong> {selectedIntervention.dateHeureDemarrageEquipement || "Non renseigné"}</p>
      <p><strong>Date démarrage ligne :</strong> {selectedIntervention.dateHeureDemarrageLigne || "Non renseigné"}</p>
    </div>
  </div>
)}
      
    </div>
  );
};

export default Didetails;
