import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MaintenancePreventiveCalendar2.css"; // tu peux créer un fichier CSS ou utiliser le style fourni plus bas
import * as XLSX from 'xlsx'; // Importez la bibliothèque en haut


export default function MaintenancePreventiveCalendar2() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [interventions, setInterventions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  const statusColors = {
    planifiee: "#2563eb",  // bleu
    en_cours: "#f97316",   // orange
    terminee: "#10b981",   // vert
    retard: "#ef4444",     // rouge
    annulee: "#6b7280"     // gris
  };

  // Charger interventions
  useEffect(() => {
    axios.get(`${API_URL}/api/interventionP`)
      .then(res => setInterventions(res.data))
      .catch(err => console.error("Erreur fetch interventions :", err));
  }, []);

  // Générer les jours du mois
  const getCalendarDays = () => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Cases vides avant le 1 du mois
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Jours du mois
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const calendarDays = getCalendarDays();


 
// ... dans votre composant MaintenancePreventiveCalendar2 ...

const exportToExcel = () => {
  // 1. Filtrer les interventions du mois actuellement affiché
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const dataToExport = interventions.filter(inter => {
    const d = new Date(inter.datePlanifiee);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  if (dataToExport.length === 0) {
    alert("Aucune donnée à exporter pour ce mois.");
    return;
  }

  // 2. Formater les données pour le tableau Excel
  const formattedData = dataToExport.map(inter => ({
    "N° Intervention": inter.numero,
    "Titre": inter.titre,
    "Type": inter.type,
    "Date Planifiée": new Date(inter.datePlanifiee).toLocaleDateString('fr-FR'),
    "Statut": inter.statut.replace("_", " "),
    "Durée Réelle (min)": inter.dureeReelle || "N/A",
    "Commentaire": inter.commentaire || ""
  }));

  // 3. Création du fichier Excel
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Maintenance");

  // 4. Téléchargement
  const fileName = `Maintenance_${month + 1}_${year}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
  return (
    <div className="calendar-container">
      <h2 className="calendar-title">
        {currentDate.toLocaleString("fr-FR", { month: "long", year: "numeric" })}
      </h2>
{/*
      <div className="calendar-controls">
        <button onClick={prevMonth}>◀</button>
        <button onClick={nextMonth}>▶</button>
      </div>
 */}

{/* ... reste du code au dessus ... */}

<div className="calendar-controls">
  <button onClick={prevMonth}>◀</button>
  <button onClick={nextMonth}>▶</button>
  
  {/* Bouton d'extraction */}
  <button onClick={exportToExcel} className="btn-export">
    📥 Exporter le mois (.xlsx)
  </button>
</div>

      {/* AJOUT DE LA LÉGENDE ICI */}
      <div className="calendar-legend">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="legend-item">
            <span 
              className="legend-dot" 
              style={{ backgroundColor: color }}
            ></span>
            <span className="legend-text">
              {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
            </span>
          </div>
        ))}
      </div>

     
        {/* ... reste du code (jours et événements) ... */}


      <div className="calendar-grid">
        {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((d) => (
          <div key={d} className="day-header">{d}</div>
        ))}

        {calendarDays.map((day, index) => {
          if (day === null)
            return <div key={index} className="day-cell empty"></div>;

          const todaysEvents = interventions.filter(ev =>
            new Date(ev.datePlanifiee).toDateString() === day.toDateString()
          );

          return (
            <div key={index} className="day-cell">
              <div className="day-number">{day.getDate()}</div>

              <div className="event-list">
               {todaysEvents.map(ev => (
  <div
    key={ev._id}
    className="event-item"
    style={{ backgroundColor: statusColors[ev.statut]   } }
    title={`${ev.titre}  (${ev.statut.replace("_", " ")})`}
    onClick={() => navigate(`interventionP/${ev._id}`)} // <--- redirection
  >
    {ev.titre} ({ev.statut.replace("_", " ")})
  </div>
))}

              </div>
            </div>
          );
        })}
      </div>

      
    </div>
  );
}
