// controllers/dashboardController.js

import Intervention from "../models/Intervention.js";
import mongoose from "mongoose";

export const getDashboardStats = async (req, res) => {
  try {

    // 📅 Début du mois actuel
    const startMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    // 📅 Fin du mois
    const endMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
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


  
    // ==========================
    // 📦 RESPONSE
    // ==========================

    res.json({
        interventionsParDemandeur,
        statsLignes,
        interventionsParStatut
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
  
     // 📅 Début mois actuel
const startMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );
  
  // 📅 Fin mois actuel
  const endMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
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