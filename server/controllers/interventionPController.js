import InterventionP from "../models/InterventionP.js";
import PDFDocument from "pdfkit";

// ------------------------------------
// GET /api/interventionP
// ------------------------------------
export const getInterventionsP = async (req, res) => {
  try {
    const interventions = await InterventionP
      .find()
      .populate("equipement", "designation code")
      .populate("ligne", "nom")
      .populate("technicienAffecte.technicien", "nom prenom")
      
      .populate("maintenanceLiee", "titre frequence taches")
      .sort({ datePlanifiee: 1, createdAt: -1 });

    res.json(interventions);
  } catch (err) {
    console.error("Erreur getInterventionsP :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ------------------------------------
// GET /api/interventionP/:id
// ------------------------------------
export const getInterventionP = async (req, res) => {
  try {
    const intervention = await InterventionP
      .findById(req.params.id)
      .populate("equipement", "designation code")
      .populate("ligne", "nom")
      .populate("technicienAffecte.technicien", "nom prenom")
      
      .populate("maintenanceLiee", "titre frequence taches");

    if (!intervention) return res.status(404).json({ error: "Introuvable" });

    res.json(intervention);
  } catch (err) {
    console.error("Erreur getInterventionP :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ------------------------------------
// POST /api/interventionP
// ------------------------------------
export const createInterventionP = async (req, res) => {
  try {
    const newIntervention = new InterventionP({
      ...req.body,
      technicienAffecte: req.body.technicienAffecte || [] // toujours tableau
    });
    await newIntervention.save();
    res.status(201).json(newIntervention);
  } catch (err) {
    console.error("Erreur createInterventionP :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ------------------------------------
// PUT /api/interventionP/:id
// ------------------------------------
export const updateInterventionP = async (req, res) => {
  try {
    const updated = await InterventionP.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Introuvable" });

    res.json(updated);
  } catch (err) {
    console.error("Erreur updateInterventionP:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ------------------------------------
// DELETE /api/interventionP/:id
// ------------------------------------
export const deleteInterventionP = async (req, res) => {
  try {
    const intervention = await InterventionP.findByIdAndDelete(req.params.id);
    if (!intervention) return res.status(404).json({ error: "Introuvable" });

    res.json({ message: "Supprimée" });
  } catch (err) {
    console.error("Erreur deleteInterventionP :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// تحميل المكتبات باستخدام require لضمان الوصول للدوال
//const ArReshaper = require("arabic-persian-reshaper");
//const bidiFactory = require("bidi-js");

//const bidi = bidiFactory();


// Chemin vers votre logo (assurez-vous que le dossier 'assets' existe)
const logoPath = path.join(process.cwd(), "assets", "rmc.png");

export const generateOtpPdf = async (req, res) => {
  try {
    const interventionP = await InterventionP.findById(req.params.id)
    .populate("equipement", "designation code")
    .populate("ligne", "nom")
    .populate("technicienAffecte.technicien", "nom prenom")
    .populate("maintenanceLiee", "titre frequence taches");

    if (!interventionP) {
      return res.status(404).json({ message: " N existe pas " });
    }

    // 1. إنشاء الوثيقة أولاً
    const doc = new PDFDocument({ size: "A4", margin: 50 });

  

    // 3. إرسال الهيدرز قبل البدء بالـ pipe
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=OTP-${interventionP._id}.pdf`
    );

    // 4. الآن نربط الوثيقة بالاستجابة
    doc.pipe(res);
 //Ajouter header
 
 const startX = 50;
const startY = 50;
const tableWidth1 = 500;
const rowHeight1 = 30;

// Colonnes
const col1Width = 100; // logo
const col2Width = 250; // titre
const col3Width = 150; // infos

// 🔲 Bordure externe
doc.rect(startX, startY, tableWidth1, rowHeight1 * 2).stroke();

// 🔲 Séparations verticales
doc.moveTo(startX + col1Width, startY)
   .lineTo(startX + col1Width, startY + rowHeight1 * 2)
   .stroke();

doc.moveTo(startX + col1Width + col2Width, startY)
   .lineTo(startX + col1Width + col2Width, startY + rowHeight1 * 2)
   .stroke();

// 🔲 Ligne horizontale (milieu droite)
doc.moveTo(startX + col1Width + col2Width, startY + rowHeight1)
   .lineTo(startX + tableWidth1, startY + rowHeight1)
   .stroke();

   if (fs.existsSync(logoPath)) {
    doc.image(logoPath, startX + 10, startY + 5, {
      fit: [col1Width - 20, rowHeight1 * 2 - 10],
      align: "center",
      valign: "center"
    });
  } else {
    console.log("Logo introuvable :", logoPath);
  }
//**************Suite */   
doc.font("Helvetica-Bold").fontSize(12);

doc.text("MAINTENANCE", startX + col1Width, startY + 10, {
  width: col2Width,
  align: "center"
});

// ligne sous titre
doc.moveTo(startX + col1Width , startY + 30)
   .lineTo(startX + col1Width + col2Width , startY + 30)
   .stroke();

// titre principal
doc.fontSize(14);
doc.text("ORDRE DE TRAVAIL PREVENTIF", startX + col1Width, startY + 40, {
  width: col2Width,
  align: "center"
});

// Suite..............................................
doc.fontSize(10).font("Helvetica");

// Date
//const today = new Date().toLocaleDateString("fr-FR");
const today = "24/03/2026"
doc.text(`Date: ${today}`, startX + col1Width + col2Width , startY + 10, {
  width: col3Width,
  align: "center"
});

// Version
doc.text("Version: 02", startX + col1Width + col2Width + 10, startY + 40);

// Page
doc.text("Page: 1 sur 1", startX + col1Width + col2Width + 80, startY + 40);

//suite............................................
doc.x = 50;
doc.y = startY + rowHeight1 * 2 + 30;




 


   /* ================= المحتوى المصحح ================= */
// 1. العنوان (كلمتين)
doc.moveDown(2);
//doc.fontSize(20).text("Ordre de travail Préventif  ", { align: "center" });
//doc.moveDown(2);



const titre = interventionP.titre;
const numero = interventionP.numero;
const ligne = interventionP.ligne?.nom;
const equipement = interventionP.equipement?.designation;
const code = interventionP.equipement?.code;
const date_p = interventionP.datePlanifiee;





doc.fontSize(11);

// 
doc.text(`Numréro : ${numero}`);
doc.moveDown(0.5);
doc.text(`${titre} : ${(" ")}`);
doc.moveDown(0.5);
doc.text(`Ligne : ${ligne}`);
doc.moveDown(0.5);
doc.text(`Désignation Equipement : ${equipement}`);
doc.moveDown(0.5);
doc.text(`Code Equipement : ${code}`);
doc.moveDown(0.5);
doc.text(`Date planifiée : ${new Date(date_p).toLocaleDateString("fr-FR")}`);
doc.moveDown(0.5);


doc.text("Tâches :", { underline: false });

interventionP.maintenanceLiee?.taches?.forEach((t, index) => {
  doc.moveDown(0.3);
  doc.fontSize(12).text(
    `${index + 1}. ${t.description} - ${t.dureeEstimee} min`,
    { indent: 20 }
  );
});

// ligne elegante de separation

doc.moveDown(1);

doc
  .strokeColor("#aaaaaa")
  .lineWidth(1)
  .moveTo(50, doc.y)
  .lineTo(550, doc.y)
  .stroke();

doc.moveDown(2);

doc.text("Date de réalisation : ...../....../..........");
doc.moveDown(0.5);
// Tableau element / duree

const tableTop = doc.y;
const col1X = 50;
const col2X = 300;
const colWidths = [250, 250];
const rowHeight = 25;

// 🔹 HEADER (fond gris)
doc
  .rect(col1X, tableTop, colWidths[0] + colWidths[1], rowHeight)
  .fill("#eeeeee");

doc.fillColor("black").font("Helvetica-Bold");

// Header texte centré
doc.text("Intervenants", col1X, tableTop + 7, {
  width: colWidths[0],
  align: "center"
});
doc.text("Durée d'intervention", col2X, tableTop + 7, {
  width: colWidths[1],
  align: "center"
});

doc.font("Helvetica");

// 🔹 Lignes
const elements = [
  ["", ".......   min"],
  ["", "........  min"],
  ["", ".......   min"]
];

// 🔹 Dessin grille complète
const totalRows = elements.length + 1;
const tableWidth = colWidths[0] + colWidths[1];

// Bordure externe
doc.rect(col1X, tableTop, tableWidth, totalRows * rowHeight).stroke();

// Lignes horizontales
for (let i = 1; i < totalRows; i++) {
  const y = tableTop + i * rowHeight;
  doc.moveTo(col1X, y).lineTo(col1X + tableWidth, y).stroke();
}

// Ligne verticale centrale
doc.moveTo(col2X, tableTop)
   .lineTo(col2X, tableTop + totalRows * rowHeight)
   .stroke();

// 🔹 Remplissage texte
elements.forEach((row, i) => {
  const y = tableTop + (i + 1) * rowHeight + 7;

  doc.text(row[0], col1X, y, {
    width: colWidths[0],
    align: "center"
  });

  doc.text(row[1], col2X, y, {
    width: colWidths[1],
    align: "center"
  });
});

doc.moveDown(2);



// Tableau pieces

const tableTop2 = doc.y;

// HEADER gris
doc
  .rect(col1X, tableTop2, colWidths[0] + colWidths[1], rowHeight)
  .fill("#eeeeee");

doc.fillColor("black").font("Helvetica-Bold");

doc.text("Désignation/Code Pièce", col1X, tableTop2 + 7, {
  width: colWidths[0],
  align: "center"
});

doc.text("Quantité", col2X, tableTop2 + 7, {
  width: colWidths[1],
  align: "center"
});

doc.font("Helvetica");

// Lignes
const pieces = [
  ["", ""],
  ["", ""],
  ["", ""]
];

const totalRows2 = pieces.length + 1;

// Bordure externe
doc.rect(col1X, tableTop2, tableWidth, totalRows2 * rowHeight).stroke();

// Lignes horizontales
for (let i = 1; i < totalRows2; i++) {
  const y = tableTop2 + i * rowHeight;
  doc.moveTo(col1X, y).lineTo(col1X + tableWidth, y).stroke();
}

// Ligne verticale
doc.moveTo(col2X, tableTop2)
   .lineTo(col2X, tableTop2 + totalRows2 * rowHeight)
   .stroke();

// Texte
pieces.forEach((row, i) => {
  const y = tableTop2 + (i + 1) * rowHeight + 7;

  doc.text(row[0], col1X, y, {
    width: colWidths[0],
    align: "center"
  });

  doc.text(row[1], col2X, y, {
    width: colWidths[1],
    align: "center"
  });
});


// Visa chefs service maintenance & methodes

doc.moveDown(4);

const pageWidth = doc.page.width;
const margin = 50;

// Positions
const leftX = margin;
const rightX = pageWidth / 2;

// Y actuel
const y = doc.y;

// 🔹 Texte titres
doc.font("Helvetica-Bold");

doc.text("Visa Chef Service Maintenance", leftX, y, {
  width: 200,
  align: "center"
});

doc.text("Visa Chef Service Méthode", rightX, y, {
  width: 200,
  align: "center"
});

doc.font("Helvetica");

// 🔹 Lignes de signature
const lineY = y + 40;

doc
  .moveTo(leftX, lineY)
  .lineTo(leftX + 200, lineY)
  .stroke();

doc
  .moveTo(rightX, lineY)
  .lineTo(rightX + 200, lineY)
  .stroke();


    doc.end();

  } catch (err) {
    console.error("PDF Final Error:", err);
    // إذا حدث خطأ ولم نرسل الهيدرز بعد، نرسل خطأ JSON
    //if (!res.headersSent) {
      //res.status(500).json({ message: "خطأ داخلي: " + err.message });
    //} else {
      // إذا بدأ الـ pipe بالفعل، ننهي الاستجابة فقط
      //res.end();
    //}
  }
};

