import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "./Arret.css";

const Arret = () => {
  const [interventions, setInterventions] = useState([]);
  const [lignes, setLignes] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [filters, setFilters] = useState({
    ligne: "",
    equipement: "",
    startDate: "",
    endDate: "",
  });

  // ⚙️ Exclure week-end (vendredi 06h → dimanche 06h)
  const calculerDureeMinutesSansWeekend = (debut, fin) => {
    if (!debut || !fin) return null;
    let start = new Date(debut);
    let end = new Date(fin);
    if (end <= start) return 0;

    let totalMinutes = 0;
    let current = new Date(start);

    while (current < end) {
      const jour = current.getDay();
      const heure = current.getHours();
      const isWeekend =
        (jour === 5 && heure >= 6) || jour === 6 || (jour === 0 && heure < 6);
      if (!isWeekend) totalMinutes++;
      current.setMinutes(current.getMinutes() + 1);
    }

    return totalMinutes;
  };

  // 🔄 Récupération données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [intvRes, lignesRes, eqRes] = await Promise.all([
          axios.get("http://localhost:5000/api/interventions"),
          axios.get("http://localhost:5000/api/lignes"),
          axios.get("http://localhost:5000/api/equipements"),
        ]);
        setInterventions(intvRes.data);
        setLignes(lignesRes.data);
        setEquipements(eqRes.data);
      } catch (err) {
        console.error("Erreur récupération données :", err);
      }
    };
    fetchData();
  }, []);

  // 🧩 Filtres
  const filteredInterventions = interventions
    .filter((intv) => {
      const matchLigne = !filters.ligne || intv.ligne?._id === filters.ligne;
      const matchEquip =
        !filters.equipement || intv.equipement?._id === filters.equipement;
      const matchDate =
        (!filters.startDate || new Date(intv.createdAt) >= new Date(filters.startDate)) &&
        (!filters.endDate || new Date(intv.createdAt) <= new Date(filters.endDate));
      return matchLigne && matchEquip && matchDate;
    })
    .sort((a, b) => new Date(a.dateHeureArretLigne) - new Date(b.dateHeureArretLigne));

  // 🧮 Calcul total, MTTR, MTBF
  let totalLigne = 0,
    totalEquip = 0,
    countLigne = 0,
    countEquip = 0;

  filteredInterventions.forEach((intv) => {
    if (intv.ligneAsubiArret && intv.ligneAdemarre) {
      const d = calculerDureeMinutesSansWeekend(
        intv.dateHeureArretLigne,
        intv.dateHeureDemarrageLigne
      );
      if (d > 0) {
        totalLigne += d;
        countLigne++;
      }
    }

    if (intv.equipementAsubiArret && intv.equipementAdemarre) {
      const d = calculerDureeMinutesSansWeekend(
        intv.dateHeureArretEquipement,
        intv.dateHeureDemarrageEquipement
      );
      if (d > 0) {
        totalEquip += d;
        countEquip++;
      }
    }
  });

  const MTTRLigne = countLigne > 0 ? totalLigne / countLigne : 0;
  const MTTREquip = countEquip > 0 ? totalEquip / countEquip : 0;

  // 🕓 MTBF
  let mtbfLigne = 0,
    mtbfEquip = 0;

  if (filteredInterventions.length > 1) {
    const ligneDelays = [];
    const equipDelays = [];

    for (let i = 1; i < filteredInterventions.length; i++) {
      const prev = filteredInterventions[i - 1];
      const curr = filteredInterventions[i];

      if (prev.ligneAdemarre && curr.ligneAsubiArret) {
        const diff =
          (new Date(curr.dateHeureArretLigne) - new Date(prev.dateHeureDemarrageLigne)) /
          60000;
        if (diff > 0) ligneDelays.push(diff);
      }

      if (prev.equipementAdemarre && curr.equipementAsubiArret) {
        const diff =
          (new Date(curr.dateHeureArretEquipement) - new Date(prev.dateHeureDemarrageEquipement)) /
          60000;
        if (diff > 0) equipDelays.push(diff);
      }
    }

    if (ligneDelays.length > 0)
      mtbfLigne = ligneDelays.reduce((a, b) => a + b, 0) / ligneDelays.length;
    if (equipDelays.length > 0)
      mtbfEquip = equipDelays.reduce((a, b) => a + b, 0) / equipDelays.length;
  }

  // 📊 Tableau résumé par ligne
  const groupedByLigneMois = {};
  filteredInterventions.forEach((intv) => {
    if (!intv.ligne?._id) return;
    const date = new Date(intv.createdAt);
    const mois = date.toLocaleString("fr-FR", { month: "short", year: "numeric" });
    const ligneNom = intv.ligne.nom || "Inconnue";

    if (!groupedByLigneMois[ligneNom]) groupedByLigneMois[ligneNom] = {};
    if (!groupedByLigneMois[ligneNom][mois])
      groupedByLigneMois[ligneNom][mois] = { mttr: 0, mtbf: 0, count: 0 };

    const duree =
      intv.ligneAsubiArret && intv.ligneAdemarre
        ? calculerDureeMinutesSansWeekend(intv.dateHeureArretLigne, intv.dateHeureDemarrageLigne)
        : 0;
    if (duree > 0) {
      groupedByLigneMois[ligneNom][mois].mttr += duree;
      groupedByLigneMois[ligneNom][mois].count++;
    }
  });

  // --- Résumé par ligne
  const summaryByLine = Object.keys(groupedByLigneMois).map((ligne) => {
    let total = 0,
      count = 0;
    const intervLigne = filteredInterventions.filter((i) => i.ligne?.nom === ligne);
    intervLigne.forEach((i) => {
      if (i.ligneAsubiArret && i.ligneAdemarre) {
        const duree = calculerDureeMinutesSansWeekend(
          i.dateHeureArretLigne,
          i.dateHeureDemarrageLigne
        );
        if (duree > 0) {
          total += duree;
          count++;
        }
      }
    });

    const mttr = count > 0 ? total / count : 0;

    let delays = [];
    const sorted = intervLigne.sort(
      (a, b) => new Date(a.dateHeureArretLigne) - new Date(b.dateHeureArretLigne)
    );
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (prev.ligneAdemarre && curr.ligneAsubiArret) {
        const diff =
          (new Date(curr.dateHeureArretLigne) - new Date(prev.dateHeureDemarrageLigne)) / 60000;
        if (diff > 0) delays.push(diff);
      }
    }
    const mtbf = delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;

    const dispo = mtbf + mttr > 0 ? ((mtbf / (mtbf + mttr)) * 100).toFixed(1) : 0;

    return { ligne, count, total, mttr: mttr.toFixed(1), mtbf: mtbf.toFixed(1), dispo };
  });

  // --- Export PDF / Excel ---
  const exportSummaryPDF = () => {
    const doc = new jsPDF();
    doc.text("Résumé par ligne", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Ligne","Nombre d'arrêts","Total arrêt (min)","MTTR (min)","MTBF (min)","Disponibilité (%)"]],
      body: summaryByLine.map((i) => [i.ligne, i.count, i.total, i.mttr, i.mtbf, i.dispo]),
    });
    
    doc.save("Resume_Lignes.pdf");
  };

  const exportSummaryExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      summaryByLine.map((i) => ({
        Ligne: i.ligne,
        "Nombre d'arrêts": i.count,
        "Total arrêt (min)": i.total,
        "MTTR (min)": i.mttr,
        "MTBF (min)": i.mtbf,
        "Disponibilité (%)": i.dispo,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Résumé Lignes");
    XLSX.writeFile(wb, "Resume_Lignes.xlsx");
  };

  // --- Graphique histogramme MTTR/MTBF par ligne ---
  const moisLabels = Array.from(
    new Set(
      filteredInterventions.map((i) =>
        new Date(i.createdAt).toLocaleString("fr-FR", { month: "short", year: "numeric" })
      )
    )
  ).sort((a, b) => new Date(a) - new Date(b));

  const mttrChartData = moisLabels.map((mois) => {
    const data = { mois };
    Object.keys(groupedByLigneMois).forEach((ligne) => {
      const obj = groupedByLigneMois[ligne][mois];
      data[ligne] = obj && obj.count > 0 ? (obj.mttr / obj.count).toFixed(1) : 0;
    });
    return data;
  });

  const mtbfChartData = moisLabels.map((mois) => {
    const data = { mois };
    Object.keys(groupedByLigneMois).forEach((ligne) => {
      const intervLigne = filteredInterventions.filter((i) => i.ligne?.nom === ligne);
      const sorted = intervLigne.sort((a,b)=>new Date(a.dateHeureArretLigne)-new Date(b.dateHeureArretLigne));
      let delays = [];
      for(let i=1;i<sorted.length;i++){
        const prev = sorted[i-1];
        const curr = sorted[i];
        if(prev.ligneAdemarre && curr.ligneAsubiArret){
          const diff=(new Date(curr.dateHeureArretLigne)-new Date(prev.dateHeureDemarrageLigne))/60000;
          if(diff>0) delays.push(diff);
        }
      }
      const mtbf = delays.length>0 ? delays.reduce((a,b)=>a+b,0)/delays.length : 0;
      data[ligne] = mtbf.toFixed(1);
    });
    return data;
  });

  return (
    <div className="maintenance-grid">
      <h2>📊 Analyse & KPI</h2>

      {/* FILTRES */}
      <div className="filters">
        <select
          value={filters.ligne}
          onChange={(e) => setFilters({ ...filters, ligne: e.target.value })}
        >
          <option value="">Toutes les lignes</option>
          {lignes.map((l) => (
            <option key={l._id} value={l._id}>{l.nom}</option>
          ))}
        </select>

        <select
          value={filters.equipement}
          onChange={(e) => setFilters({ ...filters, equipement: e.target.value })}
        >
          <option value="">Tous les équipements</option>
          {equipements.map((eq) => (
            <option key={eq._id} value={eq._id}>{eq.designation || eq.code}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
      </div>

      {/* TABLEAU DÉTAILLÉ */}
      <table className="intervention-table">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Ligne</th>
            <th>Équipement</th>
            <th>Description</th>
            <th>Durée arrêt ligne</th>
            <th>Durée arrêt équipement</th>
          </tr>
        </thead>
        <tbody>
          {filteredInterventions.map((intv) => {
            const dureeLigne =
              intv.ligneAsubiArret && intv.ligneAdemarre
                ? calculerDureeMinutesSansWeekend(intv.dateHeureArretLigne,intv.dateHeureDemarrageLigne)
                : 0;
            const dureeEquip =
              intv.equipementAsubiArret && intv.equipementAdemarre
                ? calculerDureeMinutesSansWeekend(intv.dateHeureArretEquipement,intv.dateHeureDemarrageEquipement)
                : 0;

            return (
              <tr key={intv._id}>
                <td>{intv.numero}</td>
                <td>{intv.ligne?.nom || "—"}</td>
                <td>{intv.equipement?.designation || intv.equipement?.code || "—"}</td>
                <td>{intv.descriptionAnomalie}</td>
                <td>{dureeLigne ? `${dureeLigne} min` : "—"}</td>
                <td>{dureeEquip ? `${dureeEquip} min` : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* KPI GÉNÉRAUX */}
      <div className="totaux-grid">
  <div className="total-card ligne">
    <div className="card-icon">🕒</div>
    <div className="card-value">{totalLigne} min</div>
    <div className="card-label"><strong>Total arrêt ligne</strong></div>
    <div className="card-details">
      🔁 {countLigne} arrêts<br />
      ⚙️ MTTR: {MTTRLigne.toFixed(1)} min<br />
      ⏱️ MTBF: {mtbfLigne.toFixed(1)} min
    </div>
  </div>

  <div className="total-card equip">
    <div className="card-icon">🕒</div>
    <div className="card-value">{totalEquip} min</div>
    <div className="card-label"><strong>Total arrêt équipement</strong></div>
    <div className="card-details">
      🔁 {countEquip} arrêts<br />
      ⚙️ MTTR: {MTTREquip.toFixed(1)} min<br />
      ⏱️ MTBF: {mtbfEquip.toFixed(1)} min
    </div>
  </div>
</div>


      {/* GRAPHIQUES HISTOGRAMME MTTR */}
      <h3 style={{ marginTop: "30px" }}>Histogramme MTTR par ligne</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={mttrChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mois" />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(groupedByLigneMois).map((ligne, index) => (
            <Bar
              key={ligne}
              dataKey={ligne}
              fill={["#e53935", "#1e88e5", "#43a047", "#fbc02d", "#8e24aa"][index % 5]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* GRAPHIQUE HISTOGRAMME MTBF */}
      <h3 style={{ marginTop: "30px" }}>Histogramme MTBF par ligne</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={mtbfChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mois" />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(groupedByLigneMois).map((ligne, index) => (
            <Bar
              key={ligne}
              dataKey={ligne}
              fill={["#ff9800", "#9c27b0", "#03a9f4", "#4caf50", "#f44336"][index % 5]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* TABLEAU RÉSUMÉ PAR LIGNE */}
      <h3 style={{ marginTop: "40px" }}>📋 Tableau résumé par ligne</h3>
      <div style={{ marginBottom: "15px" }}>
        <button onClick={exportSummaryExcel}>📥 Export Excel</button>
        <button onClick={exportSummaryPDF} style={{ marginLeft: "10px" }}>📄 Export PDF</button>
      </div>

      <table className="intervention-table">
        <thead>
          <tr>
            <th>Ligne</th>
            <th>Nombre d'arrêts</th>
            <th>Total arrêt (min)</th>
            <th>MTTR (min)</th>
            <th>MTBF (min)</th>
            <th>Disponibilité (%)</th>
          </tr>
        </thead>
        <tbody>
          {summaryByLine.map((i) => (
            <tr key={i.ligne}>
              <td>{i.ligne}</td>
              <td>{i.count}</td>
              <td>{i.total}</td>
              <td>{i.mttr}</td>
              <td>{i.mtbf}</td>
              <td>{i.dispo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Arret;


