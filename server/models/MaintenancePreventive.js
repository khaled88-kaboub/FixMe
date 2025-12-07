// models/MaintenancePreventive.js
import mongoose from "mongoose";
import Counter from "./Counter2.js";

const tacheSchema = new mongoose.Schema({
  description: { type: String, required: true },
  dureeEstimee: { type: Number },
  obligatoire: { type: Boolean, default: true }
}, { _id: false });

const historiqueSchema = new mongoose.Schema({
  dateRealisation: { type: Date, default: Date.now },
  technicien: { type: mongoose.Schema.Types.ObjectId, ref: "Technicien" },
  commentaire: { type: String },
  dureeReelle: { type: Number },
  interventionLiee: { type: mongoose.Schema.Types.ObjectId, ref: "InterventionP" }
}, { _id: true });

const maintenancePreventiveSchema = new mongoose.Schema({
  numero: { type: String, unique: true, index: true },

  titre: { type: String, required: true, trim: true },


  type: {
    type: String,
    enum: ["systematique", "conditionnelle", "reglementaire"],
    default: "systematique"
  },

  equipement: { type: mongoose.Schema.Types.ObjectId, ref: "Equipement", required: true },
  ligne: { type: mongoose.Schema.Types.ObjectId, ref: "Ligne" },

  frequence: { type: String, enum: ["jour","semaine","mois","annee","fixe"], required: true },
  intervalle: { type: Number, default: 1 },

  // ⭐ NOUVEAU : Date de démarrage voulue par l’utilisateur
  dateDebut: { type: Date, required: true },

  // ⭐ Corrigé : devient la prochaine exécution basée sur dateDebut
  dateProchaine: { type: Date },

  dateDerniere: { type: Date },

  taches: [tacheSchema],

  technicienAffecte: { type: mongoose.Schema.Types.ObjectId, ref: "Technicien" },
  
  statut: {
    type: String,
    enum: ["planifiee","en_cours","terminee","retard","annulee"],
    default: "planifiee"
  },

  historique: [historiqueSchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// ----------------------------
// PRE-SAVE : génération du numéro + dateProchaine = dateDebut
// ----------------------------
maintenancePreventiveSchema.pre("save", async function(next){
  // Génération du numéro automatique
  if (!this.numero) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "maintenancePreventive" },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );
      const year = new Date().getFullYear();
      this.numero = `PMS-${year}-${String(counter.seq).padStart(5,"0")}`;
    } catch (err) {
      return next(err);
    }
  }

  // ⭐ Si la dateProchaine n’est pas définie → elle prend dateDebut
  if (!this.dateProchaine) {
    this.dateProchaine = this.dateDebut;
  }

  this.updatedAt = new Date();
  next();
});

export default mongoose.models.MaintenancePreventive ||
  mongoose.model("MaintenancePreventive", maintenancePreventiveSchema);
