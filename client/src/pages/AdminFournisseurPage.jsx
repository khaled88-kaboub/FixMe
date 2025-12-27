import { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { FaFilePdf, FaTrashAlt } from "react-icons/fa";

import "./AdminFournisseurPage.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminFournisseurPage() {
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [filterNom, setFilterNom] = useState("");

  const [fournisseurs, setFournisseurs] = useState([]);
  const [form, setForm] = useState({
    nom: "",
    type: "fournisseur",
    telephone: "",
    email: "",
    adresse: "",
    specialite: "",
    remarque: "",
    NIF: "",
    AI: "",
    RC: "",
    NIS: "",
    actif: true,
    contratMaintenance: null,
  });
  
  const [editId, setEditId] = useState(null);

  const fetchFournisseurs = async () => {
    const res = await axios.get(`${API_URL}/api/fournisseurs`);
    console.log("FOURNISSEURS:", res.data);
    setFournisseurs(res.data);
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      let fournisseurId = editId;
      const { contratMaintenance, ...payload } = form;
      // Création ou modification fournisseur
      if (editId) {
        await axios.put(`${API_URL}/api/fournisseurs/${editId}`, payload);
      } else {
        const res = await axios.post(`${API_URL}/api/fournisseurs`, payload);
        fournisseurId = res.data._id;
      }

      // Upload PDF si présent
      if (pdfFile && fournisseurId) {
        const formData = new FormData();
        formData.append("contrat", pdfFile);

        await axios.post(
          `${API_URL}/api/fournisseurs/${fournisseurId}/contrat`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      // Reset formulaire
      setForm({
        nom: "", type: "fournisseur", telephone: "", email: "",
        adresse: "", specialite: "", remarque: "", NIF: "",
        AI: "", RC: "", NIS: "", actif: true,
      });
      setPdfFile(null);
      setEditId(null);
      setShowModal(false);
      fetchFournisseurs();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur upload");
    } finally {
      setUploading(false);
    }
  };
  const handleDeleteContrat = async () => {
    if (!editId) return;
  
    if (!confirm("Supprimer définitivement le contrat ?")) return;
  
    try {
      await axios.delete(
        `${API_URL}/api/fournisseurs/${editId}/contrat`
      );
  
      // Mise à jour locale
      setForm({ ...form, contratMaintenance: null });
      setPdfFile(null);
  
      fetchFournisseurs();
    } catch (err) {
      alert("Erreur suppression contrat");
    }
  };
  
  const handleEdit = (f) => {
    setForm({
      nom: f.nom || "",
      type: f.type || "fournisseur",
      telephone: f.telephone || "",
      email: f.email || "",
      adresse: f.adresse || "",
      specialite: f.specialite || "",
      remarque: f.remarque || "",
      NIF: f.NIF || "",
      AI: f.AI || "",
      RC: f.RC || "",
      NIS: f.NIS || "",
      actif: f.actif ?? true,
      contratMaintenance: f.contratMaintenance || "",
    });
    setPdfFile(null);
    setEditId(f._id);
  };

  const handleDelete = async (id) => {
    if (confirm("Supprimer ce fournisseur ?")) {
      await axios.delete(`${API_URL}/api/fournisseurs/${id}`);
      fetchFournisseurs();
    }
  };

  return (
    <div className="fournisseur-page">
      <h2>Gestion Fournisseurs & Sous-traitants</h2>

      {/* Toolbar */}
      <div className="toolbar">
        <button
          className="add-btn"
          onClick={() => {
            setEditId(null);
            setForm({
              nom: "", type: "fournisseur", telephone: "", email: "",
              adresse: "", specialite: "", remarque: "", NIF: "",
              AI: "", RC: "", NIS: "", actif: true,
            });
            setPdfFile(null);
            setShowModal(true);
          }}
        >
          <FaPlus /> Ajouter
        </button>

        <input
          type="text"
          placeholder="Filtrer par nom..."
          value={filterNom}
          onChange={(e) => setFilterNom(e.target.value)}
          className="filter-input"
        />
      </div>

      {/* Tableau fournisseurs */}
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Type</th>
            <th>Contact</th>
            <th>Spécialité</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {fournisseurs
            .filter((f) => (f.nom || "").toLowerCase().includes(filterNom.toLowerCase()))
            .map((f) => (
              <tr key={f._id}>
                <td>{f.nom}</td>
                <td>{f.type}</td>
                <td>{f.telephone}</td>
                <td>{f.specialite}</td>
                <td>
                  <FaEdit
                    onClick={() => {
                      handleEdit(f);
                      setShowModal(true);
                    }}
                  />
                  <FaTrash onClick={() => handleDelete(f._id)} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="modalo-overlayo">
          <div className="modalo">
            <h3>{editId ? "Modifier Fournisseur" : "Ajouter Fournisseur"}</h3>

            <form onSubmit={handleSubmit}>
              <input className="intitule"
                placeholder="Nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
              />

              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="fournisseur">Fournisseur</option>
                <option value="sous-traitant">Sous-traitant</option>
              </select>

              <input
                placeholder="Téléphone"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              />

              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
                <input
                placeholder="Spécialité"
                value={form.specialite}
                onChange={(e) => setForm({ ...form, specialite: e.target.value })}
              />
              <input className="intitule"
                placeholder="Adresse"
                value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              />

              

              <input
                placeholder="NIF"
                value={form.NIF}
                onChange={(e) => setForm({ ...form, NIF: e.target.value })}
              />

              <input
                placeholder="AI"
                value={form.AI}
                onChange={(e) => setForm({ ...form, AI: e.target.value })}
              />

              <input
                placeholder="RC"
                value={form.RC}
                onChange={(e) => setForm({ ...form, RC: e.target.value })}
              />

              <input
                placeholder="NIS"
                value={form.NIS}
                onChange={(e) => setForm({ ...form, NIS: e.target.value })}
              />

              <textarea className="intitule"
                placeholder="Remarque"
                value={form.remarque}
                onChange={(e) => setForm({ ...form, remarque: e.target.value })}
              />

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.actif}
                  onChange={(e) => setForm({ ...form, actif: e.target.checked })}
                />
                Actif
              </label>

              
              {editId && form.contratMaintenance && !pdfFile && (
              <div className="pdf-existing">
              <FaFilePdf className="pdf-icon" />

              <a
               href={`${API_URL}${form.contratMaintenance.chemin}`}
               target="_blank"
               rel="noreferrer"
               className="pdf-link"
    >
              {form.contratMaintenance.nomFichier}
              </a>

              <span className="pdf-badge">PDF</span>

              <button
              type="button"
              className="pdf-delete"
              onClick={handleDeleteContrat}
              title="Supprimer le contrat"
               >
              <FaTrashAlt />
              </button>
              </div>
               )}


              <label className="pdf-label">Contrat de maintenance (PDF)</label>
              <input  className="bouton"
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
              />
              
             

              <div className="modalo-actions">
                <button type="submit" disabled={uploading}>
                  {uploading ? "Envoi..." : editId ? "Modifier" : "Ajouter"}
                </button>
                <button
                  type="button"
                  className="cancel"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
