import Ligne from "../models/Ligne.js";

// 🔹 Lire toutes les lignes
export const getLignes = async (req, res) => {
  console.log("📡 Requête reçue sur /api/lignes");
  try {
    const lignes = await Ligne.find().sort({ nom: 1 });
    res.status(200).json(lignes);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 🔹 Ajouter une nouvelle ligne
export const addLigne = async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom) return res.status(400).json({ message: "Le nom est requis" });

    const existing = await Ligne.findOne({ nom });
    if (existing)
      return res.status(400).json({ message: "Cette ligne existe déjà" });

    const newLigne = new Ligne({ nom });
    await newLigne.save();
    res.status(201).json(newLigne);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 🔹 Supprimer une ligne
export const deleteLigne = async (req, res) => {
  try {
    const { id } = req.params;
    const ligne = await Ligne.findByIdAndDelete(id);
    if (!ligne) return res.status(404).json({ message: "Ligne introuvable" });
    res.status(200).json({ message: "Ligne supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// mise a jour
export const updateLigne = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom } = req.body;
    console.log("🧩 PUT /api/lignes reçu - id:", id, "nom:", nom);

    if (!nom) return res.status(400).json({ message: "Le nom est requis" });

    const existing = await Ligne.findOne({ nom });
    if (existing && existing._id.toString() !== id)
      return res.status(400).json({ message: "Ce nom existe déjà" });

    const updatedLigne = await Ligne.findByIdAndUpdate(
      id,
      { nom },
      { new: true }
    );

    if (!updatedLigne) {
      console.log("❌ Ligne introuvable pour id:", id);
      return res.status(404).json({ message: "Ligne introuvable" });
    }

    console.log("✅ Ligne mise à jour:", updatedLigne);
    res.status(200).json(updatedLigne);
  } catch (error) {
    console.error("💥 Erreur updateLigne:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
