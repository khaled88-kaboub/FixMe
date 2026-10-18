import ArretnonPlanifie from "../models/ArretnonPlanifie.js";


// Ajouter un arrêt planifié
export const createArretnonPlanifie = async (req, res) => {
  try {
    const {
      ligne,
      typeArret,
      dateHeureArret,
      dateHeureDemarrage,
      commentaire
    } = req.body;

    // Vérifications
    if (
      !ligne ||
      !typeArret ||
      !dateHeureArret ||
      !dateHeureDemarrage
    ) {
      return res.status(400).json({
        message: "Tous les champs obligatoires doivent être renseignés."
      });
    }

    const debut = new Date(dateHeureArret);
    const fin = new Date(dateHeureDemarrage);

    if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({
        message: "Les dates fournies sont invalides."
      });
    }

    if (fin <= debut) {
      return res.status(400).json({
        message:
          "La date de démarrage doit être supérieure à la date d'arrêt."
      });
    }

    // Calcul automatique de la durée
    const dureeMinutes = Math.round(
      (fin - debut) / (1000 * 60)
    );

    const arret = await ArretnonPlanifie.create({
      ligne,
      typeArret,
      dateHeureArret: debut,
      dateHeureDemarrage: fin,
      dureeMinutes,
      commentaire
    });

    const resultat = await ArretnonPlanifie.findById(arret._id)
      .populate("ligne", "nom")
      .populate("typeArret", "nom");

    res.status(201).json(resultat);

  } catch (error) {
    console.error("ERREUR CREATE ARRET NON PLANIFIE :", error);

    res.status(500).json({
      message: error.message
    });
  }
};


// Récupérer tous les arrêts
export const getArretsnonPlanifies = async (req, res) => {
  try {
    const arrets = await ArretnonPlanifie.find()
      .populate("ligne", "nom")
      .populate("typeArret", "nom")
      .sort({
        dateHeureArret: -1
      });

    res.json(arrets);

  } catch (error) {
    console.error("ERREUR GET ARRETS NON PLANIFIES :", error);

    res.status(500).json({
      message: error.message
    });
  }
};


// Supprimer un arrêt
export const deleteArretnonPlanifie = async (req, res) => {
  try {
    const { id } = req.params;

    const arret = await ArretnonPlanifie.findByIdAndDelete(id);

    if (!arret) {
      return res.status(404).json({
        message: "Arrêt non planifié introuvable."
      });
    }

    res.json({
      message: "Arrêt non planifié supprimé."
    });

  } catch (error) {
    console.error("ERREUR DELETE ARRET :", error);

    res.status(500).json({
      message: error.message
    });
  }
};