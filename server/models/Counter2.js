import mongoose from "mongoose";

const counter2Schema = new mongoose.Schema({
  _id: { type: String, required: true },   // <-- IMPORTANT
  seq: { type: Number, default: 0 }
});

export default mongoose.model("Counter2", counter2Schema);
