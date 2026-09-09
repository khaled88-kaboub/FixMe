// controllers/dashboardController.js

import Intervention from "../models/Intervention.js";
import RapportIntervention from "../models/RapportIntervention.js";
import mongoose from "mongoose";

export const getDashboardStats = async (req, res) => {
  
    try {
  
      const mois =
        parseInt(req.query.mois) ||
        new Date().getMonth() + 1;
  
      const annee =
        parseInt(req.query.annee) ||
        new Date().getFullYear();
  
      const startMonth = new Date(
        annee,
        mois - 1,
        1
      );
  
      const endMonth = new Date(
        annee,
        mois,
        0,
        23,
        59,
        59
      );

    // ===============================
    // 📊 INTERVENTIONS PAR DEMANDEUR
    // ===============================

    const interventionsParDemandeur = await Intervention.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startMonth,
            $lte: endMonth
          }
        }
      },
      {
        $group: {
          _id: "$demandeurNom",
          total: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // ==================================
    // 📊 ARRÊTS + TEMPS PAR LIGNE
    // ==================================

    const statsLignes = await Intervention.aggregate([

      {
        $match: {
          createdAt: {
            $gte: startMonth,
            $lte: endMonth
          },
          ligneAsubiArret: true,
          dateHeureArretLigne: { $ne: null },
          dateHeureDemarrageLigne: { $ne: null }
        }
      },

      // Calcul durée arrêt
      {
        $addFields: {
          dureeArretMinutes: {
            $divide: [
              {
                $subtract: [
                  "$dateHeureDemarrageLigne",
                  "$dateHeureArretLigne"
                ]
              },
              1000 * 60
            ]
          }
        }
      },

      // Grouper par ligne
      {
        $group: {
          _id: "$ligne",

          nombreArrets: { $sum: 1 },

          tempsTotalArret: {
            $sum: "$dureeArretMinutes"
          }
        }
      },

      // récupérer nom ligne
      {
        $lookup: {
          from: "lignes",
          localField: "_id",
          foreignField: "_id",
          as: "ligne"
        }
      },

      {
        $unwind: "$ligne"
      },

      {
        $project: {
          _id: 0,
          ligneId: "$ligne._id",
          ligne: "$ligne.nom",
          nombreArrets: 1,

          tempsTotalArret: {
            $round: ["$tempsTotalArret", 0]
          }
        }
      },

      {
        $sort: {
          tempsTotalArret: -1
        }
      }

    ]);


    // ===============================
// 📊 INTERVENTIONS PAR STATUT
// ===============================

const interventionsParStatut = await Intervention.aggregate([

    {
      $match: {
        createdAt: {
          $gte: startMonth,
          $lte: endMonth
        }
      }
    },
  
    {
      $group: {
        _id: "$statut",
        total: { $sum: 1 }
      }
    },
  
    {
      $sort: {
        total: -1
      }
    }
  
  ]);



  // ==================================
// 👨‍🔧 STATISTIQUES DES TECHNICIENS
// ==================================

const statsTechniciens = await RapportIntervention.aggregate([

  // 1️⃣ Récupérer l'intervention liée
  {
    $lookup: {
      from: "interventions",
      localField: "intervention",
      foreignField: "_id",
      as: "interventionData"
    }
  },

  {
    $unwind: "$interventionData"
  },

  // 2️⃣ Filtrer selon le mois sélectionné
  {
    $match: {
      "interventionData.createdAt": {
        $gte: startMonth,
        $lte: endMonth
      }
    }
  },

  // 3️⃣ Un technicien = une ligne
  {
    $unwind: "$techniciens"
  },

  // 4️⃣ Récupérer les informations du technicien
  {
    $lookup: {
      from: "techniciens",
      localField: "techniciens.technicien",
      foreignField: "_id",
      as: "technicienData"
    }
  },

  {
    $unwind: {
      path: "$technicienData",
      preserveNullAndEmptyArrays: true
    }
  },

  // 5️⃣ Regrouper par technicien
  {
    $group: {
      _id: "$techniciens.technicien",

      nombreInterventions: {
        $sum: 1
      },

      dureeTotaleMinutes: {
        $sum: "$techniciens.dureeMinutes"
      },

      nom: {
        $first: "$technicienData.nom"
      },

      prenom: {
        $first: "$technicienData.prenom"
      },

      matricule: {
        $first: "$technicienData.matricule"
      },

      specialite: {
        $first: "$technicienData.specialite"
      }
    }
  },

  // 6️⃣ Présentation
  {
    $project: {
      _id: 0,

      technicienId: "$_id",

      technicien: {
        $concat: [
          { $ifNull: ["$nom", ""] },
          " ",
          { $ifNull: ["$prenom", ""] }
        ]
      },

      matricule: 1,
      specialite: 1,

      nombreInterventions: 1,

      dureeTotaleMinutes: {
        $round: [
          "$dureeTotaleMinutes",
          0
        ]
      }
    }
  },

  // 7️⃣ Trier par durée décroissante
  {
    $sort: {
      dureeTotaleMinutes: -1
    }
  }

]);


// ==================================
// 📊 KPI TECHNICIENS
// ==================================

const nombreIntervenants =
  statsTechniciens.length;

const nombreParticipations =
  statsTechniciens.reduce(
    (acc, item) =>
      acc + item.nombreInterventions,
    0
  );

const dureeTotaleInterventions =
  statsTechniciens.reduce(
    (acc, item) =>
      acc + (item.dureeTotaleMinutes || 0),
    0
  );
  
    // ==========================
    // 📦 RESPONSE
    // ==========================

    res.json({
      interventionsParDemandeur,
      statsLignes,
      interventionsParStatut,
    
      // 👨‍🔧 Techniciens
      statsTechniciens,
      nombreIntervenants,
      nombreParticipations,
      dureeTotaleInterventions
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur dashboard"
    });
  }
};

