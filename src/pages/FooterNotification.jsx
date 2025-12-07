import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "./FooterNotification.css";
import { FaPlay, FaSpinner, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const socket = io("http://localhost:5000");

export default function FooterNotification() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [stats, setStats] = useState({
    ouvert: 0,
    en_cours: 0,
    termine: 0,
    annule: 0,
  });

  const calculerStats = (data) => {
    const counts = {
      ouvert: data.filter((i) => i.statut === "ouvert").length,
      en_cours: data.filter((i) => i.statut === "en_cours").length,
      termine: data.filter((i) => i.statut === "termine").length,
      annule: data.filter((i) => i.statut === "annule").length,
    };
    setStats(counts);
  };

  useEffect(() => {
    // Initialisation : récupération initiale
    const fetchData = async () => {
      const res = await axios.get(`${API_URL}/api/interventions`);
      calculerStats(res.data);
    };
    fetchData();

    // ⚡ Réception en temps réel
    socket.on("interventionsUpdate", (data) => {
      calculerStats(data);
    });

    return () => {
      socket.off("interventionsUpdate");
    };
  }, []);

  return (
    <footer className="footer-stats">
      <div className="footer-item ouvert">
        <FaPlay />
        <span>Ouvert : {stats.ouvert}</span>
      </div>

      <div className="footer-item en_cours">
        <FaSpinner className="spin" />
        <span>En cours : {stats.en_cours}</span>
      </div>

      <div className="footer-item termine">
        <FaCheckCircle />
        <span>Terminé : {stats.termine}</span>
      </div>

      <div className="footer-item annule">
        <FaTimesCircle />
        <span>Annulé : {stats.annule}</span>
      </div>
    </footer>
  );
}
