import InterventionP from "../models/InterventionP.js";

// ------------------------------------
// GET /api/interventionP
// ------------------------------------
export const getInterventionsP = async (req, res) => {
  try {
    const interventions = await InterventionP
      .find()
      .populate("equipement", "nom code")
      .populate("ligne", "nom")
      .populate("technicienAffecte.technicien", "nom prenom")
      
      .populate("maintenanceLiee", "titre frequence")
      .sort({ datePlanifiee: 1, createdAt: -1 });

    res.json(interventions);
  } catch (err) {
    console.error("Erreur getInterventionsP :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ------------------------------------
// GET /api/interventionP/:id
// ------------------------------------
export const getInterventionP = async (req, res) => {
  try {
    const intervention = await InterventionP
      .findById(req.params.id)
      .populate("equipement", "nom code")
      .populate("ligne", "nom")
      .populate("technicienAffecte.technicien", "nom prenom")
      
      .populate("maintenanceLiee", "titre frequence");

    if (!intervention) return res.status(404).json({ error: "Introuvable" });

    res.json(intervention);
  } catch (err) {
    console.error("Erreur getInterventionP :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ------------------------------------
// POST /api/interventionP
// ------------------------------------
export const createInterventionP = async (req, res) => {
  try {
    const newIntervention = new InterventionP({
      ...req.body,
      technicienAffecte: req.body.technicienAffecte || [] // toujours tableau
    });
    await newIntervention.save();
    res.status(201).json(newIntervention);
  } catch (err) {
    console.error("Erreur createInterventionP :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ------------------------------------
// PUT /api/interventionP/:id
// ------------------------------------
export const updateInterventionP = async (req, res) => {
  try {
    const updated = await InterventionP.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Introuvable" });

    res.json(updated);
  } catch (err) {
    console.error("Erreur updateInterventionP:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ------------------------------------
// DELETE /api/interventionP/:id
// ------------------------------------
export const deleteInterventionP = async (req, res) => {
  try {
    const intervention = await InterventionP.findByIdAndDelete(req.params.id);
    if (!intervention) return res.status(404).json({ error: "Introuvable" });

    res.json({ message: "Supprimée" });
  } catch (err) {
    console.error("Erreur deleteInterventionP :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
