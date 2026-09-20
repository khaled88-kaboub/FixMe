import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import {
  FaCalendarAlt,
  FaClock,
  FaIndustry,
  FaPlus,
  FaTrash,
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

  const [loading, setLoading] = useState(false);


  // ==========================
  // Chargement
  // ==========================

  useEffect(() => {
    chargerDonnees();
  }, []);


  const chargerDonnees = async () => {
    try {

      const [lignesRes, planificationsRes] =
        await Promise.all([
          axios.get(`${API_URL}/api/lignes`),
          axios.get(
            `${API_URL}/api/planifications-production`
          ),
        ]);

      setLignes(lignesRes.data);
      setPlanifications(planificationsRes.data);

    } catch (error) {

      console.error(error);

      toast.error(
        "Erreur lors du chargement des données."
      );
    }
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
  // Calcul durée
  // ==========================

  const calculerDuree = () => {

    if (
      !form.dateHeureDemarrage ||
      !form.dateHeureArret
    ) {
      return null;
    }

    const debut =
      new Date(form.dateHeureDemarrage);

    const fin =
      new Date(form.dateHeureArret);

    if (fin <= debut) {
      return null;
    }

    return Math.round(
      (fin - debut) / (1000 * 60)
    );
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

    if (
      !form.ligne ||
      !form.dateHeureDemarrage ||
      !form.dateHeureArret
    ) {

      toast.warning(
        "Veuillez remplir tous les champs obligatoires."
      );

      return;
    }

    const debut =
      new Date(form.dateHeureDemarrage);

    const fin =
      new Date(form.dateHeureArret);

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

      setPlanifications((prev) => [
        response.data,
        ...prev,
      ]);

      toast.success(
        "Planification ajoutée avec succès."
      );

      setForm({
        ligne: "",
        dateHeureDemarrage: "",
        dateHeureArret: "",
        commentaire: "",
      });

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Erreur lors de l'ajout."
      );

    } finally {

      setLoading(false);
    }
  };


  // ==========================
  // Suppression
  // ==========================

  const supprimerPlanification = async (id) => {

    if (
      !window.confirm(
        "Voulez-vous supprimer cette planification ?"
      )
    ) {
      return;
    }

    try {

      await axios.delete(
        `${API_URL}/api/planifications-production/${id}`
      );

      setPlanifications((prev) =>
        prev.filter((item) => item._id !== id)
      );

      toast.success(
        "Planification supprimée."
      );

    } catch (error) {

      toast.error(
        "Erreur lors de la suppression."
      );
    }
  };


  return (
    <div className="planification-page">

      {/* ================= HEADER ================= */}

      <div className="page-header">

        <div>

          <h1>
            <FaCalendarAlt />
            Planification de production
          </h1>

          <p>
            Planifier les périodes de production par ligne
          </p>

        </div>

        <div className="total-planifications">

          {planifications.length} planification(s)

        </div>

      </div>


      <div className="planification-layout">


        {/* ================= FORMULAIRE ================= */}

        <div className="form-card">

          <div className="card-title">

            <h2>
              <FaPlus />
              Nouvelle planification
            </h2>

          </div>


          <form onSubmit={handleSubmit}>

            {/* Ligne */}

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

                <option value="">
                  Sélectionner une ligne
                </option>

                {lignes.map((ligne) => (

                  <option
                    key={ligne._id}
                    value={ligne._id}
                  >
                    {ligne.nom}
                  </option>

                ))}

              </select>

            </div>


            {/* Début */}

            <div className="form-group">

              <label>
                <FaClock />
                Date et heure de démarrage *
              </label>

              <input
                type="datetime-local"
                name="dateHeureDemarrage"
                value={
                  form.dateHeureDemarrage
                }
                onChange={handleChange}
              />

            </div>


            {/* Fin */}

            <div className="form-group">

              <label>
                <FaClock />
                Date et heure d'arrêt *
              </label>

              <input
                type="datetime-local"
                name="dateHeureArret"
                value={
                  form.dateHeureArret
                }
                onChange={handleChange}
              />

            </div>


            {/* Durée */}

            {dureeMinutes !== null && (

              <div className="duree-preview">

                <FaClock />

                <span>
                  Durée de production :
                </span>

                <strong>
                  {formatDuree(
                    dureeMinutes
                  )}
                </strong>

              </div>

            )}


            {/* Commentaire */}

            <div className="form-group">

              <label>
                Commentaire
              </label>

              <textarea
                name="commentaire"
                value={form.commentaire}
                onChange={handleChange}
                rows="3"
                placeholder="Commentaire éventuel..."
              />

            </div>

            <div className="form-group">
            <button
              type="submit"
             
              disabled={loading}
            >

              <FaPlus />

              {loading
                ? "Enregistrement..."
                : "Enregistrer la planification"}

            </button>
            </div>
          </form>

        </div>


        {/* ================= TABLEAU ================= */}

        <div className="table-card">

          <div className="card-title">

            <h2>
              Planning de production
            </h2>

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

                {planifications.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="empty"
                    >
                      Aucune planification enregistrée.
                    </td>

                  </tr>

                ) : (

                  planifications.map(
                    (item) => (

                      <tr key={item._id}>

                        <td>
                          <strong>
                            {item.ligne?.nom || "—"}
                          </strong>
                        </td>

                        <td>
                          {new Date(
                            item.dateHeureDemarrage
                          ).toLocaleString(
                            "fr-FR"
                          )}
                        </td>

                        <td>
                          {new Date(
                            item.dateHeureArret
                          ).toLocaleString(
                            "fr-FR"
                          )}
                        </td>

                        <td>

                          <strong>
                            {formatDuree(
                              item.dureeMinutes
                            )}
                          </strong>

                        </td>

                        <td>
                          {item.commentaire || "—"}
                        </td>

                        <td>

                          <button
                            className="btn-delete"
                            onClick={() =>
                              supprimerPlanification(
                                item._id
                              )
                            }
                          >
                            x
                          </button>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
};

export default PlanificationProductionPage;