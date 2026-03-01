import FicheEquipement from "../models/FicheEquipement.js";
import Equipement from "../models/Equipement.js";
import Ligne from "../models/Ligne.js";


// ✅ Créer une fiche équipement
export const createFicheEquipement = async (req, res) => {
  try {
    const {
        ligne,
      equipement,
      serial,
      marque,
      modele,
      fournisseur,
      etat,
      dateFab,
      atelier,
      compteur,
      commentaire
    } = req.body;


    // Vérifier si la ligne existe
    if (ligne) {
        const existingLigne = await Ligne.findById(ligne);
        if (!existingLigne) {
          return res.status(404).json({ message: "Ligne introuvable" });
        }
      }

    // Vérifier si l'équipement existe
    if (equipement) {
      const existingEquipement = await Equipement.findById(equipement);
      if (!existingEquipement) {
        return res.status(404).json({ message: "Equipement introuvable" });
      }
    }

    const fiche = new FicheEquipement({
        ligne,
      equipement,
      serial,
      marque,
      modele,
      fournisseur,
      etat,
      dateFab,
      atelier,
      compteur,
      commentaire
    });

    await fiche.save();

    res.status(201).json(fiche);

  } catch (error) {
    console.error("Erreur création fiche :", error);
    res.status(400).json({ message: error.message });
  }
};



// 📋 Obtenir toutes les fiches
export const getAllFichesEquipement = async (req, res) => {
  try {
    const fiches = await FicheEquipement.find()
      .populate("equipement", "designation code") // pour récupérer les infos liées
      .populate("ligne", "nom")
      .sort({ createdAt: -1 });

    res.status(200).json(fiches);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 🔍 Obtenir une fiche par ID
export const getFicheEquipementById = async (req, res) => {
  try {
    const fiche = await FicheEquipement.findById(req.params.id)
      .populate("equipement", "designation code ")
      .populate("ligne", "nom");
    if (!fiche) {
      return res.status(404).json({ message: "Fiche introuvable" });
    }

    res.status(200).json(fiche);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✏️ Mettre à jour une fiche
export const updateFicheEquipement = async (req, res) => {
  try {
    const updatedFiche = await FicheEquipement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("equipement");

    if (!updatedFiche) {
      return res.status(404).json({ message: "Fiche introuvable" });
    }

    res.status(200).json(updatedFiche);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// ❌ Supprimer une fiche
export const deleteFicheEquipement = async (req, res) => {
  try {
    const fiche = await FicheEquipement.findByIdAndDelete(req.params.id);

    if (!fiche) {
      return res.status(404).json({ message: "Fiche introuvable" });
    }

    res.status(200).json({ message: "Fiche supprimée avec succès" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};