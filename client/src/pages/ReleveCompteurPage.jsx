import { useEffect, useState } from "react";
import axios from "axios";
import "./ReleveCompteurPage.css";
import { toast } from "react-toastify";

export default function ReleveCompteurPage() {
  const [equipements, setEquipements] = useState([]);
  const [equipement, setEquipement] = useState("");
  const [valeurCompteur, setValeurCompteur] = useState("");
  const [remarque, setRemarque] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    fetchEquipements();
  }, []);

  const fetchEquipements = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/equipements`);
      setEquipements(res.data);
    } catch (error) {
      toast.error("Erreur chargement équipements");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!equipement || valeurCompteur === "") {
      return toast.warning("Veuillez remplir tous les champs obligatoires");
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/compteurs`, {
        equipement,
        valeurCompteur: Number(valeurCompteur),
        remarque
      });

      toast.success("Relevé compteur enregistré");
      setValeurCompteur("");
      setRemarque("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'enregistrement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="releve-container">
      <h2>📊 Relevé compteur horaire machine</h2>

      <form className="releve-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Équipement *</label>
          <select
            value={equipement}
            onChange={(e) => setEquipement(e.target.value)}
          >
            <option value="">-- Sélectionner --</option>
            {equipements.map((eq) => (
              <option key={eq._id} value={eq._id}>
                {eq.designation} ({eq.code}) 
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Valeur compteur (heures) *</label>
          <input
            type="number"
            min="0"
            value={valeurCompteur}
            onChange={(e) => setValeurCompteur(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Remarque</label>
          <textarea
            rows="3"
            value={remarque}
            onChange={(e) => setRemarque(e.target.value)}
          />
        </div>

        <button className="btn-submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
