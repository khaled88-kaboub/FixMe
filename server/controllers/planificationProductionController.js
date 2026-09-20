import PlanificationProduction from "../models/PlanificationProduction.js";

// Ajouter une planification
export const createPlanification = async (req, res) => {
  try {
    const {
      ligne,
      dateHeureDemarrage,
      dateHeureArret,
      commentaire,
    } = req.body;

    if (
      !ligne ||
      !dateHeureDemarrage ||
      !dateHeureArret
    ) {
      return res.status(400).json({
        message: "Tous les champs obligatoires sont requis.",
      });
    }

    const debut = new Date(dateHeureDemarrage);
    const fin = new Date(dateHeureArret);

    if (
      isNaN(debut.getTime()) ||
      isNaN(fin.getTime())
    ) {
      return res.status(400).json({
        message: "Les dates sont invalides.",
      });
    }

    if (fin <= debut) {
      return res.status(400).json({
        message:
          "La date d'arrêt doit être supérieure à la date de démarrage.",
      });
    }

    const dureeMinutes = Math.round(
      (fin - debut) / (1000 * 60)
    );

    const planification =
      await PlanificationProduction.create({
        ligne,
        dateHeureDemarrage: debut,
        dateHeureArret: fin,
        dureeMinutes,
        commentaire,
      });

    const resultat =
      await PlanificationProduction.findById(
        planification._id
      ).populate("ligne", "nom");

    res.status(201).json(resultat);

  } catch (error) {
    console.error(
      "ERREUR CREATE PLANIFICATION :",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// Récupérer toutes les planifications
export const getPlanifications = async (req, res) => {
  try {
    const planifications =
      await PlanificationProduction.find()
        .populate("ligne", "nom")
        .sort({
          dateHeureDemarrage: -1,
        });

    res.json(planifications);

  } catch (error) {
    console.error(
      "ERREUR GET PLANIFICATIONS :",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// Supprimer une planification
export const deletePlanification = async (req, res) => {
  try {
    const { id } = req.params;

    const planification =
      await PlanificationProduction.findByIdAndDelete(id);

    if (!planification) {
      return res.status(404).json({
        message: "Planification introuvable.",
      });
    }

    res.json({
      message: "Planification supprimée avec succès.",
    });

  } catch (error) {
    console.error(
      "ERREUR DELETE PLANIFICATION :",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};