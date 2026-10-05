import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import {
  FaCalendarAlt,
  FaClock,
  FaIndustry,
  FaPlus,
  FaFilter,
  FaEraser,
} from "react-icons/fa";

import "./PlanificationProductionPage.css";

const API_URL = import.meta.env.VITE_API_URL;

const PlanificationProductionPage = () => {
  const [lignes, setLignes] = useState([]);
  const [planifications, setPlanifications] = useState([]);

  const [form, setForm] = useState({
    ligne: "",
    dateHeureDemarrage: "",
    dateHeureArret: "",
    commentaire: "",
  });

  // États pour les filtres
  const [filtres, setFiltres] = useState({
    ligne: "",
    dateDebut: "",
    dateFin: "",
  });

  const [loading, setLoading] = useState(false);

  // ==========================
  // Chargement
  // ==========================

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const [lignesRes, planificationsRes] = await Promise.all([
        axios.get(`${API_URL}/api/lignes`),
        axios.get(`${API_URL}/api/planifications-production`),
      ]);

      setLignes(lignesRes.data);
      setPlanifications(planificationsRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des données.");
    }
  };

  // ==========================
  // Gestion Filtres
  // ==========================

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltres((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const reinitialiserFiltres = () => {
    setFiltres({
      ligne: "",
      dateDebut: "",
      dateFin: "",
    });
  };

  // Filtrage dynamique des données
  const planificationsFiltrees = useMemo(() => {
    return planifications.filter((item) => {
      // Filtre par Ligne
      if (filtres.ligne) {
        const itemLigneId = item.ligne?._id || item.ligne;
        if (itemLigneId !== filtres.ligne) return false;
      }

      // Filtre par Date Début
      if (filtres.dateDebut) {
        const filterDebut = new Date(filtres.dateDebut);
        const itemDebut = new Date(item.dateHeureDemarrage);
        if (itemDebut < filterDebut) return false;
      }

      // Filtre par Date Fin
      if (filtres.dateFin) {
        const filterFin = new Date(filtres.dateFin);
        // On ajuste au dernier instant de la journée si seule la date est sélectionnée
        filterFin.setHours(23, 59, 59, 999);
        const itemFin = new Date(item.dateHeureArret);
        if (itemFin > filterFin) return false;
      }

      return true;
    });
  }, [planifications, filtres]);

  // Calcul du total des durées filtrées (en minutes)
  const totalDureeMinutes = useMemo(() => {
    return planificationsFiltrees.reduce((acc, item) => {
      return acc + (Number(item.dureeMinutes) || 0);
    }, 0);
  }, [planificationsFiltrees]);

  // Conversion en Jours / Heures / Mins
  const formatTotalDuree = (totalMins) => {
    if (!totalMins || totalMins <= 0) return "0 min";

    const jours = Math.floor(totalMins / (24 * 60));
    const resteMinutesApresJours = totalMins % (24 * 60);
    const heures = Math.floor(resteMinutesApresJours / 60);
    const mins = resteMinutesApresJours % 60;

    let resultat = "";
    if (jours > 0) resultat += `${jours} j `;
    if (heures > 0 || jours > 0) resultat += `${heures} h `;
    resultat += `${mins} min`;

    return resultat;
  };


  // Convertit une date (UTC/ISO) en format ISO local pour <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
const toLocalISOString = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  
  const tzOffset = date.getTimezoneOffset() * 60000; // Décalage en ms
  const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  return localISOTime;
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
  // ==========================
  // Modification formulaire
  // ==========================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================
  // Calcul durée formulaire
  // ==========================

  const calculerDuree = () => {
    if (!form.dateHeureDemarrage || !form.dateHeureArret) {
      return null;
    }

    const debut = new Date(form.dateHeureDemarrage);
    const fin = new Date(form.dateHeureArret);

    if (fin <= debut) {
      return null;
    }

    return Math.round((fin - debut) / (1000 * 60));
  };

  const dureeMinutes = calculerDuree();

  // ==========================
  // Format durée
  // ==========================

  const formatDuree = (minutes) => {
    if (minutes === null || minutes === undefined) {
      return "—";
    }

    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${heures} h ${mins} min`;
  };

  // ==========================
  // Ajouter planification
  // ==========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.ligne || !form.dateHeureDemarrage || !form.dateHeureArret) {
      toast.warning("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const debut = new Date(form.dateHeureDemarrage);
    const fin = new Date(form.dateHeureArret);

    if (fin <= debut) {
      toast.error(
        "La date d'arrêt doit être supérieure à la date de démarrage."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/planifications-production`,
        form
      );

      setPlanifications((prev) => [response.data, ...prev]);
      toast.success("Planification ajoutée avec succès.");

      setForm({
        ligne: "",
        dateHeureDemarrage: "",
        dateHeureArret: "",
        commentaire: "",
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

  // ==========================
  // Suppression
  // ==========================

  const supprimerPlanification = async (id) => {
    if (!window.confirm("Voulez-vous supprimer cette planification ?")) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/planifications-production/${id}`
      );

      setPlanifications((prev) => prev.filter((item) => item._id !== id));
      toast.success("Planification supprimée.");
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="planification-page">
      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div>
          <h1>
            <FaCalendarAlt /> Planification de production
          </h1>
          <p>Planifier les périodes de production par ligne</p>
        </div>

        <div className="total-planifications">
          {planificationsFiltrees.length} / {planifications.length} planification(s)
        </div>
      </div>

      <div className="planification-layout">
        {/* ================= FORMULAIRE ================= */}
        <div className="form-card">
          <div className="card-title">
            <h2>
              <FaPlus /> Nouvelle planification
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Ligne */}
            <div className="form-group">
              <label>
                <FaIndustry /> Ligne *
              </label>
              <select name="ligne" value={form.ligne} onChange={handleChange}>
                <option value="">Sélectionner une ligne</option>
                {lignes.map((ligne) => (
                  <option key={ligne._id} value={ligne._id}>
                    {ligne.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Début */}
            <div className="form-group">
              <label>
                <FaClock /> Date et heure de démarrage *
              </label>
              <input
  type="datetime-local"
  name="dateHeureDemarrage"
  value={toLocalISOString(form.dateHeureDemarrage)}
  onChange={handleChange}
/>
            </div>

            {/* Fin */}
            <div className="form-group">
              <label>
                <FaClock /> Date et heure d'arrêt *
              </label>
              <input
  type="datetime-local"
  name="dateHeureArret"
  value={toLocalISOString(form.dateHeureArret)}
  onChange={handleChange}
/>
            </div>

            {/* Durée */}
            {dureeMinutes !== null && (
              <div className="duree-preview">
                <FaClock />
                <span>Durée de production :</span>
                <strong>{formatDuree(dureeMinutes)}</strong>
              </div>
            )}

            {/* Commentaire */}
            <div className="form-group">
              <label>Commentaire</label>
              <textarea
                name="commentaire"
                value={form.commentaire}
                onChange={handleChange}
                rows="3"
                placeholder="Commentaire éventuel..."
              />
            </div>

            <div className="form-group">
              <button type="submit" disabled={loading}>
                <FaPlus />
                {loading ? "Enregistrement..." : "Enregistrer la planification"}
              </button>
            </div>
          </form>
        </div>

        {/* ================= TABLEAU & FILTRES ================= */}
        <div className="table-card">
          <div className="card-title">
            <h2>Planning de production</h2>
          </div>

          {/* BARRE DE FILTRES */}
          {/* BARRE DE FILTRES */}
<div className="filters-card">
  <div className="filters-header">
    <span className="filters-title">
      <FaFilter /> Filtrer les résultats
    </span>
    {(filtres.ligne || filtres.dateDebut || filtres.dateFin) && (
      <button onClick={reinitialiserFiltres} className="btn-reset-filters" type="button">
        <FaEraser /> Réinitialiser
      </button>
    )}
  </div>

  <div className="filters-grid">
    {/* Filtre Ligne */}
    <div className="filter-group">
      <label>
        <FaIndustry /> Ligne
      </label>

      <select name="ligne" value={filtres.ligne} onChange={handleFilterChange}>
        <option value="">Toutes les lignes</option>
        {lignes.map((ligne) => (
          <option key={ligne._id} value={ligne._id}>
            {ligne.nom}
          </option>
        ))}
      </select>
    </div>

    {/* Filtre Date Début */}
    <div className="filter-group">
      <label>
        <FaCalendarAlt /> Date de début
      </label>

      <input
        type="date"
        name="dateDebut"
        value={filtres.dateDebut}
        onChange={handleFilterChange}
      />
    </div>

    {/* Filtre Date Fin */}
    <div className="filter-group">
      <label>
        <FaCalendarAlt /> Date de fin
      </label>

      <input
        type="date"
        name="dateFin"
        value={filtres.dateFin}
        onChange={handleFilterChange}
      />
    </div>
  </div>
</div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Ligne</th>
                  <th>Démarrage production</th>
                  <th>Arrêt production</th>
                  <th>Durée</th>
                  <th>Commentaire</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {planificationsFiltrees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty">
                      Aucune planification trouvée.
                    </td>
                  </tr>
                ) : (
                  planificationsFiltrees.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <strong>{item.ligne?.nom || "—"}</strong>
                      </td>
                     {/* Colonne Démarrage */}
<td>
  {formatDateTime(item.dateHeureDemarrage)}
</td>

{/* Colonne Arrêt */}
<td>
  {formatDateTime(item.dateHeureArret)}
</td>
                      <td>
                        <strong>{formatDuree(item.dureeMinutes)}</strong>
                      </td>
                      <td>{item.commentaire || "—"}</td>
                      <td>
                        <button
                          className="btn-delete"
                          onClick={() => supprimerPlanification(item._id)}
                        >
                          x
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* PIED DE TABLEAU - SOMMES & CONVERSIONS */}
              {planificationsFiltrees.length > 0 && (
                <tfoot>
                  <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}>
                    <td colSpan="3" style={{ textAlign: "right" }}>
                      Durée totale cumulée :
                    </td>
                    <td colSpan="3">
                      <div>{formatDuree(totalDureeMinutes)}</div>
                      <div style={{ color: "#2b6cb0", fontSize: "0.9em", marginTop: "2px" }}>
                        soit <strong>{formatTotalDuree(totalDureeMinutes)}</strong> ({(totalDureeMinutes / (24 * 60)).toFixed(2)} jour(s))
                      </div>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanificationProductionPage;