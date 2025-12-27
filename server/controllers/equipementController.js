import Equipement from "../models/Equipement.js";
import Ligne from "../models/Ligne.js";
import CompteurHoraire from "../models/CompteurHoraire.js";

export const createEquipement = async (req, res) => {
  try {
    const { designation, code, ligne } = req.body;

    // lignes doit être un tableau
    if (!Array.isArray(ligne) || ligne.length === 0) {
      return res.status(400).json({ message: "Aucune ligne fournie." });
    }

    // Vérifier si toutes les lignes existent
    const lignesExistantes = await Ligne.find({ _id: { $in: ligne } });

    if (lignesExistantes.length !== ligne.length) {
      return res.status(404).json({ message: "Ligne non trouvée !" });
    }

    // créer avec le champ 'ligne' (ton modèle)
    const equipement = await Equipement.create({
      designation,
      code,
      ligne: ligne, // <-- IMPORTANT
    });

    res.status(201).json(equipement);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 📋 Liste de tous les équipements
export const getEquipements = async (req, res) => {
  try {
    const equipements = await Equipement.find().populate("ligne", "nom")
    .sort({ "equipement.designation": 1 });
    res.status(200).json(equipements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// controllers/equipementController.js


export const getEquipementsWithLastCompteur = async (req, res) => {
  try {
    const equipements = await Equipement.find().populate("ligne", "nom");

    const equipementsWithLast = await Promise.all(
      equipements.map(async (eq) => {
        const last = await CompteurHoraire.findOne({ equipement: eq._id })
          .sort({ dateReleve: -1 })
          .select("valeurCompteur");

        return {
          ...eq.toObject(),
          dernierCompteur: last?.valeurCompteur ?? "-"
        };
      })
    );

    res.json(equipementsWithLast);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

export const updateEquipement = async (req, res) => {
  try {
    const { designation, code, ligne } = req.body;

    if (!Array.isArray(ligne) || ligne.length === 0) {
      return res.status(400).json({ message: "Les lignes sont obligatoires." });
    }

    const lignesExistantes = await Ligne.find({ _id: { $in: ligne } });

    if (lignesExistantes.length !== ligne.length) {
      return res.status(404).json({ message: "Ligne non trouvée !" });
    }

    const equipement = await Equipement.findByIdAndUpdate(
      req.params.id,
      {
        designation,
        code,
        ligne: ligne, // <-- IMPORTANT
      },
      { new: true }
    );

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
