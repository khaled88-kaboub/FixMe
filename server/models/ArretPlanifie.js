import mongoose from "mongoose";

const arretPlanifieSchema = new mongoose.Schema(
  {
    ligne: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ligne",
      required: true
    },

    typeArret: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TypeArret",
      required: true
    },

    dateHeureArret: {
      type: Date,
      required: true
    },

    dateHeureDemarrage: {
      type: Date,
      required: true
    },

    dureeMinutes: {
      type: Number,
      required: true,
      min: 0
    },

    commentaire: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.ArretPlanifie ||
  mongoose.model("ArretPlanifie", arretPlanifieSchema);