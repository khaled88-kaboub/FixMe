import { useEffect, useState } from "react";
import axios from "axios";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import "./MaintenancePreventiveCalendar.css";

export default function MaintenancePreventiveCalendar() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  // Fonction pour colorer selon le statut
  const getColor = (statut) => {
    statut = (statut || "").toLowerCase().trim();
    if (statut.includes("attente") || statut.includes("planifiee")) return "#3b82f6";   // bleu
    if (statut.includes("retard")) return "#dc2626";                               // rouge
    if (statut.includes("en_cours")) return "#f59e0b";                                // orange
    if (statut.includes("terminee")) return "#16a34a";                                 // vert
    if (statut.includes("annulee")) return "#6b7280";                                // gris
    return "#94a3b8";                                                              // défaut
  };
 
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/maintenance-preventive/calendar`);

        const calendarEvents = res.data.map((ev, index) => {
          console.log("EV Statut =", ev.statut); // ← Vérifie le statut reçu

          return {
            ...ev,
            id: ev._id + "_" + index, // id unique FullCalendar
            start: new Date(ev.start),
            end: new Date(ev.end),
            allDay: true,
            title: `${ev.title}\nLigne: ${ev.ligne?.nom || "-"}\nÉquipement: ${ev.equipement?.designation || "-"}\nStatut: ${ev.statut || "-"}`,
            extendedProps: {
              statut: ev.statut,
              ligne: ev.ligne?.nom,
              equipement: ev.equipement?.designation,
            },
          };
        });

        setEvents(calendarEvents);
      } catch (err) {
        console.error("Erreur chargement calendrier :", err);
      }
    };

    loadData();
  }, []);

  return (
    <div className="calendar-page">
      <h2 className="calendar-title">📅 Calendrier des Maintenances Préventives</h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="fr"
        height="85vh"
        events={events}
        eventClick={(info) => navigate(`/maintenance-preventive/${info.event.id.split("_")[0]}`)}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}

        // Custom rendering pour titres multi-lignes
        eventContent={(arg) => (
          <div style={{ whiteSpace: "pre-line", fontSize: "0.85em" }}>
            {arg.event.title}
          </div>
        )}

        // Applique la couleur des événements
        eventDidMount={(info) => {
          const color = getColor(info.event.extendedProps.statut);
          info.el.style.backgroundColor = color;
          info.el.style.color = "white";
          info.el.style.borderRadius = "6px";
          info.el.style.padding = "2px 4px";
        }}
      />
    </div>
  );
}
