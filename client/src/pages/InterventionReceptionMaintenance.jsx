import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./InterventionReceptionMaintenance.css";

const InterventionReceptionMaintenance = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [interventions, setInterventions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rapportCounts, setRapportCounts] = useState({});

  const [filters, setFilters] = useState({
    ligne: "",
    equipement: "",
    numero: "",
    demandeurNom: "",
    dateDebut: "",
    dateFin: "",
  });

  // 📦 Charger interventions et rapports
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [interRes, rapportRes] = await Promise.all([
          axios.get(`${API_URL}/api/interventions`),
          axios.get(`${API_URL}/api/rapports`),
        ]);

        const intervs = interRes.data;
        const rapports = rapportRes.data;

        // 🔢 Compter les rapports par intervention
        const counts = {};
        rapports.forEach((r) => {
          const id = r.intervention?._id || r.intervention;
          if (id) counts[id] = (counts[id] || 0) + 1;
        });

        setRapportCounts(counts);
        setInterventions(intervs);
        setFiltered(intervs);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔍 Appliquer les filtres
  const applyFilters = () => {
    let temp = interventions;

    if (filters.ligne)
      temp = temp.filter((i) =>
        i.ligne?.nom?.toLowerCase().includes(filters.ligne.toLowerCase())
      );

    if (filters.equipement)
      temp = temp.filter((i) =>
        i.equipement?.designation
          ?.toLowerCase()
          .includes(filters.equipement.toLowerCase())
      );

      if (filters.demandeurNom)
      temp = temp.filter((i) =>
        i.demandeurNom?.toLowerCase().includes(filters.demandeurNom.toLowerCase())
      );

    if (filters.numero)
      temp = temp.filter((i) =>
        i.numero?.toLowerCase().includes(filters.numero.toLowerCase())
      );

    if (filters.dateDebut)
      temp = temp.filter(
        (i) => new Date(i.createdAt) >= new Date(filters.dateDebut)
      );

    if (filters.dateFin)
      temp = temp.filter(
        (i) => new Date(i.createdAt) <= new Date(filters.dateFin)
      );

    setFiltered(temp);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, interventions]);

  // ✅ Clôture maintenance
  const handleCloture = async (item) => {
    if (!item) return;

    const nbRapports = rapportCounts[item._id] || 0;
    if (nbRapports === 0) {
      toast.warning(
        "Impossible de clôturer cette intervention : aucun rapport n’est associé !"
      );
      return;
    }

    try {
      await axios.put(`${API_URL}/api/interventions/${item._id}`, {
        clotureMaintenance: true,
      });

      toast.success("Clôture maintenance validée ✅");

      // 🔄 Mise à jour locale
      setInterventions((prev) =>
        prev.map((i) =>
          i._id === item._id ? { ...i, clotureMaintenance: true } : i
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading) return <p className="loading-text">Chargement...</p>;

  return (
    <div className="reception-page">
      <h2 className="page-titlef">Clôture des interventions</h2>

      {/* 🔍 Filtres avancés */}
      <div className="advanced-filters">
        <div className="toto">
        <input
          type="text"
          placeholder="Filtrer par ligne..."
          value={filters.ligne}
          onChange={(e) => setFilters({ ...filters, ligne: e.target.value })}
        />
        </div>
        <div className="toto">
        <input
          type="text"
          placeholder="Filtrer par équipement..."
          value={filters.equipement}
          onChange={(e) =>
            setFilters({ ...filters, equipement: e.target.value })
          }
        />
        </div>
        <div className="toto">
        <input
          type="text"
          placeholder="Filtrer par demandeur..."
          value={filters.demandeurNom}
          onChange={(e) =>
            setFilters({ ...filters, demandeurNom: e.target.value })
          }
        />
        </div>
        <div className="toto">
        <input
          type="text"
          placeholder="Numéro d’intervention..."
          value={filters.numero}
          onChange={(e) => setFilters({ ...filters, numero: e.target.value })}
        />
        </div>
        

        <div className="date-range">
          <label>Date 1:</label>
          <input
            type="date"
            value={filters.dateDebut}
            onChange={(e) =>
              setFilters({ ...filters, dateDebut: e.target.value })
            }
          />
        </div>
        <div className="date-range">
          <label>Date 2:</label>
          <input
            type="date"
            value={filters.dateFin}
            onChange={(e) =>
              setFilters({ ...filters, dateFin: e.target.value })
            }
          />
        </div>
      </div>

      {/* 📋 Tableau */}
      <table className="reception-table">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Demandeur</th>
            <th>Créé le</th>
            <th>Ligne</th>
            <th>Équipement</th>
            <th>Rapports</th>
            <th>Statut</th>
            <th>Date arrêt ligne</th>
            <th>Date arrêt équipement</th>
            <th>État</th>
            <th>Clôturer</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                Aucune intervention trouvée.
              </td>
            </tr>
          ) : (
            filtered.map((i) => (
              <tr key={i._id}>

                <td className="DI-decor" data-label="Numéro DI">{i.numero}</td>
                <td data-label="Demandeur">{i.demandeurNom || "-"}</td>
                <td data-label="Créé le">{new Date(i.createdAt).toLocaleString()}</td>
                <td data-label="Ligne">{i.ligne?.nom || "-"}</td>
                <td data-label="Equipement">{i.equipement?.designation || "-"}</td>
                <td data-label="Nombre de rapports associés">{rapportCounts[i._id] || 0}</td>
                <td data-label="Statut">{i.statut}</td>
                <td data-label="Date & Heure arret Ligne">{i.dateHeureArretLigne ? i.dateHeureArretLigne.replace('T', ' ').slice(0, 16) : "-"}</td>
                <td data-label = "Date & Heure arret Equipement">{i.dateHeureArretEquipement ? i.dateHeureArretEquipement.replace('T', ' ').slice(0, 16) : "-"}</td>
                
                <td data-label="Etat de validation">
                  {i.clotureMaintenance ? (
                    <span className="badge green">Validée</span>
                  ) : (
                    <span className="badge red">Non validée</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn-primary"
                    onClick={() => handleCloture(i)}
                    disabled={i.clotureMaintenance}
                  >
                    Clôturer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default InterventionReceptionMaintenance;