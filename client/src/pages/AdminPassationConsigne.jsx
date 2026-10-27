import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaFilePdf,
  FaTrash,
  FaEdit,
  FaPlus,
  FaPaperclip,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaComments,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminPassationConsigne.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminPassationConsigne() {
  const [consignes, setConsignes] = useState([]);
  const [lignes, setLignes] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [equipementsFiltres, setEquipementsFiltres] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Suivi des réponses aux consignes
  const [showReponsesModal, setShowReponsesModal] = useState(false);
  const [consigneSelectionnee, setConsigneSelectionnee] = useState(null);
  const [commentaire, setCommentaire] = useState("");
  const [statutVise, setStatutVise] = useState("En cours");
  const [emetteurReponse, setEmetteurReponse] = useState("");
  const [reponseEnEditionId, setReponseEnEditionId] = useState(null);

  // Filtres
  const [filters, setFilters] = useState({
    quart: "",
    priorite: "",
    statut: "",
    ligne: "",
    dateDebut: "",
    dateFin: "",
  });

  // Formulaire
  const [form, setForm] = useState({
    titre: "",
    description: "",
    quart: "A",
    dateConsigne: new Date().toISOString().slice(0, 10),
    priorite: "Moyenne",
    statut: "En cours",
    emetteur: "",
    ligne: "",
    equipement: "",
  });

  const [pieceJointe, setPieceJointe] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  /* ===================== CHARGEMENT DES DONNÉES ===================== */
  const loadAll = async () => {
    try {
      const [c, l, e] = await Promise.all([
        axios.get(`${API_URL}/api/consignes`),
        axios.get(`${API_URL}/api/lignes`),
        axios.get(`${API_URL}/api/equipements`),
      ]);
      setConsignes(c.data);
      setLignes(l.data);
      setEquipements(e.data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des données");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);


  // Récupération de l'utilisateur connecté depuis le localStorage
useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const nomUtilisateur = user?.name || user?.nom || user?.username || "";
        if (nomUtilisateur) {
          setForm((prevForm) => ({ ...prevForm, emetteur: nomUtilisateur }));
          setEmetteurReponse(nomUtilisateur);
        }
      } catch (error) {
        console.error("Erreur lors de la lecture de l'utilisateur dans localStorage", error);
      }
    }
  }, []);
  /* ===================== FILTRE DES ÉQUIPEMENTS PAR LIGNE ===================== */
  useEffect(() => {
    if (!form.ligne) {
      setEquipementsFiltres([]);
      return;
    }

    const filtered = equipements.filter((e) => {
      if (!Array.isArray(e.ligne)) return false;
      return e.ligne.some((l) => {
        if (typeof l === "object" && l._id)
          return l._id.toString() === form.ligne.toString();
        return l.toString() === form.ligne.toString();
      });
    });

    setEquipementsFiltres(filtered);
  }, [form.ligne, equipements]);

  /* ===================== SOUMISSION FORMULAIRE ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("titre", form.titre);
      formData.append("description", form.description);
      formData.append("quart", form.quart);
      formData.append("dateConsigne", form.dateConsigne);
      formData.append("priorite", form.priorite);
      formData.append("statut", form.statut);
      formData.append("emetteur", form.emetteur);

      if (form.ligne) formData.append("ligne", form.ligne);
      if (form.equipement) formData.append("equipement", form.equipement);
      if (pieceJointe) formData.append("pieceJointe", pieceJointe);

      if (editMode) {
        await axios.put(`${API_URL}/api/consignes/${currentId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Consigne modifiée avec succès");
      } else {
        await axios.post(`${API_URL}/api/consignes`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Consigne ajoutée avec succès");
      }

      closeModal();
      loadAll();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(
        err.response?.data?.message || "Erreur lors de l'enregistrement"
      );
    }
  };

  /* ===================== ÉDITION ===================== */
  const handleEdit = (c) => {
    setEditMode(true);
    setCurrentId(c._id);
    setForm({
      titre: c.titre || "",
      description: c.description || "",
      quart: c.quart || "Matin",
      dateConsigne: c.dateConsigne ? c.dateConsigne.slice(0, 10) : "",
      priorite: c.priorite || "Moyenne",
      statut: c.statut || "En cours",
      emetteur: c.emetteur || "",
      ligne: c.ligne?._id || "",
      equipement: c.equipement?._id || "",
    });

    if (c.pieceJointe?.chemin) {
      setFilePreview(`${API_URL}${c.pieceJointe.chemin}`);
    } else {
      setFilePreview(null);
    }
    setPieceJointe(null);
    setShowModal(true);
  };

  /* ===================== RÉPONSES AUX CONSIGNES ===================== */
  const ouvrirReponses = (consigne) => {
    setConsigneSelectionnee(consigne);
    setCommentaire("");
    setStatutVise(consigne.statut || "En cours");
    setShowReponsesModal(true);
  };

  const fermerReponses = () => {
    setShowReponsesModal(false);
    setConsigneSelectionnee(null);
    setCommentaire("");
    setReponseEnEditionId(null);
  };

  const ouvrirEditionReponse = (reponse) => {
    setReponseEnEditionId(reponse._id);
    setCommentaire(reponse.commentaire || "");
    setStatutVise(reponse.statutVise || "En cours");
    setEmetteurReponse(reponse.emetteur || "");
  };

  const annulerEditionReponse = () => {
    setReponseEnEditionId(null);
    setCommentaire("");
    setStatutVise(consigneSelectionnee?.statut || "En cours");
  };

  const ajouterReponse = async (e) => {
    e.preventDefault();
    if (!consigneSelectionnee?._id) return;
    if (!commentaire.trim()) return toast.error("Veuillez saisir un commentaire");
    if (!emetteurReponse.trim()) return toast.error("Veuillez renseigner le nom de l'auteur");

    try {
      const payload = {
        commentaire: commentaire.trim(),
        emetteur: emetteurReponse.trim(),
        statutVise,
      };

      const response = reponseEnEditionId
        ? await axios.put(
            `${API_URL}/api/consignes/${consigneSelectionnee._id}/reponses/${reponseEnEditionId}`,
            payload
          )
        : await axios.post(
            `${API_URL}/api/consignes/${consigneSelectionnee._id}/reponses`,
            payload
          );

      const consigneMiseAJour = response.data;
      setConsignes((prev) => prev.map((c) => c._id === consigneMiseAJour._id ? consigneMiseAJour : c));
      setConsigneSelectionnee(consigneMiseAJour);
      setCommentaire("");
      setReponseEnEditionId(null);
      setStatutVise(consigneMiseAJour.statut || statutVise);
      toast.success(reponseEnEditionId ? "Réponse modifiée avec succès" : "Réponse ajoutée avec succès");
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout de la réponse");
    }
  };

  /* ===================== SUPPRESSION ===================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette consigne ?"))
      return;
    try {
      await axios.delete(`${API_URL}/api/consignes/${id}`);
      toast.success("Consigne supprimée");
      loadAll();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  /* ===================== FERMER MODALE ===================== */
  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentId(null);
    setPieceJointe(null);
    setFilePreview(null);
    setForm({
      titre: "",
      description: "",
      quart: "Matin",
      dateConsigne: new Date().toISOString().slice(0, 10),
      priorite: "Moyenne",
      statut: "En cours",
      emetteur: "",
      ligne: "",
      equipement: "",
    });
  };

  /* ===================== FILTRAGE EN TEMPS RÉEL ===================== */
  const consignesFiltrees = consignes.filter((c) => {
    const matchQuart = !filters.quart || c.quart === filters.quart;
    const matchPriorite = !filters.priorite || c.priorite === filters.priorite;
    const matchStatut = !filters.statut || c.statut === filters.statut;
    const matchLigne = !filters.ligne || c.ligne?._id === filters.ligne;

    const dateC = new Date(c.dateConsigne);
    const matchDateDebut =
      !filters.dateDebut || dateC >= new Date(filters.dateDebut);
    const matchDateFin =
      !filters.dateFin || dateC <= new Date(filters.dateFin + "T23:59:59");

    return (
      matchQuart &&
      matchPriorite &&
      matchStatut &&
      matchLigne &&
      matchDateDebut &&
      matchDateFin
    );
  });

  /* ===================== EXPORT PDF ===================== */
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Registre de Passation de Consignes", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Généré le : ${new Date().toLocaleDateString()}`, 14, 27);

    const rows = consignesFiltrees.map((c) => [
      new Date(c.dateConsigne).toLocaleDateString(),
      c.quart,
      c.emetteur || "-",
      c.titre,
      c.ligne?.nom || "-",
      c.equipement ? `${c.equipement.designation}` : "-",
      c.priorite,
      c.statut,
    ]);

    autoTable(doc, {
      startY: 35,
      head: [
        [
          "Date",
          "Quart",
          "Émetteur",
          "Titre / Consigne",
          "Ligne",
          "Équipement",
          "Priorité",
          "Statut",
        ],
      ],
      body: rows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
    });

    doc.save("passation-consignes.pdf");
  };

  /* Helper pour les badges de priorité */
  const getPrioriteBadge = (priorite) => {
    switch (priorite) {
      case "Urgente":
        return "badge-prio urgence";
      case "Haute":
        return "badge-prio haute";
      case "Moyenne":
        return "badge-prio moyenne";
      default:
        return "badge-prio basse";
    }
  };

  /* Helper pour le statut */
  const getStatutBadge = (statut) => {
    switch (statut) {
      case "Traitee":
        return "badge-statut traitee";
      case "A surveiller":
        return "badge-statut surveiller";
      default:
        return "badge-statut encours";
    }
  };


  
