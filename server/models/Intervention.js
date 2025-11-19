// models/Intervention.js
import mongoose from "mongoose";
import Counter from "./Counter.js";

const interventionSchema = new mongoose.Schema({
  numero: { type: String, unique: true }, // ex: "INT-2025-0001"
  ligne: { type: mongoose.Schema.Types.ObjectId, ref: "Ligne" },
  equipement: { type: mongoose.Schema.Types.ObjectId, ref: "Equipement" },

  ligneAsubiArret: { type: Boolean, default: false },
  dateHeureArretLigne: { type: Date },

  equipementAsubiArret: { type: Boolean, default: false },
  dateHeureArretEquipement: { type: Date },

  descriptionAnomalie: { type: String, required: true },

  demandeurNom: { type: String, required: true },

  ligneAdemarre: { type: Boolean, default: false },
  dateHeureDemarrageLigne: { type: Date },

  equipementAdemarre: { type: Boolean, default: false },
  dateHeureDemarrageEquipement: { type: Date },

  receptionProduction: { type: Boolean, default: false },
  clotureMaintenance: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },

  // info admin / statut
  statut: { type: String, enum: ["ouvert","en_cours","termine","annule"], default: "ouvert" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

// pré-save: générer numero unique auto-incrémental s'il n'existe pas
interventionSchema.pre("save", async function(next){
  if (this.numero) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: "intervention" },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    // format: INT-YYYY-00001
    const year = new Date().getFullYear();
    const seqStr = String(counter.seq).padStart(5, "0");
    this.numero = `INT-${year}-${seqStr}`;
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.models.Intervention || mongoose.model("Intervention", interventionSchema);




