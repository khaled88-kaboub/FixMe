import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./InterventionAnnulerPage.css";

const InterventionAnnulerPage = () => {
  const [interventions, setInterventions] = useState([]);
  const [filteredInterventions, setFilteredInterventions] = useState([]);
  const [lignes, setLignes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLigne, setSelectedLigne] = useState("");

  useEffect(() => {
    // charger lignes + interventions
    fetchLignes();
    fetchInterventions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLignes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/lignes");
      setLignes(res.data || []);
    } catch (err) {
      console.error("Erreur fetchLignes", err);
      toast.error("Erreur lors du chargement des lignes");
    }
  };

  const fetchInterventions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/interventions");
      const filtered = (res.data || []).filter(
        (i) => i.statut !== "annule" && i.statut !== "termine"
      );
      setInterventions(filtered);
      setFilteredInterventions(filtered);
    } catch (err) {
      console.error("Erreur fetchInterventions", err);
      toast.error("Erreur lors du chargement des interventions");
    } finally {
      setLoading(false);
    }
  };

  // fonction de filtrage stable (useCallback pour éviter recreation)
  const applyFilters = useCallback(() => {
    let result = [...interventions];

    // Filtre date debut
    if (startDate) {
      const start = new Date(startDate);
      result = result.filter((i) => {
        if (!i.createdAt) return false;
        return new Date(i.createdAt) >= start;
      });
    }

    // Filtre date fin (inclusif)
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((i) => {
        if (!i.createdAt) return false;
        return new Date(i.createdAt) <= end;
      });
    }

    // Filtre ligne : gérer ligne stockée comme objet { _id } ou comme string id
    if (selectedLigne && selectedLigne !== "") {
      result = result.filter((i) => {
        const ligneVal = i.ligne;
        if (!ligneVal) return false;
        // si ligne est objet
        if (typeof ligneVal === "object") {
          // normaliser to string
          const lid = ligneVal._id ? String(ligneVal._id) : "";
          return lid === String(selectedLigne);
        }
        // si ligne est directement une string id
        return String(ligneVal) === String(selectedLigne);
      });
    }

    setFilteredInterventions(result);
  }, [interventions, startDate, endDate, selectedLigne]);

  // Appliquer filtres automatiquement quand interventions ou un filtre change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Annuler
  const cancelIntervention = async (id, numero) => {
    if (!window.confirm(`Voulez-vous vraiment annuler l’intervention ${numero} ?`))
      return;

    try {
      await axios.put(`http://localhost:5000/api/interventions/${id}`, {
        statut: "annule",
      });
      toast.success(`Demande ${numero} annulée`);
      // recharger liste après annulation
      fetchInterventions();
    } catch (err) {
      console.error("Erreur annulation", err);
      toast.error("Erreur lors de l’annulation");
    }
  };

  if (loading) return <p className="loading-text">Chargement...</p>;

  return (
    <div className="cancel-page">
      <ToastContainer />

      <h2 className="page-title">Annuler une demande d’intervention</h2>
      <div className="sectionb-underlineb"></div>

      {/* FILTRES */}
      <div className="filters">
        <div>
          <label>Date début :</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label>Date fin :</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div>
          <label>Ligne :</label>
          <select
            value={selectedLigne}
            onChange={(e) => setSelectedLigne(e.target.value)}
          >
            <option value="">Toutes</option>
            {lignes.map((ligne) => (
              <option key={ligne._id} value={String(ligne._id)}>
                {ligne.nom}
              </option>
            ))}
          </select>
        </div>

        {/* bouton reset optionnel */}
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          {/*<button
            type="button"
            className="btn-reset-filters"
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setSelectedLigne("");
            }}
          >
            Réinitialiser
          </button> */}
        </div>
      </div>

      {/* TABLEAU */}
      <table className="cancel-table">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Ligne</th>
            <th>Équipement</th>
            <th>Demandeur</th>
            <th>Statut</th>
            <th>Date Création</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filteredInterventions.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                Aucune intervention trouvée.
              </td>
            </tr>
          ) : (
            filteredInterventions.map((i) => (
              <tr key={i._id}>
                <td data-label="Numéro :">{i.numero}</td>
                <td data-label="Ligne :">{i.ligne?.nom || i.ligne || "-"}</td>
                <td data-label="Équipement :">{i.equipement?.designation || "-"}</td>
                <td data-label="Demandeur :">{i.demandeurNom || "-"}</td>
                <td data-label="Statut :">{i.statut}</td>
                <td data-label="Date création :">
                  {i.createdAt ? new Date(i.createdAt).toLocaleString() : "-"}
                </td>
                <td data-label="Action :">
                  <button
                    className="btn-cancel"
                    onClick={() => cancelIntervention(i._id, i.numero)}
                  >
                    Annuler
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ToastContainer />
    </div>
  );
};

export default InterventionAnnulerPage;
