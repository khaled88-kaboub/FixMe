import { useEffect, useState } from "react";
import axios from "axios";
import {  FaFilePdf, FaTrash, FaPlus, FaEdit } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminInterventionFournisseur.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminInterventionFournisseur() {
  const [interventions, setInterventions] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [lignes, setLignes] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [equipementsFiltres, setEquipementsFiltres] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);


  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    fournisseur: "",
    dateIntervention: "",
    detail: "",
    duree: "",
    montant: "",
    ligne: "",
    equipement: "",
  });

  const [rapportPdf, setRapportPdf] = useState(null);

  /* ===================== LOAD DATA ===================== */
  const loadAll = async () => {
    const [i, f, l, e] = await Promise.all([
      axios.get(`${API_URL}/api/interventions-fournisseurs`),
      axios.get(`${API_URL}/api/fournisseurs`),
      axios.get(`${API_URL}/api/lignes`),
      axios.get(`${API_URL}/api/equipements`),
    ]);
    setInterventions(i.data);
    setFournisseurs(f.data);
    setLignes(l.data);
    setEquipements(e.data);
  };
  console.log(interventions);

  useEffect(() => {
    loadAll();
  }, []);



  useEffect(() => {
    if (!form.ligne) {
      setEquipementsFiltres([]);
      return;
    }
    
    
    const filtered = equipements.filter((e) => {
      if (!Array.isArray(e.ligne)) return false;
      // Vérifier si la ligne sélectionnée est dans le tableau e.ligne
      return e.ligne.some((l) => {
        // si l est un objet, comparer l._id
        if (typeof l === "object" && l._id) return l._id.toString() === form.ligne.toString();
        // sinon comparer directement
        return l.toString() === form.ligne.toString();
      });
    });
  
    setEquipementsFiltres(filtered);
  }, [form.ligne, equipements]);
  
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);
 

  
  
  
  /* ===================== SUBMIT ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const formData = new FormData();
  
      formData.append("fournisseur", form.fournisseur);
      formData.append("dateIntervention", form.dateIntervention);
      formData.append("detail", form.detail);
      formData.append("duree", form.duree);
      formData.append("montant", form.montant);
  
      if (form.ligne) formData.append("ligne", form.ligne);
      if (form.equipement) formData.append("equipement", form.equipement);
      if (rapportPdf) formData.append("rapport", rapportPdf);
  
      if (editMode) {
        // 🔵 UPDATE
        await axios.put(
          `${API_URL}/api/interventions-fournisseurs/${currentId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Intervention modifiée");
      } else {
        // 🟢 CREATE
        await axios.post(
          `${API_URL}/api/interventions-fournisseurs`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Intervention enregistrée");
      }
  
      // RESET
      setForm({
        fournisseur: "",
        dateIntervention: "",
        detail: "",
        duree: "",
        montant: "",
        ligne: "",
        equipement: "",
      });
  
      setRapportPdf(null);
      setEditMode(false);
      setCurrentId(null);
      setShowModal(false);
      loadAll();
  
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(
        err.response?.data?.message ||
        "Erreur lors de l'enregistrement"
      );
    }
  };
  
  
    /* ===================== EDIT ===================== */

  const handleEdit = (i) => {
    setEditMode(true);
    setCurrentId(i._id);
  
    setForm({
      fournisseur: i.fournisseur?._id || "",
      dateIntervention: i.dateIntervention?.slice(0, 10),
      detail: i.detail || "",
      duree: i.duree || "",
      montant: i.montant || "",
      ligne: i.ligne?._id || "",
      equipement: i.equipement?._id || "",
    });
  // 🔵 PDF existant
  if (i.rapport?.chemin) {
    setPdfPreviewUrl(`${API_URL}${i.rapport.chemin}`);
  } else {
    setPdfPreviewUrl(null);
  }
    setRapportPdf(null); // facultatif
    setShowModal(true);
  };
  
  

  /* ===================== DELETE ===================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette intervention ?")) return;
    await axios.delete(`${API_URL}/api/interventions-fournisseurs/${id}`);
    toast.success("Intervention supprimée");
    loadAll();
  };


/* ===================== CLOSE MODAL ===================== */
  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentId(null);
    setRapportPdf(null);
    setPdfPreviewUrl(null);
  };

  
  

  return (
    <div className="intervention-containero">
      <ToastContainer />
      <div className="headero">
        <h2 className="titre" >Prestations/Sous_traitances</h2>
        <button
  className="btno-add"
  onClick={() => {
    setEditMode(false);
    setCurrentId(null);
    setForm({
      fournisseur: "",
      dateIntervention: "",
      detail: "",
      duree: "",
      montant: "",
      ligne: "",
      equipement: "",
    });
    setRapportPdf(null);
    setPdfPreviewUrl(null);
    setShowModal(true);
  }}
>

<FaPlus /> Ajouter Intervention
        </button>
      </div>

      {/* ===================== TABLE ===================== */}
      <table>
        <thead>
          <tr>
            <th>Prestataire</th>
            <th>Date</th>
            <th>Ligne</th>
            <th>Équipement</th>
            <th>Durée</th>
            <th>Montant</th>
            <th>Rapport</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {interventions.map((i) => (
            
            <tr key={i._id}>
              <td data-label="Prestataire:">{i.fournisseur?.nom}</td>
              <td data-label="Date:">{new Date(i.dateIntervention).toLocaleDateString()}</td>
              <td data-label="Ligne:">{i.ligne?.nom || "-"}</td>
              <td data-label="Euipement:">{i.equipement?.designation || "-"}</td>
              <td data-label="Durée:">{i.duree} h</td>
              <td data-label="Montant:">{i.montant} DA</td>
              <td data-label="Rapport:">
               {i.rapport?.chemin ? (
               <a
                href={`${API_URL}${i.rapport.chemin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pdf-link"
                 >
                <FaFilePdf />
                </a>
                ) : (
                <span className="no-pdf">—</span>
                )}
              </td>
              <td>
              <button
  className="btn-edit"
  onClick={() => handleEdit(i)}
>
  <FaEdit />
</button>

                <button
                  className="btn-delete"
                  onClick={() => handleDelete(i._id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        
      </table>

      {/* ===================== MODAL ===================== */}
      {showModal && (
        <div className="modalo-overlayo">
          <div className="modalo">
          <h3>
  {editMode ? "Modifier l’intervention" : "Nouvelle intervention"}
</h3>

            <form onSubmit={handleSubmit}>
              <select
                className = "datex"
                required
                value={form.fournisseur}
                onChange={(e) =>
                  setForm({ ...form, fournisseur: e.target.value })
                }
              >
                <option  value="">-- Prestataire --</option>
                {fournisseurs.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.nom}
                  </option>
                ))}
              </select>

              <input
                className="datex"
                type="date"
                required
                value={form.dateIntervention}
                onChange={(e) =>
                  setForm({ ...form, dateIntervention: e.target.value })
                }
              />

              <textarea
                placeholder="Détail de l’intervention"
                value={form.detail}
                onChange={(e) => setForm({ ...form, detail: e.target.value })}
              />

                <select
                value={form.ligne}
                onChange={(e) =>
                 setForm({
                ...form,
                ligne: e.target.value,
                equipement: "", // reset obligatoire
                 })
                 }
                 >
                 <option value="">-- Ligne (optionnel) --</option>
                 {lignes.map((l) => (
                 <option key={l._id} value={l._id}>
                 {l.nom}
                 </option>
                 ))}
                 </select>


              <select
  value={form.equipement}
  disabled={!form.ligne}
  onChange={(e) =>
    setForm({ ...form, equipement: e.target.value })
  }
>
  <option value="">
    {form.ligne
      ? "-- Équipement --"
      : "-- Choisir une ligne d’abord --"}
  </option>

  {equipementsFiltres.map((e) => (
    <option key={e._id} value={e._id}>
      {e.designation} ({e.code})
    </option>
  ))}
</select>


              <input
                type="number"
                placeholder="Durée (heures)"
                value={form.duree}
                onChange={(e) => setForm({ ...form, duree: e.target.value })}
              />

              <input
                type="number"
                placeholder="Montant (DA)"
                value={form.montant}
                onChange={(e) => setForm({ ...form, montant: e.target.value })}
              />

              <input
              className = "datex"
              type="file"
              accept="application/pdf"
              onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
              setRapportPdf(file);
              setPdfPreviewUrl(URL.createObjectURL(file));
              }
              }}
              />

              {pdfPreviewUrl && (
              <div className="pdf-preview">
              <span>Fichier en attachement :   </span>
              <a
              href={pdfPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              >
              Ouvrir le PDF
              </a>
              </div>
              )}
              <br/>

              <div className="actions">
              <button type="submit">
              {editMode ? "Modifier" : "Enregistrer"}
              </button>

              <button
              type="button"
              className="cancel"
              onClick={closeModal}
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
