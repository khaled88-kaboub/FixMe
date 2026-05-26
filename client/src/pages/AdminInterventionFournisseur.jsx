import { useEffect, useState } from "react";
import axios from "axios";
import {  FaFilePdf, FaTrash, FaPlus, FaEdit } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminInterventionFournisseur.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [filters, setFilters] = useState({
    fournisseur: "",
    dateDebut: "",
    dateFin: "",
  });

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

  
  const interventionsFiltrees = interventions.filter((i) => {
    // filtre fournisseur
    const matchFournisseur =
      !filters.fournisseur ||
      i.fournisseur?._id === filters.fournisseur;
  
    // date intervention
    const dateIntervention = new Date(i.dateIntervention);
  
    // filtre date début
    const matchDateDebut =
      !filters.dateDebut ||
      dateIntervention >= new Date(filters.dateDebut);
  
    // filtre date fin
    const matchDateFin =
      !filters.dateFin ||
      dateIntervention <= new Date(filters.dateFin + "T23:59:59");
  
    return (
      matchFournisseur &&
      matchDateDebut &&
      matchDateFin
    );
  });



  const exportPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
    });
  
    // ================= HEADER =================
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
  
    doc.text("Prestations / Sous-traitances", 14, 20);
  
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
  
    const today = new Date().toLocaleDateString();
  
    doc.text(`Date génération : ${today}`, 14, 28);
  
    // ================= FILTERS =================
  
    let filtreText = "Filtres : ";
  
    if (filters.fournisseur) {
      const fournisseurNom =
        fournisseurs.find(
          (f) => f._id === filters.fournisseur
        )?.nom || "";
  
      filtreText += `Prestataire: ${fournisseurNom}   `;
    }
  
    if (filters.dateDebut) {
      filtreText += `Du: ${filters.dateDebut}   `;
    }
  
    if (filters.dateFin) {
      filtreText += `Au: ${filters.dateFin}`;
    }
  
   /// doc.text(filtreText, 14, 35);
  
    // ================= TABLE DATA =================
  
    const rows = interventionsFiltrees.map((i) => [
      i.fournisseur?.nom || "-",
    
      new Date(i.dateIntervention).toLocaleDateString(),
    
      i.ligne?.nom || "-",
    
      i.equipement?.designation || "-",
    
      i.detail || "-",
    
      `${i.duree || 0} h`,
    
      `${i.montant || 0} DA`,
    ]);
    // ================= TABLE =================
  
    autoTable(doc, {
      startY: 45,
  
      head: [[
        "Prestataire",
        "Date",
        "Ligne",
        "Équipement",
        "Description",
        "Durée",
        "Montant",
      ]],
  
      body: rows,
  
      theme: "grid",
  
      styles: {
        fontSize: 9,
        cellPadding: 4,
        valign: "middle",
      
        overflow: "linebreak",
        cellWidth: "wrap",
      },
  
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
  
      bodyStyles: {
        textColor: 50,
      },
  
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
  
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 38 },
      
        // description
        4: { cellWidth: 95 },
      
        5: {
          halign: "center",
          cellWidth: 22,
        },
      
        6: {
          halign: "right",
          cellWidth: 30,
        },
      },
    });
  
    // ================= TOTAL =================
  
    const total = interventionsFiltrees.reduce(
      (sum, i) => sum + Number(i.montant || 0),
      0
    );
  
    const finalY = doc.lastAutoTable.finalY + 12;
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
  
    //doc.text(
    //  `Montant total : ${total.toLocaleString()} DA`,
    //  14,
     // finalY
   // );
  
    // ================= FOOTER =================
  
    const pageCount = doc.internal.getNumberOfPages();
  
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
  
      doc.setFontSize(9);
  
      doc.text(
        `Page ${i} / ${pageCount}`,
        180,
        290
      );
    }
  
    // ================= SAVE =================
  
    doc.save("prestations.pdf");
  };


  return (
    <div className="intervention-containero">
      <ToastContainer />
      <div className="header">
      <h2 className="titre">
  Prestations 
  <span className="count-badge">
  {interventionsFiltrees.length}
  </span>
</h2>
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

 Ajouter 
        </button>


        <button
  className="btn-export-pdf"
  onClick={exportPDF}
>
  <FaFilePdf />
   PDF
</button>
      </div>


{/* ===================== FILTRES ===================== */}

<div className="filters-container">

  <select
    value={filters.fournisseur}
    onChange={(e) =>
      setFilters({
        ...filters,
        fournisseur: e.target.value,
      })
    }
  >
    <option value="">-- Tous les prestataires --</option>

    {fournisseurs.map((f) => (
      <option key={f._id} value={f._id}>
        {f.nom}
      </option>
    ))}
  </select>

  <input
    type="date"
    value={filters.dateDebut}
    onChange={(e) =>
      setFilters({
        ...filters,
        dateDebut: e.target.value,
      })
    }
  />

  <input
    type="date"
    value={filters.dateFin}
    onChange={(e) =>
      setFilters({
        ...filters,
        dateFin: e.target.value,
      })
    }
  />

  <button
    className="btn-reset-filter"
    onClick={() =>
      setFilters({
        fournisseur: "",
        dateDebut: "",
        dateFin: "",
      })
    }
  >
    Réinitialiser
  </button>
</div>

<div className="table-separator"></div>



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
        {interventionsFiltrees.map((i) => (
            
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
