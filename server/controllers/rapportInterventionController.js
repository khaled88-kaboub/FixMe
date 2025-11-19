import RapportIntervention from "../models/RapportIntervention.js";
import Intervention from "../models/Intervention.js";

// 🟢 Créer un rapport d’intervention
export const createRapport = async (req, res) => {
  try {
    const {
      intervention,
      dateIntervention,
      descriptionTravaux,
      piecesRemplacees,
      commentaires,
      techniciens
    } = req.body;

    // Vérifie si l’intervention existe
    const existingIntervention = await Intervention.findById(intervention);
    if (!existingIntervention) {
      return res.status(404).json({ message: "Intervention introuvable" });
    }

    const rapport = new RapportIntervention({
      intervention,
      dateIntervention,
      descriptionTravaux,
      piecesRemplacees,
      commentaires,
      techniciens
    });

    await rapport.save();
    res.status(201).json(rapport);
  } catch (err) {
    console.error("Erreur création rapport:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// 🟡 Obtenir tous les rapports
export const getAllRapports = async (req, res) => {
  try {
    const rapports = await RapportIntervention.find()
      .populate("intervention", "numero demandeurNom ligne equipement")
      .populate("techniciens.technicien", "nom prenom email")
      .populate({
        path: "intervention",
        populate: [
          { path: "ligne", select: "nom" },
          { path: "equipement", select: "code" }
        ],
      })
      .sort({ createdAt: -1 });

    res.json(rapports);
  } catch (err) {
    res.status(500).json({ message: "Erreur de récupération des rapports" });
  }
};

// 🔵 Obtenir un seul rapport par ID
export const getRapportById = async (req, res) => {
  try {
    const rapport = await RapportIntervention.findById(req.params.id)
      .populate("intervention", "numero demandeurNom ligne equipement")
      .populate("techniciens.technicien", "nom prenom email")
      .populate({
        path: "intervention",
        populate: [
          { path: "ligne", select: "nom" },
          { path: "equipement", select: "code" }
        ],
      })
    if (!rapport)
      return res.status(404).json({ message: "Rapport introuvable" });

    res.json(rapport);
  } catch (err) {
    res.status(500).json({ message: "Erreur de récupération du rapport" });
  }
};

// 🟠 Mettre à jour un rapport
export const updateRapport = async (req, res) => {
  try {
    const updated = await RapportIntervention.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("intervention", "numero")
      .populate("techniciens.technicien", "nom prenom");

    if (!updated)
      return res.status(404).json({ message: "Rapport introuvable" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Erreur mise à jour rapport" });
  }
};

// 🔴 Supprimer un rapport
export const deleteRapport = async (req, res) => {
  try {
    const deleted = await RapportIntervention.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Rapport introuvable" });

    res.json({ message: "Rapport supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression rapport" });
  }
};

// 🧮 (Optionnel) Obtenir la durée totale des techniciens pour un rapport
export const getTotalDuree = async (req, res) => {
  try {
    const rapport = await RapportIntervention.findById(req.params.id);
    if (!rapport)
      return res.status(404).json({ message: "Rapport introuvable" });

    const total = rapport.techniciens.reduce(
      (sum, t) => sum + (t.dureeMinutes || 0),
      0
    );

    res.json({ totalDureeMinutes: total });
  } catch (err) {
    res.status(500).json({ message: "Erreur de calcul de la durée" });
  }
};
