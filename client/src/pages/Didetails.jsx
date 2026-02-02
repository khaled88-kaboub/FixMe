     import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaTools, FaFilter, FaUndo } from "react-icons/fa";
import "./Didetails.css";

export default function Didetails() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [interventions, setInterventions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedStatut, setSelectedStatut] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [lignes, setLignes] = useState([]);
  const [equipements, setEquipements] = useState([]);

  const [filters, setFilters] = useState({
    statut: "",
    ligne: "",
    equipement: "",
    demandeur: "",
    date: "",
    numero: "",
  });

  useEffect(() => {
    fetchInterventions();
    fetchLignes();
    fetchEquipements();
  }, []);

  const fetchInterventions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/interventions`);
      setInterventions(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des interventions :", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLignes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/lignes`);
      setLignes(res.data);
    } catch (err) {
      console.error("Erreur chargement lignes :", err);
    }
  };

  const fetchEquipements = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/equipements`);
      setEquipements(res.data);
    } catch (err) {
      console.error("Erreur chargement équipements :", err);
    }
  };

  // 🎯 Appliquer les filtres
  const applyFilters = () => {
    let result = interventions;

    if (filters.statut)
      result = result.filter((i) => i.statut === filters.statut);

    if (filters.ligne)
      result = result.filter((i) => i.ligne?._id === filters.ligne);

    if (filters.equipement)
      result = result.filter((i) => i.equipement?._id === filters.equipement);

    if (filters.demandeur)
      result = result.filter((i) =>
        i.demandeurNom
          ?.toLowerCase()
          .includes(filters.demandeur.toLowerCase())
      );

    if (filters.numero)
      result = result.filter((i) =>
        i.numero?.toString().includes(filters.numero)
      );

    if (filters.date)
      result = result.filter(
        (i) =>
          new Date(i.createdAt).toLocaleDateString("fr-FR") ===
          new Date(filters.date).toLocaleDateString("fr-FR")
      );

    setFiltered(result);
  };

  // 🔄 Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      statut: "",
      ligne: "",
      equipement: "",
      demandeur: "",
      date: "",
      numero: "",
    });
    setFiltered(interventions);
  };

  // ✏️ Modifier statut
  const handleEdit = (id, currentStatut) => {
    setEditingId(id);
    setSelectedStatut(currentStatut);
  };

  // 💾 Sauvegarder statut
  const handleSave = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/interventions/${id}`,
        { statut: selectedStatut },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInterventions((prev) =>
        prev.map((i) => (i._id === id ? { ...i, statut: selectedStatut } : i))
      );
      setFiltered((prev) =>
        prev.map((i) => (i._id === id ? { ...i, statut: selectedStatut } : i))
      );

      setEditingId(null);
      alert("✅ Statut mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur mise à jour statut :", error);
      alert("❌ Échec de la mise à jour !");
    }
  };

  const handleViewRapport = async (interventionId) => {
    try {
      const token = localStorage.getItem("token");
      // On récupère TOUS les rapports
      const res = await axios.get(`${API_URL}/api/rapports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // On filtre manuellement l'intervention correspondante
      const rapportsLies = res.data.filter(r => 
        (r.intervention?._id === interventionId) || (r.intervention === interventionId)
      );
  
      setSelectedRapport(rapportsLies);
      setShowModal(true);
    } catch (err) {
      console.error("Erreur:", err);
      alert("Impossible de charger les rapports.");
    }
  };

  if (loading) return <div className="loading">Chargement des interventions...</div>;

  return (
    <div className="update-statut-container">
      <div className="header">
        <h2 className="titren">
        <FaTools className="icon" /> Statuts d’interventions
        </h2>
      </div>

      {/* 🧭 Filtres */}
      <div className="filterss">
        <select
          value={filters.statut}
          onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
        >
          <option value="">-- Statut --</option>
          <option value="ouvert">Ouvert</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminée</option>
          <option value="annule">Annulée</option>
        </select>

        <select
          value={filters.ligne}
          onChange={(e) => setFilters({ ...filters, ligne: e.target.value })}
        >
          <option value="">-- Ligne --</option>
          {lignes.map((l) => (
            <option key={l._id} value={l._id}>
              {l.nom}
            </option>
          ))}
        </select>

        <select
          value={filters.equipement}
          onChange={(e) =>
            setFilters({ ...filters, equipement: e.target.value })
          }
        >
          <option value="">-- Code équipement --</option>
          {equipements.map((eq) => (
            <option key={eq._id} value={eq._id}>
              {eq.code}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Demandeur..."
          value={filters.demandeur}
          onChange={(e) =>
            setFilters({ ...filters, demandeur: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Numéro..."
          value={filters.numero}
          onChange={(e) => setFilters({ ...filters, numero: e.target.value })}
        />

        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />

        
          <button className="apply-btnx" onClick={applyFilters}>
             Appliquer
          </button>
          <button className="reset-btnx" onClick={resetFilters}>
             Réinitialiser
          </button>
        </div>
      

      {/* 📋 Tableau */}
      {filtered.length === 0 ? (
        <p className="no-data">Aucune intervention trouvée.</p>
      ) : (
        <table className="statut-table">
          <thead>
            <tr>
              <th>Numéro</th>
              <th>Ligne/Equip</th>
              <th>Arret</th>
              <th>Demarrage</th>
              <th>Description</th>
             <th>Interventions</th>
              <th>Récep Prod</th>
              <th>Clôture Maint</th>
              <th>Statut</th>
              
            </tr>
          </thead>
          <tbody>
            {filtered.map((interv) => (
              <tr key={interv._id}>
                <td className="tete"  data-label="">{interv.numero} <div className="arch">( {interv.demandeurNom} )</div><div className="archo"><small>-{new Date(interv.createdAt).toLocaleString()}-</small></div></td>
                <td data-label="">{interv.ligne?.nom} <div className="arch">( {interv.equipement?.code} )</div> </td>
                <td data-label=""><div><small>Arret ligne: {interv.ligneAsubiArret ? "Oui " : "Non "}</small> </div>
                                         <div><small>📅 {interv.dateHeureArretLigne ? interv.dateHeureArretLigne.replace('T', ' ').slice(0, 16): "--"}</small> </div>
                                         <div><small>Arret Equip: {interv.equipementAsubiArret ? "Oui " : "Non "}</small> </div>
                                         <div><small>📅 {interv.dateHeureArretEquipement ? interv.dateHeureArretEquipement.replace('T', ' ').slice(0, 16): "--"}</small> </div>
                
                 </td>
                <td data-label=""><div><small>Démar ligne: {interv.ligneAdemarre ? "Oui " : "Non "}</small> </div>
                                             <div><small>📅 {interv.dateHeureDemarrageLigne ? interv.dateHeureDemarrageLigne.replace('T', ' ').slice(0, 16): "--"}</small> </div>
                                             <div><small>Démar Equip: {interv.equipementAdemarre ? "Oui " : "Non "}</small> </div>
                                             <div><small>📅 {interv.dateHeureDemarrageEquipement ? interv.dateHeureDemarrageEquipement.replace('T', ' ').slice(0, 16): "--"}</small> </div>
                

                </td>
                <td data-label="Panne : " className="description"><small>{interv.descriptionAnomalie}</small></td>
                <td data-label="Détails">
                <button className="view-btn" onClick={() => handleViewRapport(interv._id)}>
                R 
                </button>
                </td>
                <td data-label="Recep.Prod :">
                  {interv.receptionProduction ? (
                    <span className="badge green">Oui</span>
                  ) : (
                    <span className="badge red">Non</span>
                  )}
                </td>
                <td data-label="Recep.Maint :">
                  {interv.clotureMaintenance ? (
                    <span className="badge green">Oui</span>
                  ) : (
                    <span className="badge red">Non</span>
                  )}
                </td>
                <td data-label="Statut">
                 
                  
                    <span className={`status ${interv.statut}`}>
                      {interv.statut}
                    </span>
                  
                </td>
               
              </tr>
            ))}
          </tbody>
        </table>
      )}


{showModal && (
  <div className="modal-overlay">
    <div className="modal-content large">
      <div className="modal-header">
        <h3>Historique des travaux</h3>
        <button onClick={() => setShowModal(false)}>&times;</button>
      </div>
      
      <div className="modal-body">
        {/* On vérifie si on a des rapports à afficher */}
        {selectedRapport && selectedRapport.length > 0 ? (
          selectedRapport.map((rap, index) => (
            <div key={rap._id} className="rapport-card">
              <div className="rapport-badge">Rapport #{index + 1}</div>
              <p><strong> 📅 Date :</strong> {new Date(rap.dateIntervention).toLocaleDateString()}</p>
              <p><strong> 🔧 Travaux :</strong> {rap.descriptionTravaux}</p>
              <div className="tech-list">
                <strong> 👨‍🔧 Techniciens :</strong>
                {rap.techniciens.map((t, i) => (
                  <span key={i} className="tech-tag">
                    👨 {t.technicien?.nom} {t.technicien?.prenom}  📅 ({t.dureeMinutes} min)
                  </span> 
                ))}
              </div>
              <div className="tech-list">
                <strong> 🔧🔧 Pieces :</strong>
                {rap.piecesRemplacees.map((p, i) => (
                  <span key={i} className="tech-tag">
                   🔧 {p.nom} (Quantité: {p.quantite})
                  </span> 
                ))}
              </div>
              
              <hr />
              <p><strong> 🔧 Remarques :</strong> {rap.commentaires}</p>
            </div>
          ))
        ) : (
          <p className="no-data">Aucun rapport saisi pour le moment.</p>
        )}
      </div>
    </div>
  </div>
)}


    </div>
  );
}

