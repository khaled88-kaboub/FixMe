import multer from "multer";
import path from "path";
import fs from "fs";

// Storage Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/rapports-interventions";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Nom unique à chaque upload
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = "rapport-" + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  },
});

// Filtre pour n'accepter que les PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("PDF uniquement"), false);
  }
};

export default multer({ storage, fileFilter });