// ======================================
// 📋 DETAILS ARRETS PAR LIGNE
// ======================================

export const getDetailsLigne = async (req, res) => {

    try {
  
      const { ligneId } = req.params;
  
      const mois =
      parseInt(req.query.mois) ||
      new Date().getMonth() + 1;
    
    const annee =
      parseInt(req.query.annee) ||
      new Date().getFullYear();
    
    const startMonth = new Date(
      annee,
      mois - 1,
      1
    );
    
    const endMonth = new Date(
      annee,
      mois,
      0,
      23,
      59,
      59
    );
  
  const details = await Intervention.find({
  
    ligne: ligneId,
  
    createdAt: {
      $gte: startMonth,
      $lte: endMonth
    },
  
    ligneAsubiArret: true,
  
    dateHeureArretLigne: { $ne: null },
  
    dateHeureDemarrageLigne: { $ne: null }
  
  })
  
  .select(
    "descriptionAnomalie dateHeureArretLigne dateHeureDemarrageLigne demandeurNom numero equipement"
  )
  .populate("equipement", "code designation")
  
      .sort({ dateHeureArretLigne: -1 });
  
      const formatted = details.map((item) => {
  
        const dureeMinutes = Math.round(
  
          (new Date(item.dateHeureDemarrageLigne) -
            new Date(item.dateHeureArretLigne)) /
  
          (1000 * 60)
  
        );
  
        return {

            _id: item._id,
          
            numero: item.numero,
          
            equipement: item.equipement?.code || "—",
          
            description: item.descriptionAnomalie,
          
            demandeur: item.demandeurNom,
          
            dateArret: item.dateHeureArretLigne,
          
            dateDemarrage: item.dateHeureDemarrageLigne,
          
            dureeMinutes
          
          };      });
  
      res.json(formatted);
  
    } catch (error) {
  
      console.error(error);
  
      res.status(500).json({
        message: "Erreur détails ligne"
      });
  
    }
  
  };