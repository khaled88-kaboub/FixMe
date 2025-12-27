import mongoose from "mongoose";

const compteurHoraireSchema = new mongoose.Schema({
  equipement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipement",
    required: true
  },

  valeurCompteur: {
    type: Number,
    required: true,
    min: 0
  },

  dateReleve: {
    type: Date,
    default: Date.now
  },

  relevePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // technicien ou utilisateur
  },

  remarque: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model("CompteurHoraire", compteurHoraireSchema);
