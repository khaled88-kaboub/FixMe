import multer from "multer";
import path from "path";

// 📂 Où stocker les contrats
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/contrats");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      "contrat-" +
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// 🛑 Filtrer uniquement les PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers PDF sont autorisés"), false);
  }
};

const uploadContrat = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

export default uploadContrat;
