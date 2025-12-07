import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
      console.log("📩 Corps reçu :", req.body); // 👈 ajoute cette ligne
  
      const { name, email, password } = req.body;
  
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires." });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Cet utilisateur existe déjà." });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();
  
      res.status(201).json({ message: "Utilisateur enregistré avec succès !" });
    } catch (error) {
      console.error("Erreur dans registerUser:", error);
      res.status(500).json({ message: "Erreur serveur lors de l'inscription.", error });
    }
  };

// ➤ Connexion utilisateur
export const loginUser = async (req, res) => {
  try {
    const { name, role, email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};



