import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./CompteurListPage.css";
import * as XLSX from "xlsx";


export default function CompteurListPage() {
  const [releves, setReleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValeur, setEditValeur] = useState("");
  const [editRemarque, setEditRemarque] = useState("");

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [filteredReleves, setFilteredReleves] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchReleves();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [releves, dateDebut, dateFin]);

  const fetchReleves = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/compteurs`);
      setReleves(Array.isArray(res.data) ? res.data : []);
      setFilteredReleves(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Erreur chargement des relevés");
    } finally {
      setLoading(false);
    }
  };

  const deleteReleve = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    try {
      await axios.delete(`${API_URL}/api/compteurs/${id}`);
      toast.success("Relevé supprimé");
      fetchReleves();
    } catch (error) {
      toast.error("Erreur suppression");
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setEditValeur(r.valeurCompteur);
    setEditRemarque(r.remarque || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValeur("");
    setEditRemarque("");
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${API_URL}/api/compteurs/${id}`, {
        valeurCompteur: editValeur,
        remarque: editRemarque
      });
      toast.success("Relevé mis à jour");
      cancelEdit();
      fetchReleves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur mise à jour");
    }
  };

  const applyFilter = () => {
    const debut = dateDebut ? new Date(dateDebut) : null;
    const fin = dateFin ? new Date(dateFin) : null;

    const filtered = releves.filter((r) => {
      const dateReleve = new Date(r.dateReleve);
      if (debut && dateReleve < debut) return false;
      if (fin && dateReleve > fin) return false;
      return true;
    });

    setFilteredReleves(filtered);
  };

  //export to excel

  const exportToExcel = () => {
    if (filteredReleves.length === 0) {
      toast.warn("Aucune donnée à exporter");
      return;
    }
  
    const data = filteredReleves.map((r) => {
      // On récupère le nom de la ligne s'il existe
      const nomLigne = r.equipement?.ligne?.nom ? `[${r.equipement.ligne.nom}] ` : "";
      const designation = r.equipement?.designation || "";
      const code = r.equipement?.code ? `(${r.equipement.code})` : "";
  
      return {
        // Combinaison : [Nom Ligne] Désignation (Code)
        Équipement: `${nomLigne}${designation} ${code}`.trim(),
        "Date relevé": new Date(r.dateReleve).toLocaleDateString(),
        "Compteur (h)": r.valeurCompteur,
        Remarque: r.remarque || ""
      };
    });
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
  
    XLSX.utils.book_append_sheet(workbook, worksheet, "Releves Compteur");
  
    XLSX.writeFile(
      workbook,
      `releves_compteur_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };
  
  return (
    <div className="compteur-list-container">
      <h2>📊 Relevés compteur horaire</h2>

      {/* Filtre par date */}
      <div className="filter-container1">
        <label>
          Date début  :
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </label>

        <label>
          Date fin   :
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />
        </label>
        </div>
        <div className="filter-container2">
        <button onClick={applyFilter}>Filtrer</button>
        <button onClick={() => { setDateDebut(""); setDateFin(""); setFilteredReleves(releves); }}>Réinitialiser</button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : filteredReleves.length === 0 ? (
        <p className="empty">Aucun relevé trouvé</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Équipement</th>
              <th>Date relevé</th>
              <th>Compteur (h)</th>
              <th>Remarque</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReleves.map((r) => (
              <tr key={r._id} className={editingId === r._id ? "editing" : ""}>

                <td>{r.equipement?.ligne?.nom ? `[${r.equipement.ligne.nom}] ` : ""} 
  {r.equipement?.designation || "-"} ({r.equipement?.code || "-"})</td>
                <td>{new Date(r.dateReleve).toLocaleDateString()}</td>

                {editingId === r._id ? (
                  <>
                    <td>
                      <input
                        type="number"
                        value={editValeur}
                        onChange={(e) => setEditValeur(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editRemarque}
                        onChange={(e) => setEditRemarque(e.target.value)}
                      />
                    </td>
                    <td className="actions">
                      <button onClick={() => saveEdit(r._id)}>💾 Enregistrer</button>
                      <button onClick={cancelEdit}>❌ Annuler</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{r.valeurCompteur}</td>
                    <td>{r.remarque || "-"}</td>
                    <td className="actions">
                      <button onClick={() => startEdit(r)}>✏️ Modifier</button>
                      <button onClick={() => deleteReleve(r._id)}>🗑️ Supprimer</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        
      )}
      <div className="export-container">
  <button className="btn-export" onClick={exportToExcel}>
    📥 Exporter vers Excel
  </button>
</div>

    </div>
  );
}
