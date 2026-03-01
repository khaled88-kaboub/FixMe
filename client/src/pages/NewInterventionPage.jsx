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
    demandeurNom: ""
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
    demandeurNom: user?.name // ✅ On prend le nom du user actuel du contexte
  };
  
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/interventions`, dataToSend, {
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
        demandeurNom: ""
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
          <h3><FaTools /> Nouvelle demande d’intervention</h3>
          <div className="section-underline"></div>
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
              <option value="" disabled hidden></option>
              {lignes.map((ligne) => (
                <option key={ligne._id} value={ligne._id}>{ligne.nom}</option>
              ))}
            </select>
            <label className={form.ligne ? "shrink" : ""}>Ligne *</label>
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
              <option value="" disabled hidden></option>
              {equipements.map((eq) => (
                <option key={eq._id} value={eq._id}>{eq.designation} ({eq.code})</option>
              ))}
            </select>
            <label className={form.equipement ? "shrink" : ""}>Équipement *</label>
          </div>

          {/* Zones d'arrêt (Groupées pour la clarté) */}
          <div className="status-grid">
            <div className="checkbox-card">
              <label className="checkbox-label">
              <span>Arrêt Ligne ?</span>
                <input
                  type="checkbox"
                  name="ligneAsubiArret"
                  checked={form.ligneAsubiArret}
                  onChange={handleChange}
                />
               
              </label>
              {form.ligneAsubiArret && (
                <input
                  type="datetime-local"
                  name="dateHeureArretLigne"
                  className="date-input"
                  value={form.dateHeureArretLigne}
                  onChange={handleChange}
                />
              )}
            </div>

            <div className="checkbox-card">
              <label className="checkbox-label">
              <span>Arrêt Équip ?</span>
                <input
                  type="checkbox"
                  name="equipementAsubiArret"
                  checked={form.equipementAsubiArret}
                  onChange={handleChange}
                />
                
              </label>
              {form.equipementAsubiArret && (
                <input
                  type="datetime-local"
                  name="dateHeureArretEquipement"
                  className="date-input"
                  value={form.dateHeureArretEquipement}
                  onChange={handleChange}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <textarea
              name="descriptionAnomalie"
              value={form.descriptionAnomalie}
              onChange={handleChange}
              placeholder=" " /* Important pour le CSS */
              required
            ></textarea>
            <label>Description de l’anomalie *</label>
          </div>

          {/* Demandeur */}
          <div className="form-group">
            <input
              type="text"
              name="demandeurNom"
              value={form.demandeurNom}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label>Nom du demandeur *</label>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Envoi en cours..." : "Envoyer la demande"}
          </button>
        </form>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
