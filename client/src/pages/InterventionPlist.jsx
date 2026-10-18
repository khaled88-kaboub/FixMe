import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTools, FaSync, FaTrash, FaSearch } from "react-icons/fa";
import "./InterventionPlist.css";

export default function InterventionPlist() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [interventions, setInterventions] = useState([]);
  const [lignes, setLignes] = useState([]); // Liste des lignes pour le filtre
  const [loading, setLoading] = useState(true);
  
  // État des filtres
  const [filter, setFilter] = useState({
    statut: "",
    technicien: "",
    ligne: "",
    titre: "",
    dateDebut: "",
    dateFin: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchLignes();
  }, []);

  // Récupération des interventions
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/interventionP`);

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.interventions
        ? res.data.interventions
        : [];

      setInterventions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Récupération de la liste des lignes pour le menu déroulant
  const fetchLignes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/lignes`);
      const data = Array.isArray(res.data) ? res.data : res.data.lignes || [];
      setLignes(data);
    } catch (err) {
      console.error("Erreur chargement lignes :", err);
    }
  };

  // Suppression d'une intervention
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer cette intervention ?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/interventionP/${id}`);
      alert("Intervention supprimée !");
      fetchData();
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Erreur lors de la suppression");
    }
  };

  // Réinitialisation de tous les filtres
  const resetFilters = () => {
    setFilter({
      statut: "",
      technicien: "",
      ligne: "",
      titre: "",
      dateDebut: "",
      dateFin: "",
    });
  };

  // Logique de filtrage multi-critères
  const filtered = interventions.filter((i) => {
    // 1. Filtre Statut
    const matchStatut = filter.statut ? i.statut === filter.statut : true;

    // 2. Filtre Technicien
    const matchTechnicien = filter.technicien
      ? i.technicienAffecte?.some(
          (t) => t.technicien?._id === filter.technicien
        )
      : true;

    // 3. Filtre Ligne
    const matchLigne = filter.ligne ? i.ligne?._id === filter.ligne : true;

    // 4. Filtre Titre (recherche insensible à la casse)
    const matchTitre = filter.titre
      ? i.titre?.toLowerCase().includes(filter.titre.toLowerCase())
      : true;

    // 5. Filtre Plage de Dates de Planification
    let matchDate = true;
    if (i.datePlanifiee) {
      const datePlan = new Date(i.datePlanifiee).setHours(0, 0, 0, 0);

      if (filter.dateDebut) {
        const dateDeb = new Date(filter.dateDebut).setHours(0, 0, 0, 0);
        if (datePlan < dateDeb) matchDate = false;
      }

      if (filter.dateFin) {
        const dateF = new Date(filter.dateFin).setHours(23, 59, 59, 999);
        if (datePlan > dateF) matchDate = false;
      }
    } else if (filter.dateDebut || filter.dateFin) {
      matchDate = false;
    }

    return (
      matchStatut &&
      matchTechnicien &&
      matchLigne &&
      matchTitre &&
      matchDate
    );
  });

  // Calculs des totaux par statut
  const stats = {
    total: filtered.length,
    planifiee: filtered.filter((i) => i.statut === "planifiee").length,
    en_cours: filtered.filter((i) => i.statut === "en_cours").length,
    terminee: filtered.filter((i) => i.statut === "terminee").length,
  };

  return (
    <div className="mp-container">
      <h1 className="mp-title">Interventions Préventives</h1>
{/* Cartes de Récapitulatif / Totaux */}

      {/* Barre de filtres complète */}
      <div className="mp-filters">
        {/* Recherche par titre */}
        <div className="flex flex-col flex-1 min-w-[200px]">
          <label className="text-sm text-gray-600 mb-1 font-medium">Recherche par titre</label>
          <div className="mp-searchbox">
          <FaSearch />
            <input
              type="text"
              placeholder="Rechercher titre..."
              
              value={filter.titre}
              onChange={(e) => setFilter({ ...filter, titre: e.target.value })}
            />
          </div>
        </div>

        {/* Filtre par Ligne */}
        <div className="flex flex-col min-w-[160px]">
          <label className="text-sm text-gray-600 mb-1 font-medium">Ligne</label>
          <select
            className="mp-select"
            value={filter.ligne}
            onChange={(e) => setFilter({ ...filter, ligne: e.target.value })}
          >
            <option value="">Toutes les lignes</option>
            {lignes.map((l) => (
              <option key={l._id} value={l._id}>
                {l.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par Statut */}
        <div className="flex flex-col min-w-[150px]">
          <label className="text-sm text-gray-600 mb-1 font-medium">Statut</label>
          <select
            className="mp-select"
            value={filter.statut}
            onChange={(e) => setFilter({ ...filter, statut: e.target.value })}
          >
            <option value="">Tous les statuts</option>
            <option value="planifiee">Planifiée</option>
            <option value="en_cours">En cours</option>
            <option value="terminee">Terminée</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>

        {/* Date Début */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1 font-medium">Date début</label>
          <input
            type="date"
            className="mp-select"
            value={filter.dateDebut}
            onChange={(e) => setFilter({ ...filter, dateDebut: e.target.value })}
          />
        </div>

        {/* Date Fin */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1 font-medium">Date fin</label>
          <input
            type="date"
            className="mp-select"
            value={filter.dateFin}
            onChange={(e) => setFilter({ ...filter, dateFin: e.target.value })}
          />
        </div>

        
      </div>

{/* Boutons d'action */}
<div className="boutoni">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <FaSync /> Rafraîchir
          </button>
          
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700 transition"
            >
            Effacer
          </button>
        </div>
      {/* Tableau */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="tableau">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Numéro</th>
              <th className="p-3 text-left">Titre</th>
              <th className="p-3 text-left">Équipement</th>
              <th className="p-3 text-left">Ligne</th>
              <th className="p-3 text-left">Date planifiée</th>
              <th className="p-3 text-left">Technicien(s)</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left"></th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="p-4 text-center">
                  Chargement des interventions...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-4 text-center">
                  Aucune intervention trouvée.
                </td>
              </tr>
            ) : (
              filtered.map((i) => (
                <tr key={i._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{i.numero}</td>
                  <td className="p-3">{i.titre}</td>
                  <td className="p-3">
                    {i.equipement?.designation || "-"} {i.equipement?.code ? `(${i.equipement.code})` : ""}
                  </td>
                  <td className="p-3">{i.ligne?.nom || "-"}</td>
                  <td className="p-3">
                    {i.datePlanifiee
                      ? new Date(i.datePlanifiee).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">
                    {i.technicienAffecte && i.technicienAffecte.length > 0
                      ? i.technicienAffecte
                          .map((item) => item.technicien?.nom)
                          .filter(Boolean)
                          .join(", ")
                      : "-"}
                  </td>
                  <td className="p-3 font-semibold">{i.statut}</td>

                  <td className="p-3 flex gap-2">
            

                    <button
                      onClick={() => handleDelete(i._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded flex items-center gap-2"
                    >
                      <FaTrash /> Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Pied du tableau avec le Total */}
          {!loading && filtered.length > 0 && (
            <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-300">
              <tr>
                <td colSpan="7" className="p-3 text-right">
                  Total des interventions :
                </td>
                <td className="p-3 text-blue-600 font-extrabold text-base">
                  {filtered.length}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div><div className="mp-totaux">
        <span className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-600">
          <p className="text-sm text-gray-500 font-medium">Total affiché(s)</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </span>
        <span className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 font-medium">Planifiées</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.planifiee}</p>
        </span>
        <span className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-400">
          <p className="text-sm text-gray-500 font-medium">En cours</p>
          <p className="text-2xl font-bold text-blue-500">{stats.en_cours}</p>
        </span>
        <span className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">Terminées</p>
          <p className="text-2xl font-bold text-green-600">{stats.terminee}</p>
        </span>
      </div>
    </div>
  );
}