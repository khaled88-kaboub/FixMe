import { useState, useEffect } from "react";
import axios from "axios";
import "./AdminInterventionPage.css";
import { FaTools, FaTrashAlt, FaSearch, FaSync, FaEdit, FaTimes } from "react-icons/fa";

export default function AdminInterventionsPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [interventions, setInterventions] = useState([]);
  const [filteredInterventions, setFilteredInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lignes, setLignes] = useState([]);
  const [equipements, setEquipements] = useState([]);

  // États pour la modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);

  const [filters, setFilters] = useState({
    date: "", statut: "", ligne: "", codeEquipement: "", numero: "", demandeur: "",
  });

  useEffect(() => { fetchAllData(); }, []);
  useEffect(() => { applyFilters(); }, [filters, interventions]);

  const fetchAllData = async () => {
    try {
      const [intervRes, ligneRes, equipRes] = await Promise.all([
        axios.get(`${API_URL}/api/interventions`),
        axios.get(`${API_URL}/api/lignes`),
        axios.get(`${API_URL}/api/equipements`),
      ]);
      setInterventions(intervRes.data);
      setLignes(ligneRes.data);
      setEquipements(equipRes.data);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...interventions];
    if (filters.numero) filtered = filtered.filter(i => i.numero.toLowerCase().includes(filters.numero.toLowerCase()));
    if (filters.demandeur) filtered = filtered.filter(i => i.demandeurNom?.toLowerCase().includes(filters.demandeur.toLowerCase()));
    if (filters.ligne) filtered = filtered.filter(i => i.ligne?._id === filters.ligne);
    if (filters.codeEquipement) filtered = filtered.filter(i => i.equipement?._id === filters.codeEquipement);
    if (filters.statut) filtered = filtered.filter(i => i.statut === filters.statut);
    if (filters.date) {
        filtered = filtered.filter(i => new Date(i.createdAt).toLocaleDateString() === new Date(filters.date).toLocaleDateString());
    }
    setFilteredInterventions(filtered);
  };

  // --- ACTIONS ---

  const handleEditClick = (interv) => {
    setSelectedIntervention({ ...interv }); // On crée une copie
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_URL}/api/interventions/${selectedIntervention._id}`,
        selectedIntervention,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Mise à jour locale de la liste
      setInterventions(interventions.map(i => i._id === res.data._id ? res.data : i));
      setIsModalOpen(false);
      alert("✅ Mise à jour réussie !");
    } catch (err) {
      alert("❌ Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette intervention ?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/interventions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterventions(interventions.filter((i) => i._id !== id));
    } catch (error) {
      alert("❌ Échec suppression");
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="admin-interventions-container">
      <div className="header">
        <h1><FaTools/>Liste des demandes d'interventions</h1>
      </div>

      {/* Barre de Filtres (inchangée mais simplifiée ici pour la lecture) */}
     

      <table className="interventions-table">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Ligne</th>
            <th>Équipement</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInterventions.map((interv) => (
            <tr key={interv._id}>
              <td>{interv.numero}</td>
              <td>{interv.ligne?.nom}</td>
              <td>{interv.equipement?.designation}</td>
              <td><span className={`status ${interv.statut}`}>{interv.statut}</span></td>
              <td className="actions-cell">
                <button className="edit-btn" onClick={() => handleEditClick(interv)}><FaEdit /></button>
                <button className="delete-btn" onClick={() => handleDelete(interv._id)}><FaTrashAlt /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🟦 MODALE DE MODIFICATION */}
      {isModalOpen && (
        <div className="modalo-overlayo">
          <div className="modalo-contento">
            <div className="modalo-headero">
              <h3>Modifier la demande d'intervention {selectedIntervention.numero}</h3>
              {/* <button onClick={() => setIsModalOpen(false)}><FaTimes /></button> */}
            </div>
            <form onSubmit={handleUpdate}>
              <div className="forma-group">
                <label>Statut</label>
                <select 
                  value={selectedIntervention.statut}
                  onChange={(e) => setSelectedIntervention({...selectedIntervention, statut: e.target.value})}
                >
                  <option value="ouvert">ouvert</option>
                  <option value="en_cours">en_cours</option>
                  <option value="termine">termine</option>
                  <option value="annule">annule</option>
                </select>
              </div>

              <div className="forma-group">
                <label>Description Anomalie</label>
                <textarea 
                  value={selectedIntervention.descriptionAnomalie}
                  onChange={(e) => setSelectedIntervention({...selectedIntervention, descriptionAnomalie: e.target.value})}
                />
              </div>

              <div className="forma-row">
                <div className="forma-group">
                    <label>Ligne a subi Arret ?</label>
                    
                    <input 
                        type="checkbox" 
                        checked={selectedIntervention.ligneAsubiArret}
                        onChange={(e) => setSelectedIntervention({...selectedIntervention, ligneAsubiArret: e.target.checked})}
                    />
                   
                    
                </div>


                <div className="forma-group">
                    <label>Date d'arret ligne</label>
                    <input 
                        type="datetime-local" 
                        value={selectedIntervention.dateHeureArretLigne ? selectedIntervention.dateHeureArretLigne.replace('T', ' ').slice(0, 16) : "-" }
                        onChange={(e) => setSelectedIntervention({...selectedIntervention, dateHeureArretLigne: e.target.value})}
                    />
                </div>
                <div className="forma-group">
                    <label>Equipement a subi arret ?</label>
                    <input 
                        type="checkbox" 
                        checked={selectedIntervention.equipementAsubiArret}
                        onChange={(e) => setSelectedIntervention({...selectedIntervention, equipementAsubiArret: e.target.checked})}
                    />
                </div>

                <div className="forma-group">
                    <label>Date d'arret Equipement</label>
                    <input 
                        type="datetime-local" 
                        value={selectedIntervention.dateHeureArretEquipement ? selectedIntervention.dateHeureArretEquipement.replace('T', ' ').slice(0, 16) : "-" }
                        onChange={(e) => setSelectedIntervention({...selectedIntervention, dateHeureArretEquipement: e.target.value})}
                    />
                </div>

                <div className="forma-group">
                    <label>Ligne a redmarré ?</label>
                    <input 
                        type="checkbox" 
                        checked={selectedIntervention.ligneAdemarre}
                        onChange={(e) => setSelectedIntervention({...selectedIntervention, ligneAdemarre: e.target.checked})}
                    />
                </div>

                <div className="forma-group">
                    <label>Date démarrage ligne</label>
                    <input 
                        type="datetime-local" 
                
                        value={selectedIntervention.dateHeureDemarrageLigne ? selectedIntervention.dateHeureDemarrageLigne.replace('T', ' ').slice(0, 16) : "-" }
                        onChange={(e) => setSelectedIntervention({...selectedIntervention, dateHeureDemarrageLigne: e.target.value})}
                    />
                </div>
                
                <div className="forma-group">
                    <label>Equipement a redémarré ?</label>
                    <input 
                        type="checkbox" 
                        checked={selectedIntervention.equipementAdemarre}
                        onChange={(e) => setSelectedIntervention({...selectedIntervention, equipementAdemarre: e.target.checked})}
                    />
                </div>

                <div className="forma-group">
                    <label>Date démarrage equipement</label>
                    <input 
                        type="datetime-local" 
                        value={selectedIntervention.dateHeureDemarrageEquipement ? selectedIntervention.dateHeureDemarrageEquipement.replace('T', ' ').slice(0, 16) : "-" }
                        onChange={(e) => setSelectedIntervention({...selectedIntervention, dateHeureDemarrageEquipement: e.target.value})}
                    />
                </div>
              </div>

              <div className="modalo-footero">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className="cancel-btn">Enregistrer les modifications</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}