const supprimerReponse = async (reponseId) => {
    if (!consigneSelectionnee) return;
  
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer cette réponse ?"
    );
  
    if (!confirmation) return;
  
    try {
      const { data } = await axios.delete(
        `${API_URL}/api/consignes/${consigneSelectionnee._id}/reponses/${reponseId}`
      );
  
      const consigneMaj = data.consigne;
  
      // Actualiser le tableau principal
      setConsignes((prev) =>
        prev.map((c) =>
          c._id === consigneMaj._id ? consigneMaj : c
        )
      );
  
      // Actualiser l'historique affiché dans la modale
      setConsigneSelectionnee(consigneMaj);
  
      toast.success("Réponse supprimée avec succès.");
    } catch (error) {
      console.error(error);
  
      toast.error(
        error.response?.data?.message ||
        "Erreur lors de la suppression de la réponse."
      );
    }
  };
  
  return (
    <div className="consigne-container">
      <ToastContainer />

      {/* HEADER */}
      <div className="header">
        <h2 className="titre">
          Passation de Consignes
          <span className="count-badge">{consignesFiltrees.length}</span>
        </h2>
        <div className="header-actions">
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <FaPlus /> Nouvelle Consigne
          </button>
          <button className="btn-add" onClick={exportPDF}>
            <FaFilePdf /> Export PDF
          </button>
        </div>
      </div>

      {/* FILTRES DANS UNE SEULE LIGNE (PC) */}
      <div className="filters-container">
        <div>
        <select
          value={filters.quart}
          onChange={(e) => setFilters({ ...filters, quart: e.target.value })}
        >
          <option value="">-- Tous les quarts --</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="SURFACE">SURFACE</option>
        </select>
        </div>
        
<div>
<select
          value={filters.priorite}
          onChange={(e) => setFilters({ ...filters, priorite: e.target.value })}
        >
          <option value="">-- Priorités --</option>
          <option value="Basse">Basse</option>
          <option value="Moyenne">Moyenne</option>
          <option value="Haute">Haute</option>
          <option value="Urgente">Urgente</option>
        </select>  
</div>
        
<div>
<select
          value={filters.statut}
          onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
        >
          <option value="">-- Statuts --</option>
          <option value="En cours">En cours</option>
          <option value="A surveiller">À surveiller</option>
          <option value="Traitee">Traitée</option>
        </select>
</div>
        
<div>
<select
          value={filters.ligne}
          onChange={(e) => setFilters({ ...filters, ligne: e.target.value })}
        >
          <option value="">-- Lignes --</option>
          {lignes.map((l) => (
            <option key={l._id} value={l._id}>
              {l.nom}
            </option>
          ))}
        </select>
</div>
        
<div>
<input
          type="date"
          value={filters.dateDebut}
          onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
        />
</div>
       
<div>
<input
          type="date"
          value={filters.dateFin}
          onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
        />
</div>
       

        <button
          className="btn-reset-filter"
          onClick={() =>
            setFilters({
              quart: "",
              priorite: "",
              statut: "",
              ligne: "",
              dateDebut: "",
              dateFin: "",
            })
          }
        >
          Réinitialiser
        </button>
      </div>

      <div className="table-separator"></div>

      {/* TABLEAU DES CONSIGNES */}
      <table>
        <thead>
          <tr>
            <th>Date / Quart</th>
            <th>Émetteur</th>
            <th>Titre & Description</th>
            <th>Ligne / Équipement</th>
            <th>Priorité</th>
            <th>Statut</th>
            <th>P.J</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {consignesFiltrees.map((c) => (
            <tr key={c._id}>
              <td>
                <div className="date-quart">
                  <strong>
                    {new Date(c.dateConsigne).toLocaleDateString()}
                  </strong>
                  <span className="quart-tag">{c.quart}</span>
                </div>
              </td>
              <td>{c.emetteur}</td>
              <td className="description-cell">
                <div className="consigne-title">{c.titre}</div>
                <div className="consigne-desc">{c.description}</div>
              </td>
              <td>
                <div>
                  <strong>Ligne :</strong> {c.ligne?.nom || "-"}
                </div>
                {c.equipement && (
                  <small className="text-muted">
                    {c.equipement.designation} ({c.equipement.code})
                  </small>
                )}
              </td>
              <td>
                <span className={getPrioriteBadge(c.priorite)}>
                  {c.priorite}
                </span>
              </td>
              <td>
                <span className={getStatutBadge(c.statut)}>{c.statut}</span>
              </td>
              <td>
                {c.pieceJointe?.chemin ? (
                  <a
                    href={`${API_URL}${c.pieceJointe.chemin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pj-link"
                  >
                    <FaPaperclip />
                  </a>
                ) : (
                  <span className="no-pj">—</span>
                )}
              </td>
              <td>
               <button
                  type="button"
                  className="btn-edit"
                  title="Voir les réponses / ajouter une réponse"
                  onClick={() => ouvrirReponses(c)}
                >
                  <FaComments /> {c.reponses?.length || 0}
                </button> 
                <button className="btn-edit" onClick={() => handleEdit(c)} title="Modifier">
                  <FaEdit />
                </button>
                 <button className="btn-delete" onClick={() => handleDelete(c._id)} title="Supprimer">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODALE D'AJOUT / ÉDITION */}
      {showModal && (
        <div className="modalo-overlayo">
          <div className="modalo">
            <h3>
              {editMode ? "Modifier la consigne" : "Nouvelle consigne de passation"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Émetteur / Responsable *"
                  required
                  value={form.emetteur}
                  onChange={(e) =>
                    setForm({ ...form, emetteur: e.target.value })
                  }
                />
                <select
                  value={form.quart}
                  onChange={(e) => setForm({ ...form, quart: e.target.value })}
                >
                  <option value="A">Shift A</option>
                  <option value="B">Shift B</option>
                  <option value="C">Shift C</option>
                  <option value="Surface">Shift surface</option>
                </select>
              </div>

              <div className="form-row">
                <input
                  type="date"
                  required
                  value={form.dateConsigne}
                  onChange={(e) =>
                    setForm({ ...form, dateConsigne: e.target.value })
                  }
                />
                <select
                  value={form.priorite}
                  onChange={(e) =>
                    setForm({ ...form, priorite: e.target.value })
                  }
                >
                  <option value="Basse">Priorité : Basse</option>
                  <option value="Moyenne">Priorité : Moyenne</option>
                  <option value="Haute">Priorité : Haute</option>
                  <option value="Urgente">Priorité : Urgente</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Titre de la consigne *"
                required
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
              />

              <textarea
                placeholder="Détails importants / Consignes transmises... *"
                required
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <div className="form-row">
                <select
                  value={form.ligne}
                  onChange={(e) =>
                    setForm({ ...form, ligne: e.target.value, equipement: "" })
                  }
                >
                  <option value="">-- Ligne (optionnelle) --</option>
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
                      : "-- Choisir une ligne d'abord --"}
                  </option>
                  {equipementsFiltres.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.designation} ({e.code})
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={form.statut}
                onChange={(e) => setForm({ ...form, statut: e.target.value })}
              >
                <option value="En cours">Statut : En cours</option>
                <option value="A surveiller">Statut : À surveiller</option>
                <option value="Traitee">Statut : Traitée</option>
              </select>

              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setPieceJointe(file);
                    setFilePreview(URL.createObjectURL(file));
                  }
                }}
              />

              {filePreview && (
                <div className="pdf-preview">
                  <span>Pièce jointe : </span>
                  <a href={filePreview} target="_blank" rel="noreferrer">
                    Afficher le fichier
                  </a>
                </div>
              )}

              <div className="actions">
                <button type="submit">
                  {editMode ? "Enregistrer les modifications" : "Créer la consigne"}
                </button>
                <button type="button" className="cancel" onClick={closeModal}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* MODALE DE SUIVI / RÉPONSES */}
      {showReponsesModal && consigneSelectionnee && (
        <div className="modalo-overlayo" onClick={fermerReponses}>
          <div className="modalo" onClick={(e) => e.stopPropagation()}>
            <h3>Suivi de la consigne</h3>

            <div className="modal-reponses-header">
              <h4>{consigneSelectionnee.titre}</h4>
              <p>{consigneSelectionnee.description}</p>
              </div>
              
            <div className="modal-reponses-header">
              <small>Émetteur : {consigneSelectionnee.emetteur || "-"} · Quart : {consigneSelectionnee.quart || "-"}</small>
              <p>Statut actuel : <strong>{consigneSelectionnee.statut || "En cours"}</strong></p>
            </div>
            
           
            <div className="modal-reponses-body">
              <h2>Historique des réponses (Total: {consigneSelectionnee.reponses?.length || 0})</h2>
              {consigneSelectionnee.reponses?.length ? (
                [...consigneSelectionnee.reponses]
                  .sort((a, b) => new Date(b.dateReponse) - new Date(a.dateReponse))
                  .map((rep, index) => (
                    <div className="reponse-item" key={rep._id || index}>
                      <div className="reponse-item-header">
                        <strong className="nom">* {rep.emetteur || "Utilisateur"}</strong>
                        <small>---------- créé le: {rep.dateReponse ? new Date(rep.dateReponse).toLocaleString() : "Date inconnue"}</small>
                      </div>
                      <p>{rep.commentaire}</p>
                      <span className="reponse-statut">Statut proposé : <strong>{rep.statutVise || "En cours"}</strong></span>
                      {rep._id && (
                       <div className="reponse-actions">
  <button
    type="button"
    className="btn-modifier-reponse"
    onClick={() => ouvrirEditionReponse(rep)}
  >
    <FaEdit /> Modifier
  </button>

  <button
    type="button"
    className="btn-supprimer-reponse"
    onClick={() => supprimerReponse(rep._id)}
  >
    <FaTrash /> Supprimer
  </button>
</div>
                      )}
                       <h2>******************</h2>
                    </div>
                  ))
              ) : <p className="aucune-reponse">Aucune réponse pour le moment.</p>}
             
            </div>
            
            <form onSubmit={ajouterReponse} className="form-reponse">
              <h4>{reponseEnEditionId ? "Modifier la réponse" : "Ajouter une réponse"}</h4>
              <input type="text" placeholder="Nom de l'auteur *" value={emetteurReponse}
                onChange={(e) => setEmetteurReponse(e.target.value)} required />
              <textarea placeholder="Votre commentaire / réponse *" value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)} required rows={4} />
              <select value={statutVise} onChange={(e) => setStatutVise(e.target.value)}>
                <option value="En cours">Statut : En cours</option>
                <option value="A surveiller">Statut : À surveiller</option>
                <option value="Traitee">Statut : Traitée</option>
              </select>
              <div className="actions">
                <button type="submit">{reponseEnEditionId ? "Enregistrer les modifications" : "Ajouter la réponse"}</button>
                {reponseEnEditionId && (
                  <button type="button" className="cancel" onClick={annulerEditionReponse}>
                    Annuler la modification
                  </button>
                )}
                <button type="button" className="cancel" onClick={fermerReponses}>Fermer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}