import Fournisseur from "../models/Fournisseur.js";

export const createFournisseur = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.create(req.body);
    res.status(201).json(fournisseur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getFournisseurs = async (req, res) => {
  try {
    const fournisseurs = await Fournisseur.find().sort({ createdAt: -1 });
    res.json(fournisseurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




export const uploadContratMaintenance = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier envoyé" });
    }

    const fournisseur = await Fournisseur.findById(req.params.id);
    if (!fournisseur) {
      return res.status(404).json({ message: "Fournisseur introuvable" });
    }

    fournisseur.contratMaintenance = {
      nomFichier: req.file.originalname,
      chemin: `/uploads/contrats/${req.file.filename}`,
      dateDebut: req.body.dateDebut || null,
      dateFin: req.body.dateFin || null,
      dateUpload: new Date(),
    };

    await fournisseur.save();

    res.json({
      message: "Contrat uploadé avec succès",
      contrat: fournisseur.contratMaintenance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const getFournisseurById = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id);
    res.json(fournisseur);
  } catch (error) {
    res.status(404).json({ message: "Fournisseur non trouvé" });
  }
};

export const updateFournisseur = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(fournisseur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFournisseur = async (req, res) => {
  try {
    await Fournisseur.findByIdAndDelete(req.params.id);
    res.json({ message: "Fournisseur supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import fs from "fs";


export const supprimerContratMaintenance = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id);
    if (!fournisseur || !fournisseur.contratMaintenance)
      return res.status(404).json({ message: "Aucun contrat trouvé" });

    const cheminFichier = `.${fournisseur.contratMaintenance.chemin}`;

    // Supprimer le fichier physique
    if (fs.existsSync(cheminFichier)) {
      fs.unlinkSync(cheminFichier);
    }

    // Supprimer la référence Mongo
    fournisseur.contratMaintenance = null;
    await fournisseur.save();

    res.json({ message: "Contrat supprimé" });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression contrat" });
  }
};
