import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaTools, FaFilter, FaUndo } from "react-icons/fa";
import "./AdminUpdateStatutPage.css";

export default function AdminUpdateStatutPage() {
  const [interventions, setInterventions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedStatut, setSelectedStatut] = useState("");
  const [loading, setLoading] = useState(true);

  const [lignes, setLignes] = useState([]);
  const [equipements, setEquipements] = useState([]);

  const [filters, setFilters] = useState({
    statut: "",
    ligne: "",
    equipement: "",
    demandeur: "",
    date: "",
    numero: "",
  });

  useEffect(() => {
    fetchInterventions();
    fetchLignes();
    fetchEquipements();
  }, []);

  const fetchInterventions = async () => {
    try {
      const res = await axios.get("https://fixme-1.onrender.com/api/interventions");
      setInterventions(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des interventions :", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLignes = async () => {
    try {
      const res = await axios.get("https://fixme-1.onrender.com/api/lignes");
      setLignes(res.data);
    } catch (err) {
      console.error("Erreur chargement lignes :", err);
    }
  };

  const fetchEquipements = async () => {
    try {
      const res = await axios.get("https://fixme-1.onrender.com/api/equipements");
      setEquipements(res.data);
    } catch (err) {
      console.error("Erreur chargement équipements :", err);
    }
  };

  // 🎯 Appliquer les filtres
  const applyFilters = () => {
    let result = interventions;

    if (filters.statut)
      result = result.filter((i) => i.statut === filters.statut);

    if (filters.ligne)
      result = result.filter((i) => i.ligne?._id === filters.ligne);

    if (filters.equipement)
      result = result.filter((i) => i.equipement?._id === filters.equipement);

    if (filters.demandeur)
      result = result.filter((i) =>
        i.demandeurNom
          ?.toLowerCase()
          .includes(filters.demandeur.toLowerCase())
      );

    if (filters.numero)
      result = result.filter((i) =>
        i.numero?.toString().includes(filters.numero)
      );

    if (filters.date)
      result = result.filter(
        (i) =>
          new Date(i.createdAt).toLocaleDateString("fr-FR") ===
          new Date(filters.date).toLocaleDateString("fr-FR")
      );

    setFiltered(result);
  };

  // 🔄 Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      statut: "",
      ligne: "",
      equipement: "",
      demandeur: "",
      date: "",
      numero: "",
    });
    setFiltered(interventions);
  };

  // ✏️ Modifier statut
  const handleEdit = (id, currentStatut) => {
    setEditingId(id);
    setSelectedStatut(currentStatut);
  };

  // 💾 Sauvegarder statut
  const handleSave = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://fixme-1.onrender.com/api/interventions/${id}`,
        { statut: selectedStatut },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInterventions((prev) =>
        prev.map((i) => (i._id === id ? { ...i, statut: selectedStatut } : i))
      );
      setFiltered((prev) =>
        prev.map((i) => (i._id === id ? { ...i, statut: selectedStatut } : i))
      );

      setEditingId(null);
      alert("✅ Statut mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur mise à jour statut :", error);
      alert("❌ Échec de la mise à jour !");
    }
  };

  if (loading) return <div className="loading">Chargement des interventions...</div>;

  return (
    <div className="update-statut-container">
      <div className="header">
        <h2 className="titren">
        <FaTools className="icon" /> Statuts d’interventions
        </h2>
      </div>

      {/* 🧭 Filtres */}
      <div className="filterss">
        <select
          value={filters.statut}
          onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
        >
          <option value="">-- Statut --</option>
          <option value="ouvert">Ouvert</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminée</option>
          <option value="annule">Annulée</option>
        </select>

        <select
          value={filters.ligne}
          onChange={(e) => setFilters({ ...filters, ligne: e.target.value })}
        >
          <option value="">-- Ligne --</option>
          {lignes.map((l) => (
            <option key={l._id} value={l._id}>
              {l.nom}
            </option>
          ))}
        </select>

        <select
          value={filters.equipement}
          onChange={(e) =>
            setFilters({ ...filters, equipement: e.target.value })
          }
        >
          <option value="">-- Code équipement --</option>
          {equipements.map((eq) => (
            <option key={eq._id} value={eq._id}>
              {eq.code}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Demandeur..."
          value={filters.demandeur}
          onChange={(e) =>
            setFilters({ ...filters, demandeur: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Numéro..."
          value={filters.numero}
          onChange={(e) => setFilters({ ...filters, numero: e.target.value })}
        />

        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />

        
          <button className="apply-btnx" onClick={applyFilters}>
             Appliquer
          </button>
          <button className="reset-btnx" onClick={resetFilters}>
             Réinitialiser
          </button>
        </div>
      

      {/* 📋 Tableau */}
      {filtered.length === 0 ? (
        <p className="no-data">Aucune intervention trouvée.</p>
      ) : (
        <table className="statut-table">
          <thead>
            <tr>
              <th>Numéro</th>
              <th>Ligne</th>
              <th>Équipement</th>
              <th>Demandeur</th>
              <th>Description</th>
              <th>Réception Production</th>
              <th>Clôture Maintenance</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((interv) => (
              <tr key={interv._id}>
                <td  className="cellule" data-label="">{interv.numero}</td>
                <td data-label="Ligne :">{interv.ligne?.nom}</td>
                <td data-label="Equipement :">{interv.equipement?.code}</td>
                <td data-label="Demandeur :">{interv.demandeurNom}</td>
                <td data-label="Description :" className="description">{interv.descriptionAnomalie}</td>
                <td data-label="Recep.Prod :">
                  {interv.receptionProduction ? (
                    <span className="badge green">Oui</span>
                  ) : (
                    <span className="badge red">Non</span>
                  )}
                </td>
                <td data-label="Recep.Maint :">
                  {interv.clotureMaintenance ? (
                    <span className="badge green">Oui</span>
                  ) : (
                    <span className="badge red">Non</span>
                  )}
                </td>
                <td data-label="Statut">
                  {editingId === interv._id ? (
                    <select
                      value={selectedStatut}
                      onChange={(e) => setSelectedStatut(e.target.value)}
                      className="statut-select"
                    >
                      <option value="ouvert">Ouvert</option>
                      <option value="en_cours">En cours</option>
                      <option value="termine">Terminée</option>
                      <option value="annule">Annulée</option>
                    </select>
                  ) : (
                    <span className={`status ${interv.statut}`}>
                      {interv.statut}
                    </span>
                  )}
                </td>
                <td>
                  {editingId === interv._id ? (
                    <button
                      className="save-btn"
                      onClick={() => handleSave(interv._id)}
                    >
                      <FaSave /> Sauver
                    </button>
                  ) : (
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(interv._id, interv.statut)}
                    >
                      <FaEdit /> Modifier
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
