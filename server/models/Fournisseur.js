import mongoose from "mongoose";

const contratSchema = new mongoose.Schema(
  {
    nomFichier: String,
    chemin: String, // ex: /uploads/contrats/contrat-123.pdf
    dateDebut: Date,
    dateFin: Date,
    dateUpload: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const fournisseurSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },

    type: {
      type: String,
      enum: ["fournisseur", "sous-traitant"],
      required: true,
    },

    telephone: String,
    email: String,
    adresse: String,
    specialite: String,
    remarque: String,

    NIF: String,
    AI: String,
    RC: String,
    NIS: String,

    actif: { type: Boolean, default: true },

    // ✅ CONTRAT DE MAINTENANCE
    contratMaintenance: contratSchema,
  },
  { timestamps: true }
);

export default mongoose.model("Fournisseur", fournisseurSchema);
