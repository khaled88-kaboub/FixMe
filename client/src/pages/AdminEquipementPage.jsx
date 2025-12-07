import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlusCircle, FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import "./AdminEquipementPage.css";
const API_URL = import.meta.env.VITE_API_URL;
 
export default function AdminEquipementPage() {
  const [equipements, setEquipements] = useState([]);
  const [designation, setDesignation] = useState("");
  const [code, setCode] = useState("");
  const [ligneId, setLigneId] = useState("");
  const [lignes, setLignes] = useState([]);

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ designation: "", code: "", ligne: "" });

  // 🔹 Récupérer les lignes pour le menu déroulant
  const fetchLignes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/lignes`);
      setLignes(res.data);
    } catch (err) {
      toast.error("Erreur de chargement des lignes");
    }
  };

  // 🔹 Récupérer les équipements
  const fetchEquipements = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/equipements`);
      setEquipements(res.data);
    } catch (err) {
      toast.error("Erreur de chargement des équipements");
    }
  };

  useEffect(() => {
    fetchLignes();
    fetchEquipements();
  }, []);

  // 🔹 Ajouter un équipement
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!designation.trim() || !code.trim() || !ligneId)
      return toast.warn("Veuillez remplir tous les champs.");

    try {
      const res = await axios.post(`${API_URL}/api/equipements`, {
        designation,
        code,
        ligne: ligneId,
      });
      toast.success(`✅ Équipement "${res.data.designation}" ajouté avec succès !`);
      setDesignation("");
      setCode("");
      setLigneId("");
      fetchEquipements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l’ajout de l’équipement");
    }
  };

  // 🔹 Supprimer
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet équipement ?")) return;
    try {
      await axios.delete(`${API_URL}/api/equipements/${id}`);
      toast.info("Équipement supprimé");
      fetchEquipements();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // 🔹 Activer le mode édition
  const handleEdit = (equipement) => {
    setEditId(equipement._id);
    setEditData({
      designation: equipement.designation,
      code: equipement.code,
      ligne: equipement.ligne?._id || "",
    });
  };

  // 🔹 Annuler l’édition
  const handleCancelEdit = () => {
    setEditId(null);
    setEditData({ designation: "", code: "", ligne: "" });
  };

  // 🔹 Sauvegarder la modification
  const handleSaveEdit = async (id) => {
    const { designation, code, ligne } = editData;
    if (!designation.trim() || !code.trim() || !ligne)
      return toast.warn("Tous les champs sont obligatoires.");

    try {
      await axios.put(`${API_URL}/api/equipements/${id}`, {
        designation,
        code,
        ligne,
      });
      toast.success("✅ Équipement modifié avec succès !");
      setEditId(null);
      fetchEquipements();
    } catch (err) {
      toast.error("Erreur lors de la modification");
    }
  };

  return (
    <div className="admin-equipement-container">
      <h2>⚙️ Gestion des Équipements de production</h2>

      <form onSubmit={handleAdd} className="add-equipement-form">
        <input
          type="text"
          placeholder="Désignation de l’équipement"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Code équipement"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <select value={ligneId} onChange={(e) => setLigneId(e.target.value)}>
          <option value="">-- Sélectionner une ligne --</option>
          {lignes.map((ligne) => (
            <option key={ligne._id} value={ligne._id}>
              {ligne.nom}
            </option>
          ))}
        </select>
        <button type="submit">
          <FaPlusCircle /> Ajouter
        </button>
      </form>

      <div className="equipement-list">
        {equipements.length === 0 ? (
          <p>Aucun équipement enregistré.</p>
        ) : (
          <ul>
            {equipements.map((eq) => (
              <li key={eq._id}>
                {editId === eq._id ? (
                  <>
                    <input
                      type="text"
                      value={editData.designation}
                      onChange={(e) =>
                        setEditData({ ...editData, designation: e.target.value })
                      }
                      className="edit-input"
                    />
                    <input
                      type="text"
                      value={editData.code}
                      onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                      className="edit-input"
                    />
                    <select
                      value={editData.ligne}
                      onChange={(e) => setEditData({ ...editData, ligne: e.target.value })}
                    >
                      <option value="">-- Ligne --</option>
                      {lignes.map((ligne) => (
                        <option key={ligne._id} value={ligne._id}>
                          {ligne.nom}
                        </option>
                      ))}
                    </select>
                    <div className="edit-actions">
                      <button onClick={() => handleSaveEdit(eq._id)} className="save-btn">
                        <FaSave />
                      </button>
                      <button onClick={handleCancelEdit} className="cancel-btn">
                        <FaTimes />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>
                      <strong>{eq.designation}</strong> — {eq.code}{" "}
                      <em>({eq.ligne?.nom || "Aucune ligne"})</em>
                    </span>
                    <div className="edit-actions">
                      <button onClick={() => handleEdit(eq)} className="edit-btn">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(eq._id)} className="delete-btn">
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ToastContainer position="bottom-right" autoClose={2500} />
    </div>
  );
}
