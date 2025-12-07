import mongoose from "mongoose";

const equipementSchema = new mongoose.Schema(
  {
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    ligne: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ligne", // référence à la collection 'lignes'
      required: true,
    },
  },
  { timestamps: true }
);

const Equipement = mongoose.model("Equipement", equipementSchema);

export default Equipement;
