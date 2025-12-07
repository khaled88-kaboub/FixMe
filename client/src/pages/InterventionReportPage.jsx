import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import "./InterventionReportPage.css";

const InterventionReportPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [interventions, setInterventions] = useState([]);
  const [techniciens, setTechniciens] = useState([]);

  const [formData, setFormData] = useState({
    intervention: "",
    dateIntervention: new Date().toISOString().split("T")[0],
    descriptionTravaux: "",
    piecesRemplacees: [{ nom: "", quantite: 1 }],
    commentaires: "",
    techniciens: [{ technicien: "", dureeMinutes: 0 }]
  });

  const location = useLocation();
  const { interventionId } = location.state || {};

  // Charger interventions et techniciens
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [intervRes, techRes] = await Promise.all([
          axios.get(`${API_URL}/api/interventions`),
          axios.get(`${API_URL}/api/techniciens`)
        ]);
        setInterventions(intervRes.data);
        setTechniciens(techRes.data);
      } catch (err) {
        console.error("Erreur de chargement :", err);
      }
    };
    fetchData();
  }, []);

  // Ajouter pièce ou technicien
  const addPiece = () => {
    setFormData({
      ...formData,
      piecesRemplacees: [...formData.piecesRemplacees, { nom: "", quantite: 1 }]
    });
  };

  const addTechnicien = () => {
    setFormData({
      ...formData,
      techniciens: [...formData.techniciens, { technicien: "", dureeMinutes: 0 }]
    });
  };

  // Gestion des changements
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePieceChange = (index, field, value) => {
    const updated = [...formData.piecesRemplacees];
    updated[index][field] = value;
    setFormData({ ...formData, piecesRemplacees: updated });
  };

  const handleTechnicienChange = (index, field, value) => {
    const updated = [...formData.techniciens];
    updated[index][field] = value;
    setFormData({ ...formData, techniciens: updated });
  };

  // Enregistrer le rapport
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formattedData = {
        intervention: interventionId,
        dateIntervention: formData.dateIntervention,
        descriptionTravaux: formData.descriptionTravaux,
        piecesRemplacees: formData.piecesRemplacees.filter(
          (p) => p.nom && p.quantite > 0
        ),
        commentaires: formData.commentaires,
        techniciens: formData.techniciens
          .filter((t) => t.technicien && t.dureeMinutes > 0)
          .map((t) => ({
            technicien: t.technicien,
            dureeMinutes: Number(t.dureeMinutes),
          })),
      };

      await axios.post(`${API_URL}/api/rapports`, formattedData);
      
      //window.location.reload();
      toast.success("✅ Rapport Intervention enregistrée !");
    } catch (err) {
      console.error("❌ Erreur lors de l'enregistrement :", err);
      alert("Erreur lors de l'enregistrement du rapport !");
    }
  };

  return (
    <div className="intervention-container">
      <h3 className="title">📋 Rapport d’Intervention</h3>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          <div className="intervention-info">
            {(() => {
              const intervention = interventions.find((i) => i._id === interventionId);
              return intervention
                ? `${intervention.numero} — ${intervention.ligne?.nom || ""} — ${intervention.equipement?.designation || ""} — ${intervention.equipement?.code || ""}`
                : "Aucune intervention sélectionnée";
            })()}
          </div>

          <input
            type="date"
            name="dateIntervention"
            value={formData.dateIntervention}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <textarea
          name="descriptionTravaux"
          placeholder="Description des travaux..."
          value={formData.descriptionTravaux}
          onChange={handleChange}
          required
          className="textarea"
        />

        <h3 className="section-title">🧰 Pièces remplacées</h3>
        {formData.piecesRemplacees.map((p, idx) => (
          <div key={idx} className="row">
            <input
              type="text"
              placeholder="Nom de la pièce"
              value={p.nom}
              onChange={(e) => handlePieceChange(idx, "nom", e.target.value)}
              className="input flex-1"
            />
            <input
              type="number"
              min="1"
              value={p.quantite}
              onChange={(e) =>
                handlePieceChange(idx, "quantite", parseInt(e.target.value))
              }
              className="input small"
            />
          </div>
        ))}
        <button type="button" onClick={addPiece} className="btn-link">
          + Ajouter une pièce
        </button>

        <h3 className="section-title">👷 Techniciens</h3>
        {formData.techniciens.map((t, idx) => (
          <div key={idx} className="row">
            <select
              value={t.technicien}
              onChange={(e) =>
                handleTechnicienChange(idx, "technicien", e.target.value)
              }
              className="input flex-1"
            >
              <option value="">-- Choisir technicien --</option>
              {techniciens.map((tech) => (
                <option key={tech._id} value={tech._id}>
                  {tech.nom} {tech.prenom}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              placeholder="Durée (min)"
              value={t.dureeMinutes}
              onChange={(e) =>
                handleTechnicienChange(idx, "dureeMinutes", e.target.value)
              }
              className="input small"
            />
          </div>
        ))}
        <button type="button" onClick={addTechnicien} className="btn-link">
          + Ajouter un technicien
        </button>

        <textarea
          name="commentaires"
          placeholder="Commentaires..."
          value={formData.commentaires}
          onChange={handleChange}
          className="textarea"
        />

        <button type="submit" className="btn-submit">
          💾 Enregistrer le rapport
        </button>
      </form>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default InterventionReportPage;
