import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaClock,
  FaTools,
  FaSearch,
} from "react-icons/fa";
import "./MaintenancePreventiveList.css";


export default function MaintenancePreventiveList() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [mpList, setMpList] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [lignes, setLignes] = useState([]);
  const [equipements, setEquipements] = useState([]);

  // Filtres
  const [q, setQ] = useState("");
  const [filterLigne, setFilterLigne] = useState("");
  const [filterEquip, setFilterEquip] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mpRes, lignesRes, eqRes] = await Promise.all([
          axios.get(`${API_URL}/api/maintenance-preventive`),
          axios.get(`${API_URL}/api/lignes`),
          axios.get(`${API_URL}/api/equipements`),
        ]);

        setMpList(mpRes.data);
        setFiltered(mpRes.data);

        setLignes(lignesRes.data);
        setEquipements(eqRes.data);
      } catch (err) {
        console.error("Erreur de chargement :", err);
      }
    };

    fetchData();
  }, []);

  // ------------ FILTRAGE ------------
  useEffect(() => {
    let result = [...mpList];

    if (q.trim() !== "") {
      const lower = q.toLowerCase();
      result = result.filter((mp) =>
        mp.titre.toLowerCase().includes(lower)
      );
    }

    if (filterLigne) {
      result = result.filter((mp) => {
        const id = mp.ligne?._id || mp.ligne;
        return id === filterLigne;
      });
    }

    if (filterEquip) {
      result = result.filter((mp) => {
        const id = mp.equipement?._id || mp.equipement;
        return id === filterEquip;
      });
    }

    if (filterStatut) {
      result = result.filter((mp) => mp.statut === filterStatut);
    }

    setFiltered(result);
  }, [q, filterLigne, filterEquip, filterStatut, mpList]);

  // ------------ SUPPRESSION ------------
  const deleteMP = async (id) => {
    if (!window.confirm("Supprimer cette maintenance ?")) return;

    try {
      await axios.delete(`${API_URL}/api/maintenance-preventive/${id}`);
      setMpList(mpList.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Erreur suppression MP :", err);
    }
  };
  const updateStatut = async (id, newStatut) => {
    try {
      await axios.put(`${API_URL}/api/maintenance-preventive/${id}`, {
        statut: newStatut
      });
  
      // Mise à jour locale statut
      setMpList((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, statut: newStatut } : m
        )
      );
  
    } catch (err) {
      console.error("Erreur mise à jour statut :", err);
      alert("Erreur lors de la modification du statut");
    }
  };
  
  const isLate = (date) => {
    return new Date(date) < new Date();
  };

  return (
    <div className="mp-container">

      {/* HEADER */}
      <div className="mp-header">
        <h2 className="mp-title">
          <FaTools /> Maintenances Préventives
        </h2>

        <Link
          to="/mpform"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FaPlus /> Nouvelle MP
        </Link>
      </div>

      {/* FILTRES */}
      <div className="mp-filters">

        <div className="mp-searchbox">
          <FaSearch />
          <input
            className=""
            placeholder="Rechercher titre..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <select
          className="mp-select"
          value={filterLigne}
          onChange={(e) => setFilterLigne(e.target.value)}
        >
          <option value="">Toutes lignes</option>
          {lignes.map((l) => (
            <option key={l._id} value={l._id}>
              {l.nom}
            </option>
          ))}
        </select>

        <select
          className="mp-select"
          value={filterEquip}
          onChange={(e) => setFilterEquip(e.target.value)}
        >
          <option value="">Tous équipements</option>
          {equipements.map((eq) => (
            <option key={eq._id} value={eq._id}>
              {eq.designation}
            </option>
          ))}
        </select>

        <select
          className="mp-select"
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
        >
          <option value="">Tous statuts</option>
          <option value="planifiee">Planifiée</option>
          <option value="en_cours">En cours</option>
          <option value="terminee">Terminée</option>
          <option value="retard">Retard</option>
          <option value="annulee">Annulée</option>
        </select>
      </div>

      {/* TABLEAU */}
      <div className="mp-table-container">
        <table className="mp-table">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-left">
              <th className="p-3">Titre</th>
              <th className="p-3">Équipement</th>
              <th className="p-3">Ligne</th>
              <th className="p-3">Fréquence</th>
              <th className="p-3">Prochaine</th>
              <th className="p-3">Statut</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((mp) => {
              const eq = mp.equipement?.designation || "—";
              const li = mp.ligne?.nom || "—";

              return (
                <tr
                  key={mp._id}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  <td className="p-3 font-semibold">{mp.titre}</td>

                  <td className="p-3" >{eq}</td>

                  <td className="p-3">{li}</td>

                  <td className="p-3 font-semibold">{mp.intervalle} x {mp.frequence}</td>

                  <td className="p-3">
                    <span
                      className={`date-tag ${
                        isLate(mp.dateProchaine)
                          ? "date-red"
                          : "date-green"
                      }`}
                    >
                      <FaClock className="inline mr-1" />
                      {new Date(mp.dateProchaine).toLocaleDateString()}
                    </span>
                  </td>
            
                  <td className="p-3">
  <select
    value={mp.statut}
    onChange={(e) => updateStatut(mp._id, e.target.value)}
    className="mp-select-status"
  >
    <option value="planifiee">Planifiée</option>
    <option value="en_cours">En cours</option>
    <option value="terminee">Terminée</option>
    <option value="retard">Retard</option>
    <option value="annulee">Annulée</option>
  </select>
</td>


                  <td className="action-btns">

                    {/* Edit */}
                                    
                        <Link
                      to={`/maintenance-preventive/${mp._id}`}
                      className="text-blue-500 hover:text-blue-700 text-xl"
                    

                      >
                      <FaEdit />
                    </Link>
                   
                    {/* Delete */}
                    <button
                      onClick={() => deleteMP(mp._id)}
                      className="text-red-500 hover:text-red-700 text-xl"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center p-6 text-gray-500 dark:text-gray-400">
            Aucune maintenance trouvée.
          </div>
        )}
      </div>
    </div>
  );
}
