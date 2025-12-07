import { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
//import "./MaintenancePreventiveCalendar.css";

export default function MaintenancePreventiveGantt() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/maintenance-preventive/calendar`
        );

        // Transformation pour FullCalendar
        const calendarEvents = [];

        res.data.forEach((ev, index) => {
          // On concatène MP + Ligne pour créer "la ligne"
          const lineLabel = `${ev.title} — ${ev.equipement || ev.ligne || ""}`;

          calendarEvents.push({
            id: ev.id,
            title: lineLabel,
            start: new Date(ev.start),
            end: new Date(ev.end),
            allDay: true,
            backgroundColor:
              ev.statut === "planifiee"
                ? "#3b82f6"
                : ev.statut === "retard"
                ? "#dc2626"
                : ev.statut === "en_cours"
                ? "#f59e0b"
                : ev.statut === "terminée"
                ? "#16a34a"
                : "#6b7280",
            borderColor: "transparent",
            groupId: ev.id.split("_")[0], // groupe par MP
          });
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
      <h2 className="calendar-title">📊 Gantt Annuelle des Maintenances Préventives</h2>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridYear" // FullCalendar v6 permet dayGridYear si activé
        height="85vh"
        events={events}
        eventClick={(info) =>
          navigate(`/maintenance-preventive/${info.event.id.split("_")[0]}`)
        }
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
      />
    </div>
  );
}

