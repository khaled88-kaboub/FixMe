import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlusCircle, FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import "./AdminLignesPage.css";

export default function AdminLignesPage() {
  const [lignes, setLignes] = useState([]);
  const [nom, setNom] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNom, setEditNom] = useState("");

  const fetchLignes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/lignes");
      setLignes(res.data);
    } catch (err) {
      toast.error("Erreur de chargement des lignes");
    }
  };

  useEffect(() => {
    fetchLignes();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!nom.trim()) return toast.warn("Veuillez entrer un nom de ligne.");
    try {
      const res = await axios.post("http://localhost:5000/api/lignes", { nom });
      toast.success(`✅ Ligne "${res.data.nom}" ajoutée avec succès !`);
      setNom("");
      fetchLignes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l’ajout de la ligne");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette ligne ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/lignes/${id}`);
      toast.info("Ligne supprimée");
      fetchLignes();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // 🔹 Activer le mode édition
  const handleEdit = (ligne) => {
    setEditId(ligne._id);
    setEditNom(ligne.nom);
  };

  // 🔹 Annuler la modification
  const handleCancelEdit = () => {
    setEditId(null);
    setEditNom("");
  };

  // 🔹 Sauvegarder la modification
  const handleSaveEdit = async (id) => {
    if (!editNom.trim()) return toast.warn("Le nom ne peut pas être vide.");
    try {
      await axios.put(`http://localhost:5000/api/lignes/${id}`, { nom: editNom });
      toast.success("✅ Ligne modifiée avec succès !");
      setEditId(null);
      setEditNom("");
      fetchLignes();
    } catch (err) {
      toast.error("Erreur lors de la modification");
    }
  };

  return (
    <div className="admin-lignes-container">
      <h2>⚙️ Gestion des lignes de production</h2>

      <form onSubmit={handleAdd} className="add-ligne-form">
        <input
          type="text"
          placeholder="Nom de la ligne"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
        <button type="submit">
          <FaPlusCircle /> Ajouter
        </button>
      </form>

      <div className="lignes-list">
        {lignes.length === 0 ? (
          <p>Aucune ligne enregistrée.</p>
        ) : (
          <ul>
            {lignes.map((ligne) => (
              <li key={ligne._id}>
                {editId === ligne._id ? (
                  <>
                    <input
                      type="text"
                      value={editNom}
                      onChange={(e) => setEditNom(e.target.value)}
                      className="edit-input"
                    />
                    <div className="edit-actions">
                      <button
                        onClick={() => handleSaveEdit(ligne._id)}
                        className="save-btn"
                      >
                        <FaSave />
                      </button>
                      <button onClick={handleCancelEdit} className="cancel-btn">
                        <FaTimes />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{ligne.nom}</span>
                    <div className="edit-actions">
                      <button
                        onClick={() => handleEdit(ligne)}
                        className="edit-btn"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(ligne._id)}
                        className="delete-btn"
                      >
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
