import mongoose from "mongoose";

const ficheEquipementSchema = new mongoose.Schema(
  {

    ligne: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ligne",
        
      }
    ,
    equipement: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Equipement",
        
      }

    ,
    serial: {
        type: String,
        
      },
      marque: {
        type: String,
        
        
      },
      modele: {
        type: String,
        
       
      },
      fournisseur: {
        type: String,
        
      },
      etat: {
        type: String,
        enum: ["endommagé", "en marche", "en arret",  "neuf"],
      
        
      },
      dateFab: {
        type: Date,
      
       
      },
      atelier: {
        type: String,
        enum: ["Préparation", "Conditionnement", "Utilité",  "Traitement des eaux"],
       
      },
      compteur: {
        type: String,
      },
      commentaire: {
        type: String,
      },
  },
  { timestamps: true }
);

const FicheEquipement = mongoose.model("FicheEquipement", ficheEquipementSchema);

export default FicheEquipement;

