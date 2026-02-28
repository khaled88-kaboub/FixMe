import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTools } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./InterventionReceptionProduction.css";

const InterventionReceptionProduction = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [interventions, setInterventions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // filtres
  const [filters, setFilters] = useState({
    ligne: "",
    equipement: "",
    numero: "",
    dateDebut: "",
    dateFin: "",
  });
  const toLocalInputValue = (dateString) => {
  if (!dateString) return "";
  // بدلاً من تحويله لـ Date object، سنتعامل معه كنص مباشرة
  // التاريخ القادم يكون عادة: 2024-05-20T14:30:00.000Z
  // وحقل datetime-local يحتاج: 2024-05-20T14:30
  return dateString.slice(0, 16); 
};
  
  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/interventions`);
        const onlyActive = res.data.filter(
          (i) => i.statut === "ouvert" || i.statut === "en_cours"
        );
  
        setInterventions(onlyActive);
        setFiltered(onlyActive);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des interventions");
      } finally {
        setLoading(false);
      }
    };
    fetchInterventions();
  }, []);

  // 🔍 Filtrage avancé local
  useEffect(() => {
    let result = interventions;

    if (filters.ligne)
      result = result.filter((i) =>
        i.ligne?.nom?.toLowerCase().includes(filters.ligne.toLowerCase())
      );

    if (filters.equipement)
      result = result.filter((i) =>
        i.equipement?.designation
          ?.toLowerCase()
          .includes(filters.equipement.toLowerCase())
      );

    if (filters.numero)
      result = result.filter((i) =>
        i.numero?.toString().includes(filters.numero)
      );

    if (filters.dateDebut && filters.dateFin)
      result = result.filter((i) => {
        const date = new Date(i.createdAt);
        return (
          date >= new Date(filters.dateDebut) &&
          date <= new Date(filters.dateFin)
        );
      });

    setFiltered(result);
  }, [filters, interventions]);

  // Ouvrir la modale
  const openModal = (item) => {
    setSelected({
      ...item,
      dateHeureDemarrageLigne: toLocalInputValue(item.dateHeureDemarrageLigne),
      dateHeureDemarrageEquipement: toLocalInputValue(item.dateHeureDemarrageEquipement),
      dateHeureArretLigne: toLocalInputValue(item.dateHeureArretLigne),
      dateHeureArretEquipement: toLocalInputValue(item.dateHeureArretEquipement)
    });
  };
  

  // Gérer la mise à jour backend
  const handleReception = async () => {
    try {
      await axios.put(`${API_URL}/api/interventions/${selected._id}`, {
        receptionProduction: true,
        ligneAdemarre: selected.ligneAdemarre,
        equipementAdemarre: selected.equipementAdemarre,
        dateHeureDemarrageLigne: selected.dateHeureDemarrageLigne || null,
        dateHeureDemarrageEquipement: selected.dateHeureDemarrageEquipement || null,
        dateHeureArretLigne: selected.dateHeureArretLigne || null,
        dateHeureArretEquipement: selected.dateHeureArretEquipement || null,
      });

      toast.success("Intervention réceptionnée avec succès ✅");
      setInterventions((prev) =>
        prev.map((i) =>
          i._id === selected._id ? { ...i, ...selected, receptionProduction: true } : i
        )
      );
      setSelected(null);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading) return <p className="loading-text">Chargement...</p>;
   console.log("valeur de selected:", selected)
  return (
    <div className="reception-page">
      <h2 className="titrex"><FaTools /> Réception des demandes d'interventions</h2>
      <div className="section1-underline1"></div>
      {/* 🔍 Filtres avancés */}
      <div className="advanced-filters">
        <input
          type="text"
          placeholder="Filtrer par ligne"
          value={filters.ligne}
          onChange={(e) => setFilters({ ...filters, ligne: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filtrer par équipement"
          value={filters.equipement}
          onChange={(e) => setFilters({ ...filters, equipement: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filtrer par numéro"
          value={filters.numero}
          onChange={(e) => setFilters({ ...filters, numero: e.target.value })}
        />
        <div className="date-range">
          <label>De :</label>
          <input
            type="date"
            value={filters.dateDebut}
            onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
          />
          <label>À :</label>
          <input
            type="date"
            value={filters.dateFin}
            onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
          />
        </div>
      </div>

      {/* 🧾 Tableau */}
      <table className="reception-table">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Ligne</th>
            <th>Équipement</th>
            <th>Date/Heure arrêt ligne</th>
            <th>Date/Heure redémarrage ligne</th>
            <th>Date/Heure arrêt équipement</th>
            <th>Date/Heure redémarrage équipement</th>
            <th>Statut</th>
            <th>Réception</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ textAlign: "center" }}>
                Aucune intervention trouvée.
              </td>
            </tr>
          ) : (
            filtered.map((i) => (
              <tr key={i._id}>
                <td data-label="Numéro DI">{i.numero}</td>
                <td data-label="Ligne">{i.ligne?.nom || "-"}</td>
                <td data-label="Equipement">{i.equipement?.designation || "-"}</td>
                <td data-label="Date & Heure arret Ligne">{i.dateHeureArretLigne ? i.dateHeureArretLigne.replace('T', ' ').slice(0, 16) : "-"}</td>
                <td data-label = "Date & Heure démarrage Ligne">{i.dateHeureDemarrageLigne ? i.dateHeureDemarrageLigne.replace('T', ' ').slice(0, 16) : "-"}</td>
                <td data-label = "Date & Heure arret Equipement">{i.dateHeureArretEquipement ? i.dateHeureArretEquipement.replace('T', ' ').slice(0, 16) : "-"}</td>
                <td data-label = "Date & Heure démarrage Equipement">{i.dateHeureDemarrageEquipement ? i.dateHeureDemarrageEquipement.replace('T', ' ').slice(0, 16) : "-"}</td>
                
                <td data-label="Statut">{i.statut}</td>
                <td data-label="Etat de reception">
                  {i.receptionProduction ? (
                    <span className="badge green">Réceptionnée</span>
                  ) : (
                    <span className="badge red">Non réceptionnée</span>
                  )}
                </td>
                <td>
                  <button className="btn-primary" onClick={() =>{console.log(i); openModal(i)}}>
                    Réceptionner
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 🪟 Modale */}
      {selected && (
        <div className="modalo-overlayo" onClick={() => setSelected(null)}>
          <div className="modalo-contento" onClick={(e) => e.stopPropagation()}>
            <h2>Réception intervention {selected.numero}</h2>
            <p><strong>Ligne :</strong> {selected.ligne?.nom || "-"}</p>
            <p><strong>Équipement :</strong> {selected.equipement?.designation || "-"}</p>
            <p><strong>Description de l'anomalie: :</strong> {selected.descriptionAnomalie || "-"}</p>
            <p><strong>Demandeur: :</strong> {selected.demandeurNom || "-"}</p>
            <hr />

            {/* 🔹 Ligne */}
            <p>     
            <strong>Date/heure arrêt ligne :</strong> 
            {selected.dateHeureArretLigne ? selected.dateHeureArretLigne.replace('T', ' ').slice(0, 16) : "-"}
            </p>

            {/*{selected.ligneAsubiArret && (*/}
              
                <label>
                  Ligne redémarrée :
                  <input
                    type="checkbox"
                    checked={selected.ligneAdemarre || false}
                    onChange={(e) =>
                      setSelected({ ...selected, ligneAdemarre: e.target.checked })
                    }
                  />
                </label>
                {selected.ligneAdemarre && (
                  <label>
                    Date/heure démarrage ligne :
                    <input
                      type="datetime-local"
                      value={selected.dateHeureDemarrageLigne}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          dateHeureDemarrageLigne: e.target.value,
                        })
                      }
                    />
                  </label>
                )}
              
           {/* )}*/}

            {/* 🔹 Équipement */}

            <p>     
            <strong>Date/heure arrêt équipement :</strong> 
            {selected.dateHeureArretEquipement ? selected.dateHeureArretEquipement.replace('T', ' ').slice(0, 16) : "-"}
            </p>
            
           

            {/*{selected.equipementAsubiArret && (*/}
              
                <label>
                  Équipement redémarré :
                  <input
                    type="checkbox"
                    checked={selected.equipementAdemarre || false}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        equipementAdemarre: e.target.checked,
                      })
                    }
                  />
                </label>
                {selected.equipementAdemarre && (
                  <label>
                    Date/heure démarrage équipement :
                    <input
                      type="datetime-local"
                      value={selected.dateHeureDemarrageEquipement}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          dateHeureDemarrageEquipement: e.target.value,
                        })
                      }
                    />
                  </label>
                )}
              
           {/* )}*/}

            <button className="btn-success" onClick={handleReception}>
              Confirmer la réception
            </button>
            <button className="btn-close" onClick={() => setSelected(null)}>
              Annuler
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default InterventionReceptionProduction;