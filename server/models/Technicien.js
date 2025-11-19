import mongoose from "mongoose";

const technicienSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  matricule: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  specialite: {
    type: String,
    enum: [
      "mécanique",
      "électrique",
      "automatisme",
      "hydraulique",
      "autre"
    ],
    default: "autre"
  },
  telephone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  actif: {
    type: Boolean,
    default: true
  },
  dateEmbauche: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Technicien || mongoose.model("Technicien", technicienSchema);
