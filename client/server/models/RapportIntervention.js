import mongoose from "mongoose";

// Sous-schéma pour les pièces remplacées
const pieceSchema = new mongoose.Schema({
  nom: { type: String, required: true },         // ex: "Courroie", "Pompe hydraulique"
  quantite: { type: Number, required: true, min: 1 }
});

// Sous-schéma pour les techniciens
const technicienSchema = new mongoose.Schema({
  technicien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Technicien",
    required: true
  },
  dureeMinutes: {
    type: Number,  // durée d’intervention individuelle en minutes
    required: true
  }
});

// Schéma principal du rapport
const rapportInterventionSchema = new mongoose.Schema({
  intervention: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Intervention",
    required: true
  },

  dateIntervention: {
    type: Date,
    required: true
  },

  descriptionTravaux: {
    type: String,
    required: true,
    trim: true
  },

  piecesRemplacees: {
    type: [pieceSchema],
    default: []
  },

  commentaires: {
    type: String,
    trim: true
  },

  techniciens: {
    type: [technicienSchema],
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.RapportIntervention ||
  mongoose.model("RapportIntervention", rapportInterventionSchema);
