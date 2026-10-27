
import Consigne from "../models/Consigne.js";
import mongoose from "mongoose";
// @desc    Obtenir toutes les consignes (avec filtres optionnels)
// @route   GET /api/consignes
export const getConsignes = async (req, res) => {
  try {
    const { quart, priorite, statut, ligne, dateDebut, dateFin } = req.query;

    let filter = {};

    if (quart) filter.quart = quart;
    if (priorite) filter.priorite = priorite;
    if (statut) filter.statut = statut;
    if (ligne) filter.ligne = ligne;

    if (dateDebut || dateFin) {
      filter.dateConsigne = {};
      if (dateDebut) filter.dateConsigne.$gte = new Date(dateDebut);
      if (dateFin) filter.dateConsigne.$lte = new Date(dateFin + "T23:59:59");
    }

    const consignes = await Consigne.find(filter)
      .populate("ligne", "nom")
      .populate("equipement", "designation code")
      .sort({ dateConsigne: -1 });

    res.status(200).json(consignes);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des consignes",
      error: error.message,
    });
  }
};

// @desc    Créer une nouvelle consigne
// @route   POST /api/consignes
export const createConsigne = async (req, res) => {
  try {
    const {
      titre,
      description,
      quart,
      dateConsigne,
      priorite,
      statut,
      emetteur,
      ligne,
      equipement,
    } = req.body;

    const newConsigne = new Consigne({
      titre,
      description,
      quart,
      dateConsigne: dateConsigne || Date.now(),
      priorite,
      statut,
      emetteur,
      ligne: ligne || null,
      equipement: equipement || null,
    });

    // Prise en charge du fichier joint si transmis via multer
    if (req.file) {
      newConsigne.pieceJointe = {
        nom: req.file.originalname,
        chemin: `/uploads/${req.file.filename}`,
      };
    }

    const savedConsigne = await newConsigne.save();
    
    // Populer avant le renvoi pour l'affichage React
    await savedConsigne.populate([
      { path: "ligne", select: "nom" },
      { path: "equipement", select: "designation code" },
    ]);

    res.status(201).json(savedConsigne);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la création de la consigne",
      error: error.message,
    });
  }
};

// @desc    Mettre à jour une consigne
// @route   PUT /api/consignes/:id
export const updateConsigne = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.pieceJointe = {
        nom: req.file.originalname,
        chemin: `/uploads/${req.file.filename}`,
      };
    }

    const updatedConsigne = await Consigne.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("ligne", "nom")
      .populate("equipement", "designation code");

    if (!updatedConsigne) {
      return res.status(404).json({ message: "Consigne non trouvée" });
    }

    res.status(200).json(updatedConsigne);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la mise à jour de la consigne",
      error: error.message,
    });
  }
};

// @desc    Supprimer une consigne
// @route   DELETE /api/consignes/:id
export const deleteConsigne = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedConsigne = await Consigne.findByIdAndDelete(id);

    if (!deletedConsigne) {
      return res.status(404).json({ message: "Consigne non trouvée" });
    }

    res.status(200).json({ message: "Consigne supprimée avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de la consigne",
      error: error.message,
    });
  }
};

// =========================================================================
// NOUVEAU CONTRÔLEUR : Ajouter une réponse / commentaire à une consigne
// @route   POST /api/consignes/:id/reponses
// =========================================================================

