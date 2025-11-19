import mongoose from "mongoose";

const ligneSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, { timestamps: true });

export default mongoose.models.Ligne || mongoose.model("Ligne", ligneSchema);
