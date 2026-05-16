import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TechniciensPage.css";

const TechniciensPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [techniciens, setTechniciens] = useState([]);
  const [allTechniciens, setAllTechniciens] = useState([]); // cache complet
  const [search, setSearch] = useState("");
  const [filterNom, setFilterNom] = useState(""); // nouveau filtre par nom
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    matricule: "",
    specialite: "autre",
    telephone: "",
    email: "",
    actif: true,
    dateEmbauche: "",
  });
  const [editingId, setEditingId] = useState(null);

  // 🔄 Charger les techniciens
  const fetchTechniciens = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/techniciens`);
      const data =
        Array.isArray(res.data)
          ? res.data
          : res.data.techniciens || res.data.data || [];
      setTechniciens(data);
      setAllTechniciens(data);
    } catch (err) {
      console.error("Erreur de chargement :", err);
      setTechniciens([]);
      setAllTechniciens([]);
    }
  };

  useEffect(() => {
    fetchTechniciens();
  }, []);

  // 🔍 Recherche serveur (optionnelle)
  const handleSearch = async () => {
    const q = search.trim();
    if (!q) {
      setTechniciens(allTechniciens);
      return;
    }

    try {
      const res = await axios.get(
        `${API_URL}/api/techniciens/search?nom=${encodeURIComponent(q)}`
      );
      const data =
        Array.isArray(res.data)
          ? res.data
          : res.data.techniciens || res.data.data || [];
      setTechniciens(data);
    } catch (err) {
      console.error("Erreur recherche serveur :", err);

      // 🔁 fallback client-side
      const lower = q.toLowerCase();
      const filtered = allTechniciens.filter(
        (t) =>
          t.nom?.toLowerCase().includes(lower) ||
          t.prenom?.toLowerCase().includes(lower) ||
          t.specialite?.toLowerCase().includes(lower)
      );
      setTechniciens(filtered);
    }
  };

  // 🧩 Filtre local par nom
  useEffect(() => {
    if (!filterNom.trim()) {
      setTechniciens(allTechniciens);
      return;
    }
    const lower = filterNom.toLowerCase();
    const filtered = allTechniciens.filter((t) =>
      t.nom?.toLowerCase().includes(lower)
    );
    setTechniciens(filtered);
  }, [filterNom, allTechniciens]);

  // ➕ Ajouter ou modifier
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/techniciens/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/api/techniciens`, formData);
      }
      setShowModal(false);
      setFormData({
        nom: "",
        prenom: "",
        matricule: "",
        specialite: "autre",
        telephone: "",
        email: "",
        actif: true,
        dateEmbauche: "",
      });
      setEditingId(null);
      fetchTechniciens();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement :", err);
    }
  };

  // ✏️ Éditer
  const handleEdit = (tech) => {
    setFormData({
      nom: tech.nom || "",
      prenom: tech.prenom || "",
      matricule: tech.matricule || "",
      specialite: tech.specialite || "autre",
      telephone: tech.telephone || "",
      email: tech.email || "",
      actif: tech.actif ?? true,
      dateEmbauche: tech.dateEmbauche
        ? tech.dateEmbauche.split("T")[0]
        : "",
    });
    setEditingId(tech._id);
    setShowModal(true);
  };

  // 🗑️ Supprimer
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce technicien ?")) {
      try {
        await axios.delete(`${API_URL}/api/techniciens/${id}`);
        fetchTechniciens();
      } catch (err) {
        console.error("Erreur suppression :", err);
      }
    }
  };

  return (
    <div className="tech-container">
      <h1> 👥 Gestion des Techniciens</h1>

      <div className="tech-controls">
        {/*<input
          type="text"
          placeholder="🔍 Recherche générale (nom ou spécialité)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyUp={handleSearch}
  />*/}


        <button className="btn-orange" onClick={() => setShowModal(true)}>
          ➕ Ajouter nouveau technicien
        </button>

        <input
          type="text"
          placeholder="🔎 Filtrer uniquement par nom"
          value={filterNom}
          onChange={(e) => setFilterNom(e.target.value)}
        />

       
      </div>

      <table className="tech-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Matricule</th>
            <th>Spécialité</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th>Actif</th>
            <th>Date d'embauche</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(techniciens) && techniciens.length > 0 ? (
            techniciens.map((t) => (
              <tr key={t._id}>
                <td data-label = "Nom :" >{t.nom}</td>
                <td data-label = "Prénom :">{t.prenom}</td>
                <td data-label = "Matricule :">{t.matricule}</td>
                <td data-label = "Spécialité :">{t.specialite}</td>
                <td data-label = "Téléphone :">{t.telephone}</td>
                <td data-label = "Email :">{t.email}</td>
                <td data-label = "Actif ? :">{t.actif ? "✅" : "❌"}</td>
                <td data-label = "Date d'embauche :">
                  {t.dateEmbauche
                    ? new Date(t.dateEmbauche).toLocaleDateString("fr-FR")
                    : "-"}
                </td>
                <td>
                  <button className="btn-edito" onClick={() => handleEdit(t)}>
                    ✏️
                  </button>
                  <button
                    className="btn-deleto"
                    onClick={() => handleDelete(t._id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                Aucun technicien trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>
              {editingId
                ? "Modifier le technicien"
                : "Ajouter un technicien"}
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nom"
                value={formData.nom}
                onChange={(e) =>
                  setFormData({ ...formData, nom: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Prénom"
                value={formData.prenom}
                onChange={(e) =>
                  setFormData({ ...formData, prenom: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Matricule"
                value={formData.matricule}
                onChange={(e) =>
                  setFormData({ ...formData, matricule: e.target.value })
                }
                required
              />
              <select
                value={formData.specialite}
                onChange={(e) =>
                  setFormData({ ...formData, specialite: e.target.value })
                }
              >
                <option value="mécanique">Mécanique</option>
                <option value="électrique">Électrique</option>
                <option value="automatisme">Automatisme</option>
                <option value="hydraulique">Hydraulique</option>
                <option value="autre">Autre</option>
              </select>
              <input
                type="text"
                placeholder="Téléphone"
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <label>
                Actif :
                <input
                  type="checkbox"
                  checked={formData.actif}
                  onChange={(e) =>
                    setFormData({ ...formData, actif: e.target.checked })
                  }
                />
              </label>
              <label>
                Date d’embauche :
                <input
                  type="date"
                  value={formData.dateEmbauche}
                  onChange={(e) =>
                    setFormData({ ...formData, dateEmbauche: e.target.value })
                  }
                />
              </label>

              <div className="modal-buttons">
                <button type="submit" className="btn-orange">
                  {editingId ? "Mettre à jour" : "Ajouter"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechniciensPage;

