import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FicheEquipement.css";
import * as XLSX from 'xlsx';

const initialFormState = {
  ligne: "",
  equipement: "",
  serial: "",
  marque: "",
  modele: "",
  fournisseur: "",
  etat: "",
  dateFab: "",
  atelier: "",
  compteur: "",
  commentaire: ""
};

const FichesEquipementPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [fiches, setFiches] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [lignes, setLignes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(initialFormState);



  const fetchLignes = async () => {
    const res = await axios.get(`${API_URL}/api/lignes`);
    setLignes(res.data);
  };

  //Charger les equipements
  const fetchEquipements = async () => {
    // Si aucune ligne n'est sélectionnée, on vide la liste et on arrête
    if (!formData.ligne) {
      setEquipements([]);
      return;
    }
  
    try {
      const res = await axios.get(`${API_URL}/api/equipements`);
      
      const filtres = res.data.filter((eq) =>
        Array.isArray(eq.ligne) &&
        eq.ligne.some((l) => (l?._id || l) === formData.ligne)
      )
  // Ajout du tri ici :
  .sort((a, b) => a.designation.localeCompare(b.designation));
      setEquipements(filtres);
    } catch (error) {
      console.error("Erreur lors du chargement des équipements", error);
    }
  };

  // Charger les fiches
  const fetchFiches = async () => {
    const res = await axios.get(`${API_URL}/api/fiches-equipements`);
    setFiches(res.data);
  };

 // 1. Premier effet : Charger les données de base au chargement de la page
useEffect(() => {
    fetchFiches();
    fetchLignes();
  }, []);
  
  // 2. Deuxième effet : Recharger les équipements dès que la ligne change
  useEffect(() => {
    fetchEquipements();
  }, [formData.ligne]); // <--- Très important : on surveille formData.ligne

  
  
  
  // Ajouter / Modifier
  const handleSubmit = async (e) => {
    e.preventDefault();
  // LOG DE CONTROLE : Vérifie dans la console du navigateur (F12)
  console.log("Données envoyées au serveur :", formData);
    if (editingId) {
      await axios.put(`${API_URL}/api/fiches-equipements/${editingId}`, formData);
    } else {
      await axios.post(`${API_URL}/api/fiches-equipements`, formData);
    }

    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormState); // Utilisation de la constante ici aussi

    fetchFiches();
  };

  

  const handleAddNew = () => {
    setEditingId(null); // On s'assure qu'on n'est pas en mode édition
    setFormData(initialFormState); // On vide les champs
    setShowModal(true); // On ouvre la modal
  };
  
  // Dans votre JSX, remplacez le bouton par :
  <button className="btn-primary" onClick={handleAddNew}>
    ➕ Nouvelle Fiche
  </button>
  // Modifier
 const handleEdit = (fiche) => {
  setEditingId(fiche._id);
// On prépare la date pour l'input HTML
  // Si fiche.dateFab existe, on ne garde que "YYYY-MM-DD"
  const dateFormatee = fiche.dateFab ? fiche.dateFab.split('T')[0] : "";


  setFormData({
    ...fiche,
    equipement: fiche.equipement?._id || "",
    ligne: fiche.ligne?._id || "",
    dateFab: dateFormatee // On force le format correct ici
  });

  setShowModal(true);
};

  // Supprimer
  const handleDelete = async (id) => {
    if (window.confirm("Confirmer la suppression ?")) {
      await axios.delete(`${API_URL}/api/fiches-equipements/${id}`);
      fetchFiches();
    }
  };


  const exportToExcel = () => {
    // 1. Préparer les données (on aplatit les objets imbriqués pour Excel)
    const dataToExport = fiches.map((fiche) => ({
      Ligne: fiche.ligne?.nom || "-",
      Equipement: fiche.equipement?.designation || "-",
      Code: fiche.equipement?.code || "-",
      Serial: fiche.serial,
      Marque: fiche.marque,
      Modèle: fiche.modele,
      Fournisseur: fiche.fournisseur,
      État: fiche.etat,
      Atelier: fiche.atelier,
      "Date Fabrication": fiche.dateFab ? fiche.dateFab.split('T')[0] : "-",
      compteur: fiche.compteur,
    commentaire: fiche.commentaire,

    }));

// 2. Créer le classeur et la feuille
const worksheet = XLSX.utils.json_to_sheet(dataToExport);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Fiches Equipements");

// 3. Générer le fichier et déclencher le téléchargement
XLSX.writeFile(workbook, "Export_Fiches_Equipements.xlsx");
};

  return (
    <div className="fiche-container">
      <h1>Fiches Techniques Equipements ({fiches.length})</h1>

      <div className="action-bar" style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
    <button className="btn-primary" onClick={handleAddNew}>
      ➕ Nouvelle Fiche
    </button>
    
    <button 
      className="btn-primary" 
      onClick={exportToExcel}
      style={{ backgroundColor: "#27ae60", color: "white", padding: "10px 15px", border: "none", borderRadius: "5px", cursor: "pointer" }}
    >
      📥 Exporter Excel
    </button>
  </div>
  <div className="table-wrapper">
      <table>
        <thead>
          <tr>
          <th>Ligne</th>
          <th>Equipement</th>
            <th>Serial</th>
            <th>Marque</th>
            <th>Modèle</th>
            <th>Etat</th>
            <th>Atelier</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {fiches.map((fiche) => (
            <tr key={fiche._id}>
              <td data-label = "Ligne :">{fiche.ligne?.nom || "-"} </td>
              <td data-label = "Equipement :">{fiche.equipement?.designation || "-"} ({fiche.equipement?.code || "-"})</td>
              <td data-label = "Serial :">{fiche.serial}</td>
              <td data-label = "Marque :">{fiche.marque}</td>
              <td data-label = "Modele :">{fiche.modele}</td>
              <td data-label = "Etat :">{fiche.etat}</td>
              <td data-label = "Atelier">{fiche.atelier}</td>
              <td>
                <button onClick={() => handleEdit(fiche)}>Modifier</button>
                <button onClick={() => handleDelete(fiche._id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
</div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h1>{editingId ? "Modifier" : "Ajouter"} Fiche Equipement</h1>
            <form onSubmit={handleSubmit}>


            <select
            
            value={formData.ligne}
            onChange={(e) =>
              setFormData({ ...formData, ligne: e.target.value })
            }
            required
          >
            <option value="">Sélectionnez une ligne</option>
            {lignes.map((li) => (
              <option key={li._id} value={li._id}>
                {li.nom}
              </option>
            ))}
          </select>


            <select
            
  value={formData.equipement}
  onChange={(e) =>
    setFormData({ ...formData, equipement: e.target.value })
  }
  required
>
  <option value="">Sélectionner un équipement</option>
  {equipements.map((eq) => (
    <option key={eq._id} value={eq._id}>
     {eq.designation}----- ({eq.code})
    </option>
  ))}
</select>

              <input placeholder="Serial" value={formData.serial}
                onChange={(e) => setFormData({...formData, serial: e.target.value})} />

              <input placeholder="Marque" value={formData.marque}
                onChange={(e) => setFormData({...formData, marque: e.target.value})} />

              <input placeholder="Modele" value={formData.modele}
                onChange={(e) => setFormData({...formData, modele: e.target.value})} />

              <input placeholder="Fournisseur" value={formData.fournisseur}
                onChange={(e) => setFormData({...formData, fournisseur: e.target.value})} />

              <select value={formData.etat}
                onChange={(e) => setFormData({...formData, etat: e.target.value})}>
                <option value="">Etat</option>
                <option value="en marche">En marche</option>
                <option value="en arret">En arrêt</option>
                <option value="endommagé">Endommagé</option>
                <option value="neuf">Neuf</option>
              </select>

              <select value={formData.atelier}
                onChange={(e) => setFormData({...formData, atelier: e.target.value})}>
                <option value="">Atelier</option>
                <option value="Préparation">Préparation</option>
                <option value="Conditionnement">Conditionnement</option>
                <option value="Utilité">Utilité</option>
                <option value="Traitement des eaux">Traitement des eaux</option>
              </select>

              <input type="date" value={formData.dateFab}
                onChange={(e) => setFormData({...formData, dateFab: e.target.value})} />

              <input placeholder="Créé par" value={formData.compteur || ""}
                onChange={(e) => setFormData({...formData, compteur: e.target.value})} /> 

              <textarea placeholder="Commentaire" value={formData.commentaire || ""}
                onChange={(e) => setFormData({...formData, commentaire: e.target.value})} />

              <button  type="submit" className="btn-primary2">
                Enregistrer
              </button>
              <button  className="btn-primary2" type="button" onClick={() => setShowModal(false)}>
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FichesEquipementPage;