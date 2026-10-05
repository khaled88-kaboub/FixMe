import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import {
  FaPlus,
  FaTrash,
  FaClock,
  FaIndustry,
  FaTools,
  FaTimes,
  FaFilter,
  FaUndo
} from "react-icons/fa";

import "./ArretsPlanifiesPage.css";

const API_URL = import.meta.env.VITE_API_URL;

// ==========================================
// Fonctions utilitaires de formatage (En dehors du composant)
// ==========================================

// Convertit une date (UTC/ISO) vers le format local pour <input type="datetime-local">
const toLocalISOString = (dateString) => {
    if (!dateString) return "";
    
    // Si la valeur est déjà au format "YYYY-MM-DDTHH:mm" (issu d'un input HTML)
    if (typeof dateString === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateString)) {
      return dateString;
    }
  
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
  
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };
  
  // Formate la date pour l'affichage lisible dans le tableau (ex: 05/10/2026 09:00)
  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
  
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

const ArretsPlanifiesPage = () => {
  const [lignes, setLignes] = useState([]);
  const [typesArret, setTypesArret] = useState([]);
  const [arrets, setArrets] = useState([]);

  const [showModalType, setShowModalType] = useState(false);

  const [nouveauType, setNouveauType] = useState({
    nom: "",
    description: ""
  });

  const [form, setForm] = useState({
    ligne: "",
    typeArret: "",
    dateHeureArret: "",
    dateHeureDemarrage: "",
    commentaire: ""
  });

  const [loading, setLoading] = useState(false);

  // =========================
  // États pour les filtres
  // =========================
  const [filterLigne, setFilterLigne] = useState("");
  const [filterDateDebut, setFilterDateDebut] = useState("");
  const [filterDateFin, setFilterDateFin] = useState("");

  // =========================
  // Chargement
  // =========================

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const [lignesRes, typesRes, arretsRes] = await Promise.all([
        axios.get(`${API_URL}/api/lignes`),
        axios.get(`${API_URL}/api/types-arret`),
        axios.get(`${API_URL}/api/arrets-planifies`)
      ]);

      setLignes(lignesRes.data);
      setTypesArret(typesRes.data);
      setArrets(arretsRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des données.");
    }
  };

  // =========================
  // Formulaire
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };


 // Convertit une date (UTC/ISO) vers le format local pour <input type="datetime-local">
