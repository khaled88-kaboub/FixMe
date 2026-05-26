import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlusCircle, FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import "./AdminEquipementPage.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminEquipementPage() {
  const [lastCompteurs, setLastCompteurs] = useState({});
  const [equipements, setEquipements] = useState([]);
  const [designation, setDesignation] = useState("");
  const [code, setCode] = useState("");

  // ⬅️ MULTI-LIGNES
  const [lignesIds, setLignesIds] = useState([]);

  const [lignes, setLignes] = useState([]);
  const [filterDesignation, setFilterDesignation] = useState("");
  const [filterLigne, setFilterLigne] = useState("");

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    designation: "",
    code: "",
    lignes: [],
  });


  const fetchLignes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/lignes`);
      setLignes(res.data);
    } catch (err) {
      toast.error("Erreur de chargement des lignes");
    }
  };

  const fetchEquipements = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/equipements`);
      setEquipements(res.data);
    } catch (err) {
      toast.error("Erreur de chargement des équipements");
    }
  };
  

  useEffect(() => {
    fetchLignes();
    fetchEquipements();
  }, []);

  // 🔹 Ajouter
  const handleAdd = async (e) => {
    e.preventDefault();

    if (!designation.trim() || !code.trim() || lignesIds.length === 0)
      return toast.warn("Veuillez remplir tous les champs.");

    try {
      const res = await axios.post(`${API_URL}/api/equipements`, {
        designation,
        code,

        // ⬅️ ENVOYER UN TABLEAU
        ligne: lignesIds,
      });

      toast.success(`Équipement "${res.data.designation}" ajouté !`);

      setDesignation("");
      setCode("");
      setLignesIds([]);

      fetchEquipements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l’ajout");
    }
  };

  // 🔹 Supprimer
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet équipement ?")) return;
    try {
      await axios.delete(`${API_URL}/api/equipements/${id}`);
      toast.info("Équipement supprimé");
      fetchEquipements();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // 🔹 Activer édition
  const handleEdit = (equipement) => {
    setEditId(equipement._id);

    setEditData({
      designation: equipement.designation,
      code: equipement.code,
      ligne: equipement.ligne?.map((l) => l._id) || [],
    });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditData({ designation: "", code: "", ligne: [] });
  };

  // 🔹 Sauvegarder
  const handleSaveEdit = async (id) => {
    const { designation, code, ligne } = editData;

    if (!designation.trim() || !code.trim() || ligne.length === 0)
      return toast.warn("Tous les champs sont obligatoires.");

    try {
      await axios.put(`${API_URL}/api/equipements/${id}`, {
        designation,
        code,
        ligne: ligne,
      });

      toast.success("Équipement modifié !");
      setEditId(null);
      fetchEquipements();
    } catch (err) {
      toast.error("Erreur lors de la modification");
    }
  };


  const filteredEquipements = equipements
  .filter((eq) => {
    // filtre designation
    const matchDesignation = eq.designation
      .toLowerCase()
      .includes(filterDesignation.toLowerCase());

    // filtre ligne
    const matchLigne =
      filterLigne === "" ||
      eq.ligne?.some((l) => l._id === filterLigne);

    return matchDesignation && matchLigne;
  })

  // TRI ALPHABÉTIQUE
  .sort((a, b) =>
    a.designation.localeCompare(b.designation, "fr", {
      sensitivity: "base",
    })
  );


  return (
    <div className="admin-equipement-container">
      <h2>⚙️ Gestion des Équipements</h2>
{/* STATS */}
<div className="equipement-stats">
  <div className="stat-card">
    <span className="stat-number">
      {filteredEquipements.length}
    </span>

    <span className="stat-label">
      Équipement{filteredEquipements.length > 1 ? "s" : ""}
    </span>
  </div>
</div>
      {/* FORMULAIRE AJOUT */}
      <form onSubmit={handleAdd} className="add-equipement-form">
        <input
          type="text"
          placeholder="Désignation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
        />

        <input
          type="text"
          placeholder="Code équipement"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        {/* MULTI SELECT */}
        <select
          multiple
          value={lignesIds}
          onChange={(e) =>
            setLignesIds(Array.from(e.target.selectedOptions, (o) => o.value))
          }
        >
          {lignes.map((ligne) => (
            <option key={ligne._id} value={ligne._id}>
              {ligne.nom}
            </option>
          ))}
        </select>

        <button type="submit">
          <FaPlusCircle /> Ajouter
        </button>
      </form>


{/* FILTRES */}
<div className="filters-container">
  <input
    type="text"
    placeholder="🔍 Filtrer par désignation..."
    value={filterDesignation}
    onChange={(e) => setFilterDesignation(e.target.value)}
    className="filter-input"
  />

  <select
    value={filterLigne}
    onChange={(e) => setFilterLigne(e.target.value)}
    className="filter-select"
  >
    <option value="">Toutes les lignes</option>

    {lignes.map((ligne) => (
      <option key={ligne._id} value={ligne._id}>
        {ligne.nom}
      </option>
    ))}
  </select>
</div>




      {/* LISTE */}
      <div className="equipement-list">
        {equipements.length === 0 ? (
          <p>Aucun équipement enregistré.</p>
        ) : (
          <ul>
            {filteredEquipements.map((eq) => (
              <li key={eq._id}>
                {editId === eq._id ? (
                  <>
                    <input
                      type="text"
                      value={editData.designation}
                      onChange={(e) =>
                        setEditData({ ...editData, designation: e.target.value })
                      }
                      className="edit-input"
                    />

                    <input
                      type="text"
                      value={editData.code}
                      onChange={(e) =>
                        setEditData({ ...editData, code: e.target.value })
                      }
                      className="edit-input"
                    />

                    {/* MULTI SELECT */}
                    <select
                      multiple
                      value={editData.ligne}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          ligne: Array.from(
                            e.target.selectedOptions,
                            (o) => o.value
                          ),
                        })
                      }
                    >
                      {lignes.map((ligne) => (
                        <option key={ligne._id} value={ligne._id}>
                          {ligne.nom}
                        </option>
                      ))}
                    </select>

                    <div className="edit-actions">
                      <button
                        onClick={() => handleSaveEdit(eq._id)}
                        className="save-btn"
                      >
                        <FaSave />
                      </button>

                      <button
                        onClick={handleCancelEdit}
                        className="cancel-btn"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>

  <strong>{eq.designation}</strong> — {eq.code}
  <br />
  <em>
    (
    {eq.ligne && eq.ligne.length > 0
      ? eq.ligne.map((l) => l.nom).join(", ")
      : "Aucune ligne"}
    )
  </em>
  <br />
  <small className="last-compteur">
  ⏱ Dernier compteur :
  <strong> {eq.dernierCompteur}</strong> h
</small>
</span>


                    <div className="edit-actions">
                      <button
                        onClick={() => handleEdit(eq)}
                        className="edit-btn"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => handleDelete(eq._id)}
                        className="delete-btn"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ToastContainer position="bottom-right" autoClose={2500} />
    </div>
  );
}
