import ArretPlanifie from "../models/ArretPlanifie.js";


// Ajouter un arrêt planifié
export const createArretPlanifie = async (req, res) => {
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

    const arret = await ArretPlanifie.create({
      ligne,
      typeArret,
      dateHeureArret: debut,
      dateHeureDemarrage: fin,
      dureeMinutes,
      commentaire
    });

    const resultat = await ArretPlanifie.findById(arret._id)
      .populate("ligne", "nom")
      .populate("typeArret", "nom");

    res.status(201).json(resultat);

  } catch (error) {
    console.error("ERREUR CREATE ARRET PLANIFIE :", error);

    res.status(500).json({
      message: error.message
    });
  }
};


// Récupérer tous les arrêts
export const getArretsPlanifies = async (req, res) => {
  try {
    const arrets = await ArretPlanifie.find()
      .populate("ligne", "nom")
      .populate("typeArret", "nom")
      .sort({
        dateHeureArret: -1
      });

    res.json(arrets);

  } catch (error) {
    console.error("ERREUR GET ARRETS PLANIFIES :", error);

    res.status(500).json({
      message: error.message
    });
  }
};


// Supprimer un arrêt
export const deleteArretPlanifie = async (req, res) => {
  try {
    const { id } = req.params;

    const arret = await ArretPlanifie.findByIdAndDelete(id);

    if (!arret) {
      return res.status(404).json({
        message: "Arrêt planifié introuvable."
      });
    }

    res.json({
      message: "Arrêt planifié supprimé."
    });

  } catch (error) {
    console.error("ERREUR DELETE ARRET :", error);

    res.status(500).json({
      message: error.message
    });
  }
};