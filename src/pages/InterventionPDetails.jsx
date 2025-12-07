import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import "./InterventionPDetails.css";

export default function InterventionPDetails() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const navigate = useNavigate();

  const [intervention, setIntervention] = useState({ technicienAffecte: [] });
  const [loading, setLoading] = useState(true);

  const STATUTS = ["planifiee", "en_cours", "terminee", "retard", "annulee"];

  // ------------------------------
  // Fetch intervention
  // ------------------------------
  useEffect(() => {
    fetchIntervention();
  }, []);

  const fetchIntervention = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/interventionP/${id}`);
      setIntervention({
        ...res.data,
        technicienAffecte: res.data.technicienAffecte || []
      });
    } catch (err) {
      console.error("Erreur récupération intervention :", err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Handle changes for simple fields
  // ------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setIntervention(prev => ({
      ...prev,
      [name]: value,
      technicienAffecte: prev.technicienAffecte || [] // ne jamais écraser
    }));
  };

  // ------------------------------
  // Bloc Techniciens
  // ------------------------------
  function BlocTechniciens({ intervention, setIntervention }) {
    const [techniciensDispo, setTechniciensDispo] = useState([]);
    const [newTech, setNewTech] = useState("");
    const [newDuree, setNewDuree] = useState("");
  
    // Charger la liste des techniciens
    useEffect(() => {
      axios.get(`${API_URL}/api/techniciens`)
        .then(res => setTechniciensDispo(res.data))
        .catch(err => console.error("Erreur chargement techniciens:", err));
    }, []);
  
    // Ajouter un technicien
    const ajouterTechnicien = () => {
      if (!newTech) return alert("Sélectionnez un technicien");
  
      const exist = intervention.technicienAffecte?.find(t => {
        const id = t.technicien?._id || t.technicien;
        return id === newTech;
      });
      if (exist) return alert("Ce technicien est déjà ajouté");
  
      setIntervention({
        ...intervention,
        technicienAffecte: [
          ...(intervention.technicienAffecte || []),
          { technicien: newTech, duree: Number(newDuree) || 0 }
        ]
      });
  
      setNewTech("");
      setNewDuree("");
    };
  
    // Supprimer un technicien
    const supprimerTechnicien = (id) => {
      setIntervention({
        ...intervention,
        technicienAffecte: intervention.technicienAffecte.filter(t => {
          const techId = t.technicien?._id || t.technicien;
          return techId !== id;
        })
      });
    };
  
    // Modifier la durée
    const modifierDuree = (id, value) => {
      setIntervention({
        ...intervention,
        technicienAffecte: intervention.technicienAffecte.map(t => {
          const techId = t.technicien?._id || t.technicien;
          return techId === id ? { ...t, duree: Number(value) } : t;
        })
      });
    };
  
    return (
      <div className="details-section">
        <h3>Techniciens affectés</h3>
  
        {intervention.technicienAffecte?.length > 0 ? (
          <div className="tech-list">
            {intervention.technicienAffecte.map((t, index) => {
              const techId = t.technicien?._id || t.technicien;
              const tech = techniciensDispo.find(x => x._id === techId);
  
              return (
                <div className="tech-item" key={techId || index}>
                  <span className="tech-name">
                    {tech ? `${tech.nom} ${tech.prenom}` : "Technicien inconnu"}
                  </span>
  
                  <input
                    type="number"
                    className="duree-input"
                    value={t.duree || ""}
                    onChange={(e) => modifierDuree(techId, e.target.value)}
                  />
  
                  <button className="btn-delete" onClick={() => supprimerTechnicien(techId)}>
                    X
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ opacity: 0.6 }}>Aucun technicien affecté</p>
        )}
        
  <h3>Choisir un ou plusieurs technicien</h3>
  
        <div className="tech-add">
          <select
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            className="select-field"
          >

            <option value="">-- Sélectionner technicien --</option>
            {techniciensDispo.map(t => (
              <option key={t._id} value={t._id}>
                {t.nom} {t.prenom}
              </option>
            ))}
          </select>
  
          <input
            type="number"
            placeholder="Durée (min)"
            value={newDuree}
            onChange={(e) => setNewDuree(e.target.value)}
            className="input-field"
          />
  
          <button onClick={ajouterTechnicien} className="btn-add">
            Ajouter
          </button>
        </div>
      </div>
    );
  }
  

  // ------------------------------
  // Handle submit
  // ------------------------------
  const handleSubmit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/interventionP/${id}`, intervention);
      alert("Intervention mise à jour avec succès !");
      navigate("/mpcalendar2");
    } catch (err) {
      console.error("Erreur mise à jour :", err);
      alert("Erreur lors de la mise à jour");
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!intervention) return <div>Intervention introuvable.</div>;

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className="page-intervention-details">
      <div className="page-header">
        <button onClick={() => navigate("/mpcalendar2")} className="btn-save">
          <FaArrowLeft /> Retour
        </button>
        <button onClick={handleSubmit} className="btn-save">
          <FaSave /> Enregistrer les modifications
        </button>
      </div>

      <h2 className="page-title">Détails Intervention – {intervention.numero}</h2>

      <div className="details-card">
        <div className="form-group">
          <label>Titre</label>
          <input
            type="text"
            name="titre"
            value={intervention.titre || ""}
            onChange={handleChange}
            className="input-field"
            
          />
        </div>

        <div className="form-group">
          <label>Statut</label>
          <select
            name="statut"
            value={intervention.statut || ""}
            onChange={handleChange}
            className="select-field"
          >
            {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Date planifiée</label>
          <input
            type="date"
            disabled
            value={intervention.datePlanifiee
              ? new Date(intervention.datePlanifiee).toISOString().substr(0, 10)
              : ""}
            className="input-field input-disabled"
          />
        </div>

        <div className="form-group">
          <label>Date de réalisation</label>
          <input
            type="date"
            name="dateRealisation"
            value={intervention.dateRealisation
              ? new Date(intervention.dateRealisation).toISOString().substr(0, 10)
              : ""}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Durée réelle (min)</label>
          <input
            type="number"
            name="dureeReelle"
            value={intervention.dureeReelle || ""}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label>Commentaire</label>
          <textarea
            name="commentaire"
            value={intervention.commentaire || ""}
            onChange={handleChange}
            className="textarea-field"
          />
        </div>
<div className="form-group" style={{ gridColumn: "1 / -1" }}>
        <BlocTechniciens intervention={intervention} setIntervention={setIntervention} />
        </div>
      
        
      </div>
    </div>
  );
}
