import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx"; // <--- Import XLSX
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaClock,
  FaTools,
  FaSearch,
  FaFileExcel,
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

  // ------------ EXPORT EXCEL ------------
  const exportToExcel = () => {
    // Transformer les données filtrées pour avoir des entêtes propres dans le fichier Excel
    const dataToExport = filtered.map((mp) => {
      const isConditionnelle = mp.type === "conditionnelle";
      
      return {
        "Numéro": mp.numero || "—",
        "Titre": mp.titre || "—",
        "Type": mp.type || "—",
        "Équipement": mp.equipement?.designation || "—",
        "Code Équipement": mp.equipement?.code || "—",
        "Ligne": mp.ligne?.nom || "—",
        "Fréquence": isConditionnelle 
          ? "Selon état" 
          : `${mp.intervalle || 1} x ${mp.frequence || ""}`,
        "Prochaine Date": isConditionnelle 
          ? "—" 
          : mp.dateProchaine 
            ? new Date(mp.dateProchaine).toLocaleDateString() 
            : "—",
        "Nombre de Tâches": mp.taches ? mp.taches.length : 0,
      };
    });

    // Création de la feuille Excel et du classeur
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Maintenances");

    // Générer le fichier et déclencher le téléchargement
    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Maintenances_Preventives_${dateStr}.xlsx`);
  };
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

        {/* BOUTONS D'ACTION (Export + Ajout) */}
        <div className="flex items-center gap-3">
          <button
            onClick={exportToExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors font-medium text-sm shadow-sm"
            title="Exporter les données filtrées au format Excel"
          >
            <FaFileExcel className="text-lg" /> Exporter Excel
          </button>

          
        </div>
      </div>

      {/* FILTRES */}
      <div className="mp-filters">
        <div className="mp-searchbox">
          <FaSearch />
          <input
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
              {eq.designation} - {eq.code}
            </option>
          ))}
        </select>
      </div>

{/* Affichage du compteur sous les filtres */}
<div className="mb-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
  Affichage de <span className="font-bold text-gray-900 dark:text-gray-100">{filtered.length}</span> élément(s)
  {filtered.length !== mpList.length && (
    <span className="text-gray-400"> (sur un total de {mpList.length})</span>
  )}
</div>
      {/* TABLEAU */}
      <div className="mp-table-container">
        <table className="mp-table">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-left">
              <th className="p-3">Numéro</th>
              <th className="p-3">Titre</th>
              <th className="p-3">Type</th>
              <th className="p-3">Ligne</th>
              <th className="p-3">Équipement</th>
              
              <th className="p-3">Fréquence</th>
              <th className="p-3">Prochaine</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((mp) => {
              const eqDesignation = mp.equipement?.designation;
              const eqCode = mp.equipement?.code;
              const li = mp.ligne?.nom || "—";
              const isConditionnelle = mp.type === "conditionnelle";

              return (
                <tr
                  key={mp._id}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  <td className="p-3 font-semibold">{mp.numero}</td>
                  {/* Titre + Tâches au-dessous */}
                  <td className="p-3">
  <div className="font-semibold text-gray-900 dark:text-gray-100">
    {mp.titre}
  </div>

  {mp.taches && mp.taches.length > 0 && (
    <details className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
      <summary className="cursor-pointer font-medium hover:text-blue-600 select-none">
        📋 {mp.taches.length} tâche(s)
      </summary>
      <ul className="mt-1.5 pl-2 space-y-1 border-l-2 border-blue-500 text-[11px]">
        {mp.taches.map((t, idx) => (
          <li key={idx} className="list-disc list-inside leading-tight">
            <span>{t.description}</span>
            {t.dureeEstimee && (
              <span className="text-gray-400 dark:text-gray-500 font-normal">
                {" "}
                ({t.dureeEstimee} min)
              </span>
            )}
          </li>
        ))}
      </ul>
    </details>
  )}
</td>
                  <td className="p-3 font-semibold">{mp.type}</td>
                  <td className="p-3">{li}</td>
                  <td className="p-3">
  {eqDesignation ? (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {eqDesignation}
      </span>
      {eqCode && (
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          --{eqCode}--
        </div>
      )}
    </div>
  ) : (
    <span className="text-gray-400">—</span>
  )}
</td>
                 

                  {/* Fréquence */}
                  <td className="p-3 font-semibold">
                    {isConditionnelle ? (
                      <span className="text-gray-400 italic">Selon état</span>
                    ) : (
                      `${mp.intervalle} x ${mp.frequence}`
                    )}
                  </td>

                  {/* Prochaine date */}
                  <td className="p-3">
                    {isConditionnelle ? (
                      <span className="text-gray-400 italic">—</span>
                    ) : mp.dateProchaine ? (
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
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Actions */}
                  <td className="action-btns">
                   

                    <button
                      onClick={() => deleteMP(mp._id)}
                      className="supprimer"
                    >
                      X
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