import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TimelineAnnuelle.css";

export default function TimelineAnnuelle() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [mpList, setMpList] = useState([]);
  const navigate = useNavigate();

  const year = new Date().getFullYear();
  const months = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];

  // Couleur selon statut
  const getColor = (statut) => {
    switch(statut) {
      case "planifiee": return "#3b82f6";
      case "en_cours": return "#f59e0b";
      case "terminee": return "#16a34a";
      case "retard": return "#dc2626";
      case "annulee": return "#6b7280";
      default: return "#94a3b8";
    }
  };

  // Génère toutes les occurrences pour une maintenance
  const generateOccurrences = (mp, monthsAhead = 12) => {
    const events = [];
    if (!mp.dateDebut) return events;

    let current = new Date(mp.dateDebut);

    for (let i = 0; i < monthsAhead; i++) {
      events.push({
        ...mp,
        date: new Date(current),
        monthIndex: current.getMonth()
      });

      // Calcul date suivante
      switch (mp.frequence) {
        case "jour":
          current.setDate(current.getDate() + (mp.intervalle || 1));
          break;
        case "semaine":
          current.setDate(current.getDate() + 7 * (mp.intervalle || 1));
          break;
        case "mois":
          current.setMonth(current.getMonth() + (mp.intervalle || 1));
          break;
        case "annee":
          current.setFullYear(current.getFullYear() + (mp.intervalle || 1));
          break;
        case "fixe":
        default:
          i = monthsAhead; // Stop loop si événement unique
          break;
      }
    }

    return events;
  };

  useEffect(() => {
    const fetchMP = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/maintenance-preventive`);
        let list = [];
        res.data.forEach(mp => {
          const occurrences = generateOccurrences(mp, 12); // max 12 occurrences/an
          list = [...list, ...occurrences];
        });
        setMpList(list);
      } catch (err) {
        console.error("Erreur chargement timeline :", err);
      }
    };

    fetchMP();
  }, []);

  return (
    <div className="timeline-container">
      <h2 className="timeline-title">📆 Timeline Annuelle — {year}</h2>

      <div className="timeline-grid">
        {/* Ligne des mois */}
        <div className="timeline-header">
          {months.map((m, i) => (
            <div key={i} className="timeline-month">{m}</div>
          ))}
        </div>

        {/* Événements par ligne + équipement */}
        <div className="timeline-rows">
          {mpList.map((mp, idx) => (
            <div className="timeline-row" key={mp._id + "_" + idx}>
              <div className="timeline-info">
                <span className="timeline-ligne">{mp.ligne?.nom || "—"}</span> &gt;{" "}
                <span className="timeline-equipement">{mp.equipement?.designation || "—"}</span>
              </div>

              <div
                className="timeline-event"
                style={{
                  gridColumnStart: mp.monthIndex + 1,
                  backgroundColor: getColor(mp.statut)
                }}
                onClick={() => navigate(`/maintenance-preventive/${mp._id}`)}
                title={`${mp.titre} — ${new Date(mp.date).toLocaleDateString()}`}
              >
                {mp.titre}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
