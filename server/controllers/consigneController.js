
import Consigne from "../models/Consigne.js";
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