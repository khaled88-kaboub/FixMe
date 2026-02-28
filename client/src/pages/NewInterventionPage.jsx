import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
//import "react-toastify/dist/ReactToastify.css";
import { FaTools } from "react-icons/fa";
import "./NewInterventionPage.css";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
export default function NewInterventionPage() {

  const API_URL = import.meta.env.VITE_API_URL;
  
  const [form, setForm] = useState({
    ligne: "",
    equipement: "",
    ligneAsubiArret: false,
    dateHeureArretLigne: "",
    equipementAsubiArret: false,
    dateHeureArretEquipement: "",
    descriptionAnomalie: "",
    
  });

  const [lignes, setLignes] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({ ...prev, demandeurNom: user.name }));
    }
  }, [user]);

  // Charger les lignes
  useEffect(() => {
    const fetchLignes = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/lignes`);
        setLignes(res.data);
      } catch (err) {
        toast.error("Erreur lors du chargement des lignes");
      }
    };
    fetchLignes();
  }, []);

  // Charger les équipements selon la ligne choisie
  useEffect(() => {
    const fetchEquipements = async () => {
      if (!form.ligne) return setEquipements([]);
      try {
        const res = await axios.get(`${API_URL}/api/equipements`);


      const filtres = res.data.filter((eq) =>
      Array.isArray(eq.ligne) &&
      eq.ligne.some((l) => (l?._id || l) === form.ligne)
      );

setEquipements(filtres);

      } 
      catch (err) {

        toast.error("Erreur lors du chargement des équipements");
      }
    };
    fetchEquipements();
  }, [form.ligne]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    setForm((prev) => {
      let updated = { ...prev, [name]: type === "checkbox" ? checked : value };
  
      // 🔥 Règle auto : si la ligne a subi un arrêt → l'équipement aussi
      if (name === "ligneAsubiArret" && checked === true) {
        updated.equipementAsubiArret = true;
      }
      return updated;
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // On prépare les données en incluant le nom de l'utilisateur actuel
  const dataToSend = {
    ...form,
    demandeurNom: user.name // ✅ On prend le nom du user actuel du contexte
  };
  
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/interventions`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Intervention enregistrée !");
      setForm({
        ligne: "",
        equipement: "",
        ligneAsubiArret: false,
        dateHeureArretLigne: "",
        equipementAsubiArret: false,
        dateHeureArretEquipement: "",
        descriptionAnomalie: "",
        
      });
      setEquipements([]);
    } catch (error) {
      toast.error("❌ Erreur lors de l’enregistrement !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="new-intervention-container">

  
        <div className="section-header">
          <h2><FaTools /> Nouvelle demande d’intervention</h2>
          <div className="section2-underline2"></div>
        </div>

        <form className="intervention-form" onSubmit={handleSubmit}>
          {/* Ligne */}
          <div className="form-group">
            <select
              name="ligne"
              value={form.ligne}
              onChange={handleChange}
              required
            >
              <option value="">-- Sélectionnez une ligne --</option>
              {lignes.map((ligne) => (
                <option key={ligne._id} value={ligne._id}>{ligne.nom}</option>
              ))}
            </select>
            <label>Ligne *</label>
          </div>

          {/* Équipement */}
          <div className="form-group">
            <select
              name="equipement"
              value={form.equipement}
              onChange={handleChange}
              disabled={!form.ligne || equipements.length === 0}
              required
            >
              <option value="">-- Sélectionnez un équipement --</option>
              {equipements.map((eq) => (
                <option key={eq._id} value={eq._id}>{eq.designation} ({eq.code})</option>
              ))}
            </select>
            <label>Équipement *</label>
          </div>

          {/* Ligne arrêt */}
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="ligneAsubiArret"
                checked={form.ligneAsubiArret}
                onChange={handleChange}
              /> La ligne a subi un arrêt ?
            </label>
            {form.ligneAsubiArret && (
              <input
                type="datetime-local"
                name="dateHeureArretLigne"
                value={form.dateHeureArretLigne}
                onChange={handleChange}
              />
            )}
          </div>

          {/* Équipement arrêt */}
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="equipementAsubiArret"
                checked={form.equipementAsubiArret}
                onChange={handleChange}
              /> L'équipement a subi un arrêt ?
            </label>
            {form.equipementAsubiArret && (
              <input
                type="datetime-local"
                name="dateHeureArretEquipement"
                value={form.dateHeureArretEquipement}
                onChange={handleChange}
              />
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <textarea
              name="descriptionAnomalie"
              value={form.descriptionAnomalie}
              onChange={handleChange}
              required
            ></textarea>
            <label>Description de l’anomalie *</label>
          </div>

          {/* Nom du demandeur */}
          <div className="form-group">
          <input
    type="text"
    name="demandeurNom"
    value={user ? user.name : "Chargement..."} // ✅ Lit directement le contexte
    disabled // ✅ Empêche la modification manuelle
    className="input-disabled"
  />
  <label>Nom du demandeur (Connecté)</label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </form>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
