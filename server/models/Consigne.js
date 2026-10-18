import mongoose from "mongoose";

const consigneSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, "Le titre est obligatoire"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La description/consigne est obligatoire"],
    },
    // Quart de travail / Shift
    quart: {
      type: String,
      enum: ["A", "B", "C", "Surface"],
      default: "A",
    },
    dateConsigne: {
      type: Date,
      default: Date.now,
    },
    priorite: {
      type: String,
      enum: ["Basse", "Moyenne", "Haute", "Urgente"],
      default: "Moyenne",
    },
    statut: {
      type: String,
      enum: ["En cours", "Traitee", "A surveiller"],
      default: "En cours",
    },
    // Auteur de la consigne (utilisateur / chef d'équipe)
    emetteur: {
      type: String, // Ou ObjectId si vous utilisez une collection User (ex: mongoose.Schema.Types.ObjectId, ref: 'User')
      required: true,
    },
    // Relations optionnelles avec la Ligne et l'Équipement
    ligne: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ligne",
      default: null,
    },
    equipement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipement",
      default: null,
    },
    // Eventuel fichier joint (photo, schéma, document PDF)
    pieceJointe: {
      nom: String,
      chemin: String,
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt
  }
);



export default mongoose.models.Consigne ||
  mongoose.model("Consigne", consigneSchema);