import mongoose from "mongoose";
import Counter from "./Counter2.js"; // Pour générer un numéro automatique

const interventionPSchema = new mongoose.Schema({
  numero: { type: String, unique: true, index: true },

  titre: { type: String, required: true, trim: true },

  type: {
    type: String,
    enum: ["préventive", "curative"],
    default: "préventive"
  },

  equipement: { type: mongoose.Schema.Types.ObjectId, ref: "Equipement", required: true },
  ligne: { type: mongoose.Schema.Types.ObjectId, ref: "Ligne" },

  maintenanceLiee: { type: mongoose.Schema.Types.ObjectId, ref: "MaintenancePreventive" },

  technicienAffecte: {
   type: [ {
    technicien: { type: mongoose.Schema.Types.ObjectId, ref: "Technicien", required: true },
    duree: { type: Number } // durée pour ce technicien
  }] ,
  default: []
},


  datePlanifiee: { type: Date, required: true },
  dateRealisation: { type: Date },

  statut: {
    type: String,
    enum: ["planifiee","en_cours","terminee","retard","annulee"],
    default: "planifiee"
  },

  commentaire: { type: String },
  dureeReelle: { type: Number },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// ----------------------------
// PRE-SAVE : génération du numéro automatique
// ----------------------------
interventionPSchema.pre("save", async function(next) {
  if (!this.numero) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "interventionP" },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );
      const year = new Date().getFullYear();
      this.numero = `IP-${year}-${String(counter.seq).padStart(5,"0")}`;
    } catch (err) {
      return next(err);
    }
  }

  this.updatedAt = new Date();
  next();
});

export default mongoose.models.InterventionP ||
  mongoose.model("InterventionP", interventionPSchema);