const toLocalISOString = (dateString) => {
    if (!dateString) return "";
    
    // Si la valeur est déjà au format "YYYY-MM-DDTHH:mm" (issu d'un input HTML)
    if (typeof dateString === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateString)) {
      return dateString;
    }
  
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
  
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  

  // =========================
  // Calcul durée
  // =========================

  const calculerDuree = () => {
    if (!form.dateHeureArret || !form.dateHeureDemarrage) {
      return null;
    }

    const debut = new Date(form.dateHeureArret);
    const fin = new Date(form.dateHeureDemarrage);

    if (fin <= debut) {
      return null;
    }

    return Math.round((fin - debut) / (1000 * 60));
  };

  const duree = calculerDuree();

  // =========================
  // Ajouter arrêt
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.ligne ||
      !form.typeArret ||
      !form.dateHeureArret ||
      !form.dateHeureDemarrage
    ) {
      toast.warning("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/arrets-planifies`,
        form
      );

      setArrets((prev) => [response.data, ...prev]);

      toast.success("Arrêt planifié ajouté avec succès.");

      setForm({
        ligne: "",
        typeArret: "",
        dateHeureArret: "",
        dateHeureDemarrage: "",
        commentaire: ""
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Erreur lors de l'ajout."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Ajouter type
  // =========================

  const ajouterTypeArret = async (e) => {
    e.preventDefault();

    if (!nouveauType.nom.trim()) {
      toast.warning("Le nom du type est obligatoire.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/types-arret`,
        nouveauType
      );

      const type = response.data;

      setTypesArret((prev) =>
        [...prev, type].sort((a, b) => a.nom.localeCompare(b.nom))
      );

      setForm((prev) => ({
        ...prev,
        typeArret: type._id
      }));

      setNouveauType({
        nom: "",
        description: ""
      });

      setShowModalType(false);
      toast.success("Type d'arrêt ajouté.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'ajout du type."
      );
    }
  };

  // =========================
  // Supprimer
  // =========================

  const supprimerArret = async (id) => {
    if (!window.confirm("Voulez-vous supprimer cet arrêt planifié ?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/arrets-planifies/${id}`);
      setArrets((prev) => prev.filter((item) => item._id !== id));
      toast.success("Arrêt supprimé.");
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  // =========================
  // Format durée
  // =========================

  const formatDuree = (minutes) => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) {
      return "—";
    }
  
    const minsTotal = Number(minutes);
    const heures = Math.floor(minsTotal / 60);
    const mins = minsTotal % 60;
  
    if (heures === 0) {
      return `${mins} min`;
    }
  
    return `${heures} h ${mins} min`;
  };

  // =========================
  // Logique de Filtrage
  // =========================

  const arretsFiltres = arrets.filter((arret) => {
    // Filtre par ligne
    if (filterLigne && arret.ligne?._id !== filterLigne) {
      return false;
    }
  
    const dateArret = arret.dateHeureArret ? new Date(arret.dateHeureArret) : null;
  
    // Filtre par Date Début
    if (filterDateDebut && dateArret) {
      const minDate = new Date(filterDateDebut);
      if (dateArret < minDate) return false;
    }
  
    // Filtre par Date Fin
    if (filterDateFin && dateArret) {
      const maxDate = new Date(filterDateFin);
      if (dateArret > maxDate) return false;
    }
  
    return true;
  });

  const reinitialiserFiltres = () => {
    setFilterLigne("");
    setFilterDateDebut("");
    setFilterDateFin("");
  };

  return (
    <div className="arrets-page">
      <div className="page-title">
        <div>
          <h1>
            <FaClock /> Temps d'arrêt planifié
          </h1>
          <p>Enregistrement et suivi des arrêts planifiés</p>
        </div>

        <div className="total-arrets">
          {arretsFiltres.length} / {arrets.length} arrêt(s)
        </div>
      </div>

      <div className="arrets-layout">
        {/* ================= FORMULAIRE ================= */}
        <div className="form-card">
          <div className="card-title">
            <h2>
              <FaPlus />
              Nouvel arrêt planifié
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <FaIndustry />
                Ligne *
              </label>
              <select
                name="ligne"
                value={form.ligne}
                onChange={handleChange}
              >
                <option value="">Sélectionner une ligne</option>
                {lignes.map((ligne) => (
                  <option key={ligne._id} value={ligne._id}>
                    {ligne.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <FaTools />
                Type d'arrêt *
              </label>
              <div className="select-with-button">
                <select
                  className="liste"
                  name="typeArret"
                  value={form.typeArret}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner un type</option>
                  {typesArret.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.nom}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn-adds-type"
                  onClick={() => setShowModalType(true)}
                  title="Ajouter un type"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Date et heure d'arrêt *</label>
              <input
                type="datetime-local"
                name="dateHeureArret"
                value={toLocalISOString(form.dateHeureArret)}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Date et heure de démarrage *</label>
              <input
                type="datetime-local"
                name="dateHeureDemarrage"
                value={toLocalISOString(form.dateHeureDemarrage)}
                onChange={handleChange}
              />
            </div>

            {duree !== null && (
              <div className="duree-preview">
                <FaClock />
                <span>Durée calculée :</span>
                <strong>{formatDuree(duree)}</strong>
              </div>
            )}

            <div className="form-group">
              <label>Commentaire</label>
              <textarea
                name="commentaire"
                value={form.commentaire}
                onChange={handleChange}
                placeholder="Commentaire éventuel..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <button type="submit" disabled={loading}>
                <FaPlus />
                {loading ? "Enregistrement..." : "Enregistrer l'arrêt"}
              </button>
            </div>
          </form>
        </div>

        {/* ================= TABLEAU ================= */}
        <div className="table-card">
          <div className="card-title">
            <h2>Liste des arrêts planifiés</h2>
          </div>

          {/* SECTION DES FILTRES */}
          <div className="filters-bar">
            <div className="filter-group">
              <label><FaIndustry /> Ligne</label>
              <select
                value={filterLigne}
                onChange={(e) => setFilterLigne(e.target.value)}
              >
                <option value="">Toutes les lignes</option>
                {lignes.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Du</label>
              <input
                type="datetime-local"
                value={filterDateDebut}
                onChange={(e) => setFilterDateDebut(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Au</label>
              <input
                type="datetime-local"
                value={filterDateFin}
                onChange={(e) => setFilterDateFin(e.target.value)}
              />
            </div>

            {(filterLigne || filterDateDebut || filterDateFin) && (
              <button
                type="button"
                className="btn-reset-filters"
                onClick={reinitialiserFiltres}
                title="Réinitialiser les filtres"
              >
                <FaUndo /> Effacer
              </button>
            )}
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Ligne</th>
                  <th>Type d'arrêt</th>
                  <th>Début</th>
                  <th>Démarrage</th>
                  <th>Durée</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {arretsFiltres.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty">
                      Aucun arrêt ne correspond à vos critères.
                    </td>
                  </tr>
                ) : (
                  arretsFiltres.map((arret) => (
                    <tr key={arret._id}>
                      <td>
                        <strong>{arret.ligne?.nom || "—"}</strong>
                      </td>
                      <td>
                        <span className="type-badge">
                          {arret.typeArret?.nom || "—"}
                        </span>
                      </td>
                      <td>
                      {formatDateTime(arret.dateHeureArret)}
                       
                      </td>
                      <td>
                      {formatDateTime(arret.dateHeureDemarrage)}
                       
                      </td>
                      <td>
                        <strong>{formatDuree(arret.dureeMinutes)}</strong>
                      </td>
                      <td>
                        <button
                          className="btn-delete"
                          onClick={() => supprimerArret(arret._id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODAL TYPE ================= */}
      {showModalType && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Ajouter un type d'arrêt</h2>
              <button onClick={() => setShowModalType(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={ajouterTypeArret}>
              <div className="form-group">
                <label>Nom du type *</label>
                <input
                  type="text"
                  value={nouveauType.nom}
                  onChange={(e) =>
                    setNouveauType({
                      ...nouveauType,
                      nom: e.target.value
                    })
                  }
                  placeholder="Ex : Changement de format"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={nouveauType.description}
                  onChange={(e) =>
                    setNouveauType({
                      ...nouveauType,
                      description: e.target.value
                    })
                  }
                  placeholder="Description du type..."
                  rows="3"
                />
              </div>

              <button type="submit">
                <FaPlus />
                Ajouter le type
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArretsPlanifiesPage;