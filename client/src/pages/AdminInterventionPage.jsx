import { useState, useEffect } from "react";
import axios from "axios";
import "./AdminInterventionPage.css";
import { FaTools, FaTrashAlt, FaSearch, FaSync } from "react-icons/fa";

export default function AdminInterventionsPage() {
  const [interventions, setInterventions] = useState([]);
  const [filteredInterventions, setFilteredInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lignes, setLignes] = useState([]);
  const [equipements, setEquipements] = useState([]);

  // États des filtres
  const [filters, setFilters] = useState({
    date: "",
    statut: "",
    ligne: "",
    codeEquipement: "",
    numero: "",
    demandeur: "",
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, interventions]);

  // 🔄 Charger toutes les données
  const fetchAllData = async () => {
    try {
      const [intervRes, ligneRes, equipRes] = await Promise.all([
        axios.get("http://localhost:5000/api/interventions"),
        axios.get("http://localhost:5000/api/lignes"),
        axios.get("http://localhost:5000/api/equipements"),
      ]);

      setInterventions(intervRes.data);
      setFilteredInterventions(intervRes.data);
      setLignes(ligneRes.data);
      setEquipements(equipRes.data);
    } catch (err) {
      console.error("Erreur lors du chargement des données :", err);
    } finally {
      setLoading(false);
    }
  };

  // 🧮 Application des filtres
  const applyFilters = () => {
    let filtered = interventions;

    if (filters.numero)
      filtered = filtered.filter((i) =>
        i.numero.toLowerCase().includes(filters.numero.toLowerCase())
      );

    if (filters.demandeur)
      filtered = filtered.filter((i) =>
        i.demandeurNom?.toLowerCase().includes(filters.demandeur.toLowerCase())
      );

    if (filters.ligne)
      filtered = filtered.filter(
        (i) => i.ligne?._id === filters.ligne
      );

    if (filters.codeEquipement)
      filtered = filtered.filter(
        (i) => i.equipement?._id === filters.codeEquipement
      );

    if (filters.statut)
      filtered = filtered.filter(
        (i) => i.statut.toLowerCase() === filters.statut.toLowerCase()
      );

    if (filters.date)
      filtered = filtered.filter(
        (i) =>
          new Date(i.createdAt).toLocaleDateString("fr-FR") ===
          new Date(filters.date).toLocaleDateString("fr-FR")
      );

    setFilteredInterventions(filtered);
  };

  // 🔁 Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      date: "",
      statut: "",
      ligne: "",
      codeEquipement: "",
      numero: "",
      demandeur: "",
    });
  };

  // 🗑️ Suppression intervention
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette intervention ?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/interventions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterventions(interventions.filter((i) => i._id !== id));
      alert("✅ Intervention supprimée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("❌ Échec de la suppression !");
    }
  };

  if (loading) {
    return <div className="loading">Chargement des interventions...</div>;
  }

  return (
    <div className="admin-interventions-container">
      <div className="header">
        <h1>
          <FaTools className="icon" /> Liste des interventions
        </h1>
      </div>

      {/* 🧭 Filtres */}
      <div className="filters">
        <input
          type="text"
          placeholder="🔎 Numéro..."
          value={filters.numero}
          onChange={(e) => setFilters({ ...filters, numero: e.target.value })}
        />
        <input
          type="text"
          placeholder="👤 Demandeur..."
          value={filters.demandeur}
          onChange={(e) => setFilters({ ...filters, demandeur: e.target.value })}
        />

        {/* 🔻 Ligne */}
        <select
          value={filters.ligne}
          onChange={(e) => setFilters({ ...filters, ligne: e.target.value })}
        >
          <option value="">Toutes les lignes</option>
          {lignes.map((ligne) => (
            <option key={ligne._id} value={ligne._id}>
              {ligne.nom}
            </option>
          ))}
        </select>

        {/* 🔻 Équipement */}
        <select
          value={filters.codeEquipement}
          onChange={(e) =>
            setFilters({ ...filters, codeEquipement: e.target.value })
          }
        >
          <option value="">Tous les équipements</option>
          {equipements.map((eq) => (
            <option key={eq._id} value={eq._id}>
              {eq.code} — {eq.designation}
            </option>
          ))}
        </select>

        {/* 🔻 Statut */}
        <select
          value={filters.statut}
          onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
        >
          <option value="">Tous les statuts</option>
          <option value="ouvert">ouvert</option>
          <option value="en_cours">en_cours</option>
          <option value="termine">termine</option>
          <option value="annule">annule</option>
        </select>
        
        {/* 📅 Date */}
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />

        {/* 🔘 Boutons */}
        <button onClick={applyFilters} className="filter-btn">
          <FaSearch /> Filtrer
        </button>
        <button onClick={resetFilters} className="reset-btn">
          <FaSync /> Réinitialiser
        </button>
      </div>

      {/* 🧾 Tableau */}
      {filteredInterventions.length === 0 ? (
        <p className="no-data">Aucune intervention trouvée.</p>
      ) : (
        <table className="interventions-table">
          <thead>
            <tr>
              <th>Numéro</th>
              <th>Ligne</th>
              <th>Désignation Équipement</th>
              <th>Code Équipement</th>
              <th>Demandeur</th>
              <th>Description</th>
              <th>Statut</th>
              <th>Date création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInterventions.map((interv) => (
              <tr key={interv._id}>
                <td>{interv.numero}</td>
                <td>{interv.ligne?.nom}</td>
                <td>{interv.equipement?.designation}</td>
                <td>{interv.equipement?.code}</td>
                <td>{interv.demandeurNom}</td>
                <td className="description">{interv.descriptionAnomalie}</td>
                <td>
                  <span className={`status ${interv.statut}`}>
                    {interv.statut}
                  </span>
                </td>
                <td>
                  {new Date(interv.createdAt).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(interv._id)}
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
