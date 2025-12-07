import React, { useState } from "react";
import axios from "axios";

export default function InterventionForm({ token }) {
  const [form, setForm] = useState({
    ligne: "", equipement: "",
    ligneAsubiArret: false, dateHeureArretLigne: "",
    equipementAsubiArret: false, dateHeureArretEquipement: "",
    descriptionAnomalie: "", demandeurNom: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // validation simple côté client
    if (!form.ligne || !form.equipement || !form.descriptionAnomalie || !form.demandeurNom) {
      setMessage("Remplir les champs obligatoires.");
      return;
    }
    if (form.ligneAsubiArret && !form.dateHeureArretLigne) {
      setMessage("Saisir la date/heure d'arrêt de la ligne.");
      return;
    }
    if (form.equipementAsubiArret && !form.dateHeureArretEquipement) {
      setMessage("Saisir la date/heure d'arrêt de l'équipement.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/interventions", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`Intervention créée (${res.data.intervention.numero})`);
      // reset ou redirection selon UX
      setForm({
        ligne: "", equipement: "",
        ligneAsubiArret: false, dateHeureArretLigne: "",
        equipementAsubiArret: false, dateHeureArretEquipement: "",
        descriptionAnomalie: "", demandeurNom: ""
      });
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Ligne *</label>
        <input name="ligne" value={form.ligne} onChange={handleChange} required />
      </div>

      <div>
        <label>Équipement *</label>
        <input name="equipement" value={form.equipement} onChange={handleChange} required />
      </div>

      <div>
        <label>
          <input type="checkbox" name="ligneAsubiArret" checked={form.ligneAsubiArret} onChange={handleChange} />
          La ligne a subi un arrêt ?
        </label>
        {form.ligneAsubiArret && (
          <input type="datetime-local" name="dateHeureArretLigne" value={form.dateHeureArretLigne} onChange={handleChange} />
        )}
      </div>

      <div>
        <label>
          <input type="checkbox" name="equipementAsubiArret" checked={form.equipementAsubiArret} onChange={handleChange} />
          L'équipement a subi un arrêt ?
        </label>
        {form.equipementAsubiArret && (
          <input type="datetime-local" name="dateHeureArretEquipement" value={form.dateHeureArretEquipement} onChange={handleChange} />
        )}
      </div>

      <div>
        <label>Description de l'anomalie *</label>
        <textarea name="descriptionAnomalie" value={form.descriptionAnomalie} onChange={handleChange} required />
      </div>

      <div>
        <label>Nom du demandeur *</label>
        <input name="demandeurNom" value={form.demandeurNom} onChange={handleChange} required />
      </div>

      <button disabled={loading}>{loading ? "Enregistrement..." : "Envoyer la demande"}</button>

      {message && <div>{message}</div>}
    </form>
  );
}
