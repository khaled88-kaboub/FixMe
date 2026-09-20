import mongoose from "mongoose";

const planificationProductionSchema = new mongoose.Schema(
  {
    ligne: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ligne",
      required: true,
    },

    dateHeureDemarrage: {
      type: Date,
      required: true,
    },

    dateHeureArret: {
      type: Date,
      required: true,
    },

    dureeMinutes: {
      type: Number,
      required: true,
      min: 0,
    },

    commentaire: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PlanificationProduction ||
  mongoose.model(
    "PlanificationProduction",
    planificationProductionSchema
  );