export const ajouterReponseConsigne = async (req, res) => {
    try {
      const { id } = req.params;
      const { commentaire, emetteur, statutVise } = req.body;
  
      // Vérifier les champs obligatoires
      if (
        typeof commentaire !== "string" ||
        !commentaire.trim() ||
        typeof emetteur !== "string" ||
        !emetteur.trim()
      ) {
        return res.status(400).json({
          message: "Le commentaire et l'émetteur sont obligatoires.",
        });
      }
  
      // Vérifier le statut transmis, s'il existe
      const statutsAutorises = ["En cours", "Traitee", "A surveiller"];
  
      if (
        statutVise !== undefined &&
        !statutsAutorises.includes(statutVise)
      ) {
        return res.status(400).json({
          message: "Le statut fourni est invalide.",
        });
      }
  
      // Construire la réponse
      const nouvelleReponse = {
        commentaire: commentaire.trim(),
        emetteur: emetteur.trim(),
        dateReponse: new Date(),
        statutVise: statutVise || "En cours",
      };
  
      // Ajouter la réponse et actualiser le statut global
      const updateQuery = {
        $push: { reponses: nouvelleReponse },
      };
  
      // Ne modifier le statut global que si le frontend en transmet un
      if (statutVise !== undefined) {
        updateQuery.$set = { statut: statutVise };
      }
  
      const consigneMaj = await Consigne.findByIdAndUpdate(
        id,
        updateQuery,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("ligne", "nom")
        .populate("equipement", "designation code");
  
      if (!consigneMaj) {
        return res.status(404).json({
          message: "Consigne non trouvée.",
        });
      }
  
      return res.status(200).json(consigneMaj);
    } catch (error) {
      console.error("Erreur ajout réponse :", error);
  
      return res.status(400).json({
        message: "Erreur lors de l'ajout de la réponse.",
        error: error.message,
      });
    }
  };
 
  //Modifier reponse controller
export const modifierReponseConsigne = async (req, res) => {
    try {
      const { id, reponseId } = req.params;
      const { commentaire, emetteur, statutVise } = req.body;
  
      if (
        typeof commentaire !== "string" ||
        !commentaire.trim() ||
        typeof emetteur !== "string" ||
        !emetteur.trim()
      ) {
        return res.status(400).json({
          message: "Le commentaire et l'émetteur sont obligatoires.",
        });
      }
  
      const statutsAutorises = ["En cours", "Traitee", "A surveiller"];
  
      if (
        statutVise !== undefined &&
        !statutsAutorises.includes(statutVise)
      ) {
        return res.status(400).json({
          message: "Le statut fourni est invalide.",
        });
      }
  
      const consigne = await Consigne.findById(id);
  
      if (!consigne) {
        return res.status(404).json({
          message: "Consigne non trouvée.",
        });
      }
  
      const reponse = consigne.reponses.id(reponseId);
  
      if (!reponse) {
        return res.status(404).json({
          message: "Réponse non trouvée.",
        });
      }
  
      // Modifier la réponse existante
      reponse.commentaire = commentaire.trim();
      reponse.emetteur = emetteur.trim();
  
      if (statutVise !== undefined) {
        reponse.statutVise = statutVise;
  
        // Maintenir le statut global cohérent avec la réponse modifiée
        consigne.statut = statutVise;
      }
  
      await consigne.save();
  
      await consigne.populate([
        { path: "ligne", select: "nom" },
        { path: "equipement", select: "designation code" },
      ]);
  
      return res.status(200).json(consigne);
    } catch (error) {
      console.error("Erreur modification réponse :", error);
  
      return res.status(400).json({
        message: "Erreur lors de la modification de la réponse.",
        error: error.message,
      });
    }
  };
  

  // supprimer reponse
  export const supprimerReponseConsigne = async (req, res) => {
    try {
      const { id, reponseId } = req.params;
  
      // Vérifier la validité des identifiants
      if (
        !mongoose.isValidObjectId(id) ||
        !mongoose.isValidObjectId(reponseId)
      ) {
        return res.status(400).json({
          message: "Identifiant de consigne ou de réponse invalide.",
        });
      }
  
      const consigne = await Consigne.findById(id);
  
      if (!consigne) {
        return res.status(404).json({
          message: "Consigne non trouvée.",
        });
      }
  
      const reponse = consigne.reponses.id(reponseId);
  
      if (!reponse) {
        return res.status(404).json({
          message: "Réponse non trouvée.",
        });
      }
  
      // Supprimer uniquement la réponse ciblée
      reponse.deleteOne();
  
      await consigne.save();
  
      await consigne.populate([
        { path: "ligne", select: "nom" },
        { path: "equipement", select: "designation code" },
      ]);
  
      return res.status(200).json({
        message: "Réponse supprimée avec succès.",
        consigne,
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de la réponse :", error);
  
      return res.status(500).json({
        message: "Erreur lors de la suppression de la réponse.",
        error: error.message,
      });
    }
  };