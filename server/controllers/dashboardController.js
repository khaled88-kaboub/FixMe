// controllers/dashboardController.js

import Intervention from "../models/Intervention.js";
import RapportIntervention from "../models/RapportIntervention.js";
import InterventionFournisseur from "../models/InterventionFournisseur.js";
import InterventionP from "../models/InterventionP.js";
import PlanificationProduction from "../models/PlanificationProduction.js";
import ArretPlanifie from "../models/ArretPlanifie.js";

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
// + TEMPS DE PRODUCTION PLANIFIÉ
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

  // ===============================
  // CALCUL TEMPS ARRÊT RÉEL
  // ===============================

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

  // ===============================
  // GROUPEMENT PAR LIGNE
  // ===============================

  {
    $group: {
      _id: "$ligne",

      nombreArrets: {
        $sum: 1
      },

      tempsTotalArret: {
        $sum: "$dureeArretMinutes"
      }
    }
  },

  // ===============================
  // NOM DE LA LIGNE
  // ===============================

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

  // ===============================
  // RÉCUPÉRER LES PLANIFICATIONS
  // ===============================

  {
    $lookup: {
      from: "planificationproductions",
      let: {
        ligneId: "$_id"
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: [
                    "$ligne",
                    "$$ligneId"
                  ]
                },
                {
                  $gte: [
                    "$dateHeureDemarrage",
                    startMonth
                  ]
                },
                {
                  $lte: [
                    "$dateHeureDemarrage",
                    endMonth
                  ]
                }
              ]
            }
          }
        }
      ],
      as: "planifications"
    }
  },

  // ===============================
  // TOTAL TEMPS PLANIFIÉ
  // ===============================

  {
    $addFields: {
      tempsPlanifieMinutes: {
        $sum: "$planifications.dureeMinutes"
      }
    }
  },

  // ===============================
  // PRÉSENTATION
  // ===============================

  {
    $project: {
      _id: 0,

      ligneId: "$ligne._id",

      ligne: "$ligne.nom",

      nombreArrets: 1,

      tempsTotalArret: {
        $round: [
          "$tempsTotalArret",
          0
        ]
      },

      tempsPlanifieMinutes: {
        $round: [
          "$tempsPlanifieMinutes",
          0
        ]
      }
    }
  },

  {
    $sort: {
      tempsTotalArret: -1
    }
  }

]);


const statsArretsPlanifies = await ArretPlanifie.aggregate([
  {
    $match: {
      dateHeureArret: {
        $gte: startMonth,
        $lte: endMonth
      }
    }
  },
  {
    $group: {
      _id: "$ligne",
      tempsArretPlanifieMinutes: {
        $sum: "$dureeMinutes"
      }
    }
  }
]);

statsLignes.forEach((ligne) => {
  const arretPlanifie = statsArretsPlanifies.find(
    (item) => item._id.toString() === ligne.ligneId.toString()
  );

  ligne.tempsArretPlanifieMinutes =
    arretPlanifie?.tempsArretPlanifieMinutes || 0;
});

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
  

  // ==================================
// 🏢 PRESTATIONS FOURNISSEURS
// ==================================

const statsPrestataires = await InterventionFournisseur.aggregate([

  {
    $match: {
      dateIntervention: {
        $gte: startMonth,
        $lte: endMonth
      }
    }
  },

  // Récupérer les informations du fournisseur
  {
    $lookup: {
      from: "fournisseurs",
      localField: "fournisseur",
      foreignField: "_id",
      as: "fournisseurData"
    }
  },

  {
    $unwind: {
      path: "$fournisseurData",
      preserveNullAndEmptyArrays: true
    }
  },

  // Regrouper par fournisseur
  {
    $group: {
      _id: "$fournisseur",

      nombrePrestations: {
        $sum: 1
      },

      montantTotal: {
        $sum: "$montant"
      },

      nomPrestataire: {
        $first: "$fournisseurData.nom"
      },
      specialitePrestataire: {
        $first: "$fournisseurData.specialite"
      }
    }
  },

  // Présentation finale
  {
    $project: {
      _id: 0,

      fournisseurId: "$_id",

      prestataire: {
        $ifNull: [
          "$nomPrestataire",
          "Prestataire inconnu"
        ]
      },


      specialite: {
        $ifNull: [
          "$specialitePrestataire",
          "Spcialté inconnue"
        ]
      },
      nombrePrestations: 1,

      montantTotal: {
        $round: [
          "$montantTotal",
          2
        ]
      }
    }
  },

  // Trier par montant décroissant
  {
    $sort: {
      montantTotal: -1
    }
  }

]);


// ==========================================
// KPI MAINTENANCE PRÉVENTIVE DU MOIS
// ==========================================

const actionsPreventivesPlanifiees = await InterventionP.countDocuments({
  datePlanifiee: {
    $gte: startMonth,
    $lte: endMonth
  },
  statut: {
    $ne: "annulee"
  }
});

const actionsPreventivesRealisees = await InterventionP.countDocuments({
  datePlanifiee: {
    $gte: startMonth,
    $lte: endMonth
  },
  statut: "terminee"
});

const tauxRealisationPreventive =
  actionsPreventivesPlanifiees > 0
    ? Math.round(
        (actionsPreventivesRealisees /
          actionsPreventivesPlanifiees) *
          100
      )
    : 0;


    const statsPreventifEquipements = await InterventionP.aggregate([
      {
        $match: {
          datePlanifiee: {
            $gte: startMonth,
            $lte: endMonth
          },
          statut: {
            $ne: "annulee"
          }
        }
      },
    
      // Récupération de l'équipement
      {
        $lookup: {
          from: "equipements",
          localField: "equipement",
          foreignField: "_id",
          as: "equipementData"
        }
      },
    
      {
        $unwind: {
          path: "$equipementData",
          preserveNullAndEmptyArrays: true
        }
      },
    
      // Récupération de la ligne
      {
        $lookup: {
          from: "lignes",
          localField: "ligne",
          foreignField: "_id",
          as: "ligneData"
        }
      },
    
      {
        $unwind: {
          path: "$ligneData",
          preserveNullAndEmptyArrays: true
        }
      },
    
      // Regroupement par équipement
      {
        $group: {
          _id: "$equipement",
    
          ligne: {
            $first: {
              $ifNull: ["$ligneData.nom", "Ligne inconnue"]
            }
          },
    
          equipement: {
            $first: {
              $ifNull: [
                "$equipementData.designation",
                "Équipement inconnu"
              ]
            }
          },
    
          codeEquipement: {
            $first: "$equipementData.code"
          },
    
          nombrePlanifie: {
            $sum: 1
          },
    
          nombreRealise: {
            $sum: {
              $cond: [
                { $eq: ["$statut", "terminee"] },
                1,
                0
              ]
            }
          }
        }
      },
    
      // Calcul du taux
      {
        $addFields: {
          tauxRealisation: {
            $cond: [
              { $gt: ["$nombrePlanifie", 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      "$nombreRealise",
                      "$nombrePlanifie"
                    ]
                  },
                  100
                ]
              },
              0
            ]
          }
        }
      },
    
      {
        $project: {
          _id: 0,
          equipementId: "$_id",
          ligne: 1,
          equipement: 1,
          codeEquipement: 1,
          nombrePlanifie: 1,
          nombreRealise: 1,
          tauxRealisation: {
            $round: ["$tauxRealisation", 1]
          }
        }
      },
    
      {
        $sort: {
          ligne: 1,
          tauxRealisation: 1
        }
      }
    ]);
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
      dureeTotaleInterventions,

  // 🏢 Prestataires
  statsPrestataires,

   // KPI préventif
   actionsPreventivesPlanifiees,
   actionsPreventivesRealisees,
   tauxRealisationPreventive,
   //tableau preventif
   statsPreventifEquipements
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