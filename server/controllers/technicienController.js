import Technicien from "../models/Technicien.js";

// 🔹 GET all
export const getTechniciens = async (req, res) => {
  try {
    const techniciens = await Technicien.find();
    res.json(techniciens);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 🔹 GET by ID
export const getTechnicienById = async (req, res) => {
  try {
    const technicien = await Technicien.findById(req.params.id);
    if (!technicien) return res.status(404).json({ message: "Technicien non trouvé" });
    res.json(technicien);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 🔹 POST create
export const createTechnicien = async (req, res) => {
  try {
    const technicien = new Technicien(req.body);
    const saved = await technicien.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Erreur de création", error });
  }
};

// 🔹 PUT update
export const updateTechnicien = async (req, res) => {
  try {
    const updated = await Technicien.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Technicien non trouvé" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Erreur de mise à jour", error });
  }
};

// 🔹 DELETE
export const deleteTechnicien = async (req, res) => {
  try {
    const deleted = await Technicien.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Technicien non trouvé" });
    res.json({ message: "Technicien supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
