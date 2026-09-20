import TypeArret from "../models/TypeArret.js";

// Ajouter un type
export const createTypeArret = async (req, res) => {
  try {
    const { nom, description } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({
        message: "Le nom du type d'arrêt est obligatoire."
      });
    }

    const existe = await TypeArret.findOne({
      nom: nom.trim()
    });

    if (existe) {
      return res.status(400).json({
        message: "Ce type d'arrêt existe déjà."
      });
    }

    const typeArret = await TypeArret.create({
      nom: nom.trim(),
      description
    });

    res.status(201).json(typeArret);

  } catch (error) {
    console.error("ERREUR CREATE TYPE ARRET :", error);

    res.status(500).json({
      message: error.message
    });
  }
};


// Récupérer tous les types actifs
export const getTypesArret = async (req, res) => {
  try {
    const types = await TypeArret.find({
      actif: true
    }).sort({ nom: 1 });

    res.json(types);

  } catch (error) {
    console.error("ERREUR GET TYPES ARRET :", error);

    res.status(500).json({
      message: error.message
    });
  }
};