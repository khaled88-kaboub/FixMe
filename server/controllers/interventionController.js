// controllers/interventionController.js
import Intervention from "../models/Intervention.js";
import Counter from "../models/Counter.js";

/**
 * Génère un numéro d'intervention unique au format INT-YYYY-0001
 */
async function generateNumero() {
  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { name: `intervention-${year}` },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  const sequence = String(counter.value).padStart(4, "0");
  return `INT-${year}-${sequence}`;
}

/**
 * @desc Créer une nouvelle intervention
 * @route POST /api/interventions
 */
export const createIntervention = async (req, res) => {
  try {
    const {
    
      ligne,
      equipement,
      ligneAsubiArret,
      dateHeureArretLigne,
      equipementAsubiArret,
      dateHeureArretEquipement,
      descriptionAnomalie,
      demandeurNom,
    } = req.body;

    if (  !ligne || !equipement || !descriptionAnomalie || !demandeurNom) {
      return res
        .status(400)
        .json({ message: "Tous les champs requis ne sont pas remplis." });
    }

    const numero = await generateNumero();

    const intervention = new Intervention({
      numero,
      ligne,
      equipement,
      ligneAsubiArret,
      dateHeureArretLigne,
      equipementAsubiArret,
      dateHeureArretEquipement,
      descriptionAnomalie,
      demandeurNom,
      createdBy: req.user ? req.user._id : null, // si token
    });

    const saved = await intervention.save();
    const io = req.app.get("io");
    const interventions = await Intervention.find();
    io.emit("interventionsUpdate", interventions); // ⚡ broadcast

    res.status(201).json({
      message: "Intervention créée avec succès",
      numero: saved.numero,
      intervention: saved,
    });
  } catch (error) {
    console.error("Erreur création intervention :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

/**
 * @desc Obtenir toutes les interventions
 * @route GET /api/interventions
 */
export const getAllInterventions = async (req, res) => {
  try {
    const interventions = await Intervention.find()
      .populate("ligne", "nom") // récupère uniquement le champ nom
      .populate("equipement", "code designation")// récupère code + designation
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(interventions);
  } catch (error) {
    console.error("Erreur récupération interventions :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};




/**
 * @desc Obtenir une intervention par ID
 * @route GET /api/interventions/:id
 */
export const getInterventionById = async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id)
    .populate("ligne") // récupère uniquement le champ nom
    .populate("equipement"); //récupère code + designation
    if (!intervention)
      return res.status(404).json({ message: "Intervention non trouvée" });

    res.status(200).json(intervention);
  } catch (error) {
    console.error("Erreur getInterventionById :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

/**
 * @desc Mettre à jour une intervention (statut ou infos)
 * @route PUT /api/interventions/:id
 */
export const updateIntervention = async (req, res) => {
  try {
    const intervention = await Intervention.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    const io = req.app.get("io");
    const interventions = await Intervention.find();
    io.emit("interventionsUpdate", interventions);

    if (!intervention)
      return res.status(404).json({ message: "Intervention non trouvée" });

    res
      .status(200)
      .json({ message: "Intervention mise à jour avec succès", intervention });
  } catch (error) {
    console.error("Erreur updateIntervention :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

/**
 * @desc Supprimer une intervention
 * @route DELETE /api/interventions/:id
 */
export const deleteIntervention = async (req, res) => {
  try {
    const intervention = await Intervention.findByIdAndDelete(req.params.id);
    const io = req.app.get("io");
    const interventions = await Intervention.find();
    io.emit("interventionsUpdate", interventions);

    if (!intervention)
      return res.status(404).json({ message: "Intervention non trouvée" });

    res.status(200).json({ message: "Intervention supprimée" });
  } catch (error) {
    console.error("Erreur deleteIntervention :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
