import InterventionFournisseur from "../models/InterventionFournisseur.js";

export const createInterventionFournisseur = async (req, res) => {
  try {
    const intervention = new InterventionFournisseur({
      fournisseur: req.body.fournisseur,
      ligne: req.body.ligne || null,
      equipement: req.body.equipement || null,
      dateIntervention: req.body.dateIntervention,
      detail: req.body.detail,
      duree: Number(req.body.duree),
      montant: Number(req.body.montant),
    });
    if (req.file) {
      intervention.rapport = {
        nomFichier: req.file.originalname,
        chemin: "/" + req.file.path.replace(/\\/g, "/"),
        dateUpload: new Date(),
      };
    }
    await intervention.save();
    res.status(201).json(intervention);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};


export const uploadRapport = async (req, res) => {
  try {
    const interventionFournisseur = await InterventionFournisseur.findById(req.params.id);
    if (!interventionFournisseur) {
      return res.status(404).json({ message: "Intervention introuvable" });
    }

    interventionFournisseur.rapport = {
      nomFichier: req.file.originalname,
      chemin: "/" + req.file.path.replace(/\\/g, "/"),
      dateUpload: new Date(),
    };

    await interventionFournisseur.save();
    res.json(interventionFournisseur);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getInterventionsFournisseur = async (req, res) => {
  try {

    const data = await InterventionFournisseur.find()
  
  .populate("fournisseur", "nom type")
  .populate("ligne", "nom")
  .populate("equipement", "designation code")
  .sort({ dateIntervention: -1 });

  data.forEach(i => {
    console.log("PDF chemin :", i.rapport?.chemin);
  });
  res.json(data);
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */
export const updateInterventionFournisseur = async (req, res) => {
  try {
    const intervention = await InterventionFournisseur.findById(req.params.id);
    if (!intervention) return res.status(404).json({ message: "Intervention introuvable" });

    // Mise à jour des champs
    Object.keys(req.body).forEach(key => {
      intervention[key] = req.body[key];
    });

    // Nouveau PDF → supprimer l’ancien si existant
    if (req.file) {
      if (intervention.rapport?.chemin) {
        const ancienPdf = path.join(process.cwd(), intervention.rapport.chemin);
        if (fs.existsSync(ancienPdf)) {
          fs.unlinkSync(ancienPdf);
          console.log("Ancien PDF supprimé :", ancienPdf);
        }
      }

      // Ajouter le nouveau PDF
      intervention.rapport = {
        nomFichier: req.file.originalname,
        chemin: "/" + req.file.path.replace(/\\/g, "/"),
        dateUpload: new Date(),
      };
    }

    await intervention.save();
    res.json(intervention);

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

/* ================= DELETE ================= */
import fs from "fs";
import path from "path";


export const deleteInterventionFournisseur = async (req, res) => {
  try {
    const intervention = await InterventionFournisseur.findById(req.params.id);

    if (!intervention) {
      return res.status(404).json({ message: "Intervention introuvable" });
    }

    // 🧹 SUPPRESSION DU PDF S'IL EXISTE
    if (intervention.rapport?.chemin) {
      // Construire le chemin absolu correct
      const filePath = path.join(process.cwd(), intervention.rapport.chemin);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Erreur suppression fichier :", err.message);
          // ⚠️ On continue quand même la suppression de la DB
        }
      });
    }

    // Suppression de la base de données
    await intervention.deleteOne();

    res.json({ message: "Intervention supprimée avec succès" });

  } catch (err) {
    console.error("DELETE ERROR :", err);
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
};
