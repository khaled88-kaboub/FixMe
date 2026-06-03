import CompteurHoraire from "../models/CompteurHoraire.js";
import Equipement from "../models/Equipement.js";

/**
 * ➕ Ajouter un relevé compteur
 */
export const addReleveCompteur = async (req, res) => {
  try {
    const { equipement, valeurCompteur, remarque } = req.body;

    const eq = await Equipement.findById(equipement);
    if (!eq) {
      return res.status(404).json({ message: "Equipement introuvable" });
    }

    if (valeurCompteur < eq.dernierCompteur) {
      return res.status(400).json({
        message: "Le compteur ne peut pas diminuer"
      });
    }

    const releve = await CompteurHoraire.create({
      equipement,
      valeurCompteur,
      relevePar: req.user?._id,
      remarque
    });

    eq.dernierCompteur = valeurCompteur;
    await eq.save();

    res.status(201).json(releve);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📜 Historique des relevés par équipement
 */
export const getRelevesByEquipement = async (req, res) => {
  try {
    const { equipementId } = req.params;

    const releves = await CompteurHoraire.find({
      equipement: equipementId
    })
      .sort({ dateReleve: -1 })
      .populate("relevePar", "nom prenom");

    res.json(releves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📋 Liste globale des relevés (tableau UI)
 */
export const getAllReleves = async (req, res) => {
  try {
    const releves = await CompteurHoraire.find()
  .populate("equipement", "designation code")
  .populate({
    path: 'equipement',
    populate: { path: 'ligne' } // Peuple la ligne à l'intérieur de l'équipement
  })
  .sort({ dateReleve: -1 });

releves.sort((a, b) =>
  a.equipement?.designation?.localeCompare(
    b.equipement?.designation || ""
  )
);

    res.json(releves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ✏️ Mise à jour d’un relevé compteur
 */
export const updateReleveCompteur = async (req, res) => {
  try {
    const { id } = req.params;
    const { valeurCompteur, remarque } = req.body;

    const releve = await CompteurHoraire.findById(id);
    if (!releve) {
      return res.status(404).json({ message: "Relevé introuvable" });
    }

    const equipement = await Equipement.findById(releve.equipement);
    if (!equipement) {
      return res.status(404).json({ message: "Equipement introuvable" });
    }

    // Relevé précédent
    const precedent = await CompteurHoraire.findOne({
      equipement: releve.equipement,
      dateReleve: { $lt: releve.dateReleve }
    }).sort({ dateReleve: -1 });

    const minAutorise = precedent ? precedent.valeurCompteur : 0;

    if (valeurCompteur < minAutorise) {
      return res.status(400).json({
        message: `La valeur doit être ≥ ${minAutorise}`
      });
    }

    releve.valeurCompteur = valeurCompteur;
    releve.remarque = remarque;
    await releve.save();

    // Si dernier relevé → maj dernierCompteur
    const dernier = await CompteurHoraire.findOne({
      equipement: releve.equipement
    }).sort({ dateReleve: -1 });

    if (dernier && dernier._id.equals(releve._id)) {
      equipement.dernierCompteur = valeurCompteur;
      await equipement.save();
    }

    res.json(releve);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🗑️ Suppression d’un relevé compteur
 */
export const deleteReleveCompteur = async (req, res) => {
  try {
    const { id } = req.params;

    const releve = await CompteurHoraire.findById(id);
    if (!releve) {
      return res.status(404).json({ message: "Relevé introuvable" });
    }

    const equipement = await Equipement.findById(releve.equipement);
    if (!equipement) {
      return res.status(404).json({ message: "Equipement introuvable" });
    }

    // Supprimer le relevé
    await releve.deleteOne();

    // Recalculer le dernier compteur
    const dernier = await CompteurHoraire.findOne({
      equipement: equipement._id
    }).sort({ dateReleve: -1 });

    equipement.dernierCompteur = dernier
      ? dernier.valeurCompteur
      : 0;

    await equipement.save();

    res.json({ message: "Relevé supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// controllers/compteurController.js
export const getLastCompteurByEquipement = async (req, res) => {
    try {
      const { equipementId } = req.params;
  
      const last = await CompteurHoraire.findOne({ equipement: equipementId })
        .sort({ dateReleve: -1 })
        .select("valeurCompteur dateReleve");
  
      if (!last) {
        return res.json(null);
      }
  
      res.json(last);
    } catch (error) {
        console.error("ERREUR LAST COMPTEUR:", error);
      res.status(500).json({ message: "Erreur récupération compteur" });
    }
  };
  
