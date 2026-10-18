import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useMaintenancePreventive from "../hooks/useMaintenancePreventive";
import "./MaintenancePreventiveForm.css";

const today = new Date().toISOString().slice(0, 10);

export default function MaintenancePreventiveForm() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const { addMP, editMP } = useMaintenancePreventive();

  const [lignes, setLignes] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [filteredEquipements, setFilteredEquipements] = useState([]);

  const [form, setForm] = useState({
    titre: "",
    equipement: null,
    ligne: null,
    frequence: "mois",
    intervalle: 1,
    type: "",
    taches: [{ description: "", dureeEstimee: 0, obligatoire: true }],
    dateDebut: today,
    dateProchaine: "",
  });

  // 1) Charger lignes + équipements
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lignesRes, equipRes] = await Promise.all([
          axios.get(`${API_URL}/api/lignes`),
          axios.get(`${API_URL}/api/equipements`),
        ]);

        setLignes(lignesRes.data || []);
        setEquipements(equipRes.data || []);
      } catch (err) {
        console.error("Erreur chargement :", err);
      }
    };

    fetchData();
  }, [API_URL]);

  // Filtrer les équipements selon la ligne sélectionnée
  useEffect(() => {
    if (!form.ligne) {
      setFilteredEquipements([]);
      return;
    }

    const selectedLigneId = form.ligne._id || form.ligne;

    const filtered = equipements.filter((eq) => {
      if (Array.isArray(eq.ligne)) {
        return eq.ligne.some((l) => (l._id || l) === selectedLigneId);
      }
      const eqLigneId = eq.ligne?._id || eq.ligne;
      return eqLigneId === selectedLigneId;
    });

    setFilteredEquipements(filtered);
  }, [form.ligne, equipements]);

  // 2) Charger MP seulement quand lignes + équipements sont disponibles
  useEffect(() => {
    if (!id) return;
    if (lignes.length === 0 || equipements.length === 0) return;

    const loadMP = async () => {
      try {
        const mpRes = await axios.get(`${API_URL}/api/mp/${id}`);
        const mp = mpRes.data;

        const ligneObj =
          lignes.find((l) => l._id === (mp.ligne?._id || mp.ligne)) || null;

        const equipObj =
          equipements.find(
            (eq) => eq._id === (mp.equipement?._id || mp.equipement)
          ) || null;

        setForm({
          ...mp,
          ligne: ligneObj,
          equipement: equipObj,
          type: mp.type || "",
          dateDebut: mp.dateDebut?.substring(0, 10) || "",
          dateProchaine: mp.dateProchaine?.substring(0, 10) || "",
        });
      } catch (err) {
        console.error("Erreur chargement MP :", err);
      }
    };

    loadMP();
  }, [id, lignes, equipements, API_URL]);

  // Gestion du changement de Type (conditionnelle -> frequence="annee", intervalle=200)
  const handleTypeChange = (e) => {
    const selectedType = e.target.value;

    if (selectedType === "conditionnelle") {
      setForm((prev) => ({
        ...prev,
        type: selectedType,
        frequence: "annee",
        intervalle: 200,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        type: selectedType,
      }));
    }
  };

  // Gestion tâches
  const updateTask = (i, key, value) => {
    const taches = [...form.taches];
    taches[i][key] = key === "dureeEstimee" ? Number(value) : value;
    setForm({ ...form, taches });
  };

  const addTask = () => {
    setForm({
      ...form,
      taches: [...form.taches, { description: "", dureeEstimee: 0, obligatoire: true }],
    });
  };

  const deleteTask = (i) => {
    setForm({ ...form, taches: form.taches.filter((_, idx) => idx !== i) });
  };

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      type: form.type,
      ligne: form.ligne?._id || form.ligne,
      equipement: form.equipement?._id || form.equipement,
      dateDebut: form.dateDebut || null,
      dateProchaine: form.frequence === "fixe" ? form.dateProchaine : null,
    };

    try {
      if (id) await editMP(id, payload);
      else await addMP(payload);

      navigate("/mplist");
    } catch (err) {
      console.error("Erreur save:", err);
    }
  };

  return (
    <div className="formulaire">
      <h2 className="titre">
        {id ? "Modifier Maintenance Préventive" : "Créer Maintenance Préventive"}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Titre */}
        <div className="form-group">
          <label>Titre de la maintenance</label>
          <input
            className="entree"
            placeholder="Ex: Vidange et contrôle périodique"
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
            required
          />
        </div>

        {/* Ligne, Equipement, Type */}
        <div className="tranche1">
          <div className="class1">
            <label>Ligne</label>
            <select
              className="entree"
              value={form.ligne?._id || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  ligne: lignes.find((l) => l._id === e.target.value) || null,
                  equipement: null, // réinitialise l'équipement lors du changement de ligne
                })
              }
            >
              <option value="">-- Choisir --</option>
              {lignes.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="class1">
            <label>Équipement</label>
            <select
              className="entree"
              value={form.equipement?._id || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  equipement:
                    filteredEquipements.find((eq) => eq._id === e.target.value) ||
                    null,
                })
              }
              disabled={!form.ligne}
            >
              <option value="">-- Choisir --</option>
              {filteredEquipements.map((eq) => (
                <option key={eq._id} value={eq._id}>
                  {eq.designation} ({eq.code})
                </option>
              ))}
            </select>
          </div>

          <div className="class1">
            <label>Type</label>
            <select
              className="entree"
              value={form.type}
              onChange={handleTypeChange}
              required
            >
              <option value="">-- Choisir --</option>
              <option value="systematique">Systématique</option>
              <option value="conditionnelle">Conditionnelle</option>
              <option value="reglementaire">Réglementaire</option>
            </select>
          </div>
        </div>

        {/* Dates et Fréquence */}
        <div className="tranche1">
          <div className="class1">
            <label>Date de début</label>
            <input
              type="date"
              className="entree"
              value={form.dateDebut}
              onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
              required
            />
          </div>

          {/* Affichage conditionnel : masqué si le type est "conditionnelle" */}
          {form.type !== "conditionnelle" && (
            <>
              <div className="class1">
                <label>Fréquence</label>
                <select
                  className="entree"
                  value={form.frequence}
                  onChange={(e) => setForm({ ...form, frequence: e.target.value })}
                >
                  <option value="jour">Jour</option>
                  <option value="semaine">Semaine</option>
                  <option value="mois">Mois</option>
                  <option value="annee">Année</option>
                  <option value="fixe">Fixe</option>
                </select>
              </div>

              <div className="class1">
                {form.frequence !== "fixe" && (
                  <>
                    <label>Intervalle</label>
                    <input
                      type="number"
                      className="entree"
                      min="1"
                      value={form.intervalle}
                      onChange={(e) =>
                        setForm({ ...form, intervalle: Number(e.target.value) })
                      }
                      required
                    />
                  </>
                )}

                {form.frequence === "fixe" && (
                  <>
                    <label>Date planifiée (fixe)</label>
                    <input
                      type="date"
                      className="entree"
                      value={form.dateProchaine}
                      onChange={(e) =>
                        setForm({ ...form, dateProchaine: e.target.value })
                      }
                      required
                    />
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Tâches */}
        <div className="section-taches">
          <label className="section-label">Tâches à réaliser</label>
          {form.taches.map((t, i) => (
            <div key={i} className="tache-item">
              <input
                className="entree tache-description"
                placeholder="Description de la tâche"
                value={t.description}
                onChange={(e) => updateTask(i, "description", e.target.value)}
                required
              />
              <input
                type="number"
                className="entree tache-duree"
                placeholder="Durée (min)"
                min="0"
                value={t.dureeEstimee}
                onChange={(e) => updateTask(i, "dureeEstimee", e.target.value)}
              />
              <button
                type="button"
                onClick={() => deleteTask(i)}
                className="supprimer-tache"
                title="Supprimer la tâche"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            className="ajouter-tache"
            onClick={addTask}
          >
            + Ajouter une tâche
          </button>
        </div>

        <button type="submit" className="enregistrer">
          {id ? "Mettre à jour" : "Enregistrer la maintenance"}
        </button>
      </form>
    </div>
  );
}