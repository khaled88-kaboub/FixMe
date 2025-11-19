import Intervention from "../models/Intervention.js";

export const getInterventions = async (req, res) => {
  try {
    const interventions = await Intervention.find()
      .populate("ligne", "nom")
      .populate("equipement", "code designation");
    res.json(interventions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createIntervention = async (req, res) => {
  try {
    const newIntervention = new Intervention(req.body);
    await newIntervention.save();

    const io = req.app.get("io");
    const interventions = await Intervention.find();
    io.emit("interventionsUpdate", interventions); // ⚡ broadcast

    res.status(201).json(newIntervention);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateInterventionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const updated = await Intervention.findByIdAndUpdate(
      id,
      { statut },
      { new: true }
    );

    const io = req.app.get("io");
    const interventions = await Intervention.find();
    io.emit("interventionsUpdate", interventions);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteIntervention = async (req, res) => {
  try {
    const { id } = req.params;
    await Intervention.findByIdAndDelete(id);

    const io = req.app.get("io");
    const interventions = await Intervention.find();
    io.emit("interventionsUpdate", interventions);

    res.json({ message: "Intervention supprimée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
