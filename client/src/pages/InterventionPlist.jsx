import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { FaTools, FaSync, FaTrash } from "react-icons/fa";
import "./InterventionPlist.css";

export default function InterventionPlist() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ statut: "", technicien: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

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

  // ⭐ SUPPRESSION
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer cette intervention ?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/interventionP/${id}`);
      alert("Intervention supprimée !");
      fetchData(); // Rafraîchir la liste
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Erreur lors de la suppression");
    }
  };

  const filtered = interventions.filter((i) => {
    return (
      (filter.statut ? i.statut === filter.statut : true) &&
      (filter.technicien ? i.technicienAffecte?._id === filter.technicien : true)
    );
  });

  return (
    <div className="p-6 font-poppins bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Interventions Préventives</h1>

      {/* Filtres */}
      <div className="flex gap-4 mb-4">
        <select
          className="border p-2 rounded"
          value={filter.statut}
          onChange={(e) => setFilter({ ...filter, statut: e.target.value })}
        >
          <option value="">Tous les statuts</option>
          <option value="planifiee">Planifiée</option>
          <option value="en_cours">En cours</option>
          <option value="terminee">Terminée</option>
          <option value="annulee">Annulée</option>
        </select>

        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
        >
          <FaSync /> Rafraîchir
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
              <th className="p-3 text-left">Technicien</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="p-4 text-center">
                  Chargement...
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
                  <td className="p-3">{i.numero}</td>
                  <td className="p-3">{i.titre}</td>
                  <td className="p-3">{i.equipement?.nom || "-"}</td>
                  <td className="p-3">{i.ligne?.nom || "-"}</td>
                  <td className="p-3">
                    {i.datePlanifiee
                      ? new Date(i.datePlanifiee).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">{i.technicienAffecte?.nom || "-"}</td>
                  <td className="p-3 font-semibold">{i.statut}</td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => navigate(`/interventionP/${i._id}`)}
                      className="px-3 py-1 bg-blue-500 text-white rounded flex items-center gap-2"
                    >
                      <FaTools /> Détails
                    </button>

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
        </table>
      </div>
    </div>
  );
}
