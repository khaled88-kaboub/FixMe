import Equipement from "../models/Equipement.js";
import Ligne from "../models/Ligne.js";

// ➕ Ajouter un équipement
export const createEquipement = async (req, res) => {
  try {
    const { designation, code, ligne } = req.body;

    const ligneExistante = await Ligne.findById(ligne);
    if (!ligneExistante) {
      return res.status(404).json({ message: "Ligne non trouvée" });
    }

    const equipement = await Equipement.create({ designation, code, ligne });
    res.status(201).json(equipement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📋 Liste de tous les équipements
export const getEquipements = async (req, res) => {
  try {
    const equipements = await Equipement.find().populate("ligne", "nom");
    res.status(200).json(equipements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Détails d’un équipement
export const getEquipementById = async (req, res) => {
  try {
    const equipement = await Equipement.findById(req.params.id).populate("ligne", "nom");
    if (!equipement) return res.status(404).json({ message: "Équipement non trouvé" });
    res.status(200).json(equipement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Modifier un équipement
export const updateEquipement = async (req, res) => {
  try {
    const { designation, code, ligne } = req.body;
    const equipement = await Equipement.findByIdAndUpdate(
      req.params.id,
      { designation, code, ligne },
      { new: true }
    );
    if (!equipement) return res.status(404).json({ message: "Équipement non trouvé" });
    res.status(200).json(equipement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🗑️ Supprimer un équipement
export const deleteEquipement = async (req, res) => {
  try {
    const equipement = await Equipement.findByIdAndDelete(req.params.id);
    if (!equipement) return res.status(404).json({ message: "Équipement non trouvé" });
    res.status(200).json({ message: "Équipement supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
