
import mongoose from "mongoose";

// Sous-modèle : réponse à une consigne
const reponseConsigneSchema = new mongoose.Schema(
  {
    commentaire: {
      type: String,
      required: [true, "Le commentaire est obligatoire"],
      trim: true,
    },

    // Auteur de la réponse
    emetteur: {
      type: String,
      required: [true, "L'émetteur de la réponse est obligatoire"],
      trim: true,
    },

    // Date de la réponse
    dateReponse: {
      type: Date,
      default: Date.now,
    },

    // Statut proposé ou appliqué lors de la réponse
    statutVise: {
      type: String,
      enum: ["En cours", "Traitee", "A surveiller"],
      default: "En cours",
    },
  },
  { _id: true }
);

// Modèle principal : consigne
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

    // Quart de travail
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

    // Auteur de la consigne
    emetteur: {
      type: String,
      required: true,
      trim: true,
    },

    // Ligne concernée
    ligne: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ligne",
      default: null,
    },

    // Équipement concerné
    equipement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipement",
      default: null,
    },

    // Pièce jointe
    pieceJointe: {
      nom: String,
      chemin: String,
    },

    // Historique des réponses à la consigne
    reponses: {
      type: [reponseConsigneSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Consigne ||
  mongoose.model("Consigne", consigneSchema);
