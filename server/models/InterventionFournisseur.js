import mongoose from "mongoose";

const interventionFournisseurSchema = new mongoose.Schema(
  {
    fournisseur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fournisseur",
      required: true,
    },

    ligne: { 
      type: mongoose.Schema.Types.ObjectId, ref: "Ligne"
     },

    equipement: { 
      type: mongoose.Schema.Types.ObjectId, ref: "Equipement" 
    },
    
    dateIntervention: {
      type: Date,
      required: true,
    },

    detail: {
      type: String,
      required: true,
    },

    duree: {
      type: Number, // en heures
      required: true,
    },

    montant: {
      type: Number,
      required: true,
    },

    rapport: {
      nomFichier: String,
      chemin: String,
      dateUpload: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "InterventionFournisseur",
  interventionFournisseurSchema
);
