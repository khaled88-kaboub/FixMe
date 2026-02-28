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

const Arret2 = () => {
  const API_URL = import.meta.env.VITE_API_URL;
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
          axios.get(`${API_URL}/api/interventions`),
          axios.get(`${API_URL}/api/lignes`),
          axios.get(`${API_URL}/api/equipements`),
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

  // 🧮 Calculs globaux
  let totalLigne = 0, totalEquip = 0, countLigne = 0, countEquip = 0;
  filteredInterventions.forEach((intv) => {
    if (intv.ligneAsubiArret && intv.ligneAdemarre) {
      const d = calculerDureeMinutesSansWeekend(intv.dateHeureArretLigne, intv.dateHeureDemarrageLigne);
      if (d > 0) { totalLigne += d; countLigne++; }
    }
    if (intv.equipementAsubiArret && intv.equipementAdemarre) {
      const d = calculerDureeMinutesSansWeekend(intv.dateHeureArretEquipement, intv.dateHeureDemarrageEquipement);
      if (d > 0) { totalEquip += d; countEquip++; }
    }
  });

  const MTTRLigne = countLigne > 0 ? totalLigne / countLigne : 0;
  const MTTREquip = countEquip > 0 ? totalEquip / countEquip : 0;

  // 🕓 MTBF calcul
  let mtbfLigne = 0;
  if (filteredInterventions.length > 1) {
    const ligneDelays = [];
    for (let i = 1; i < filteredInterventions.length; i++) {
      const prev = filteredInterventions[i - 1];
      const curr = filteredInterventions[i];
      if (prev.ligneAdemarre && curr.ligneAsubiArret) {
        const diff = (new Date(curr.dateHeureArretLigne) - new Date(prev.dateHeureDemarrageLigne)) / 60000;
        if (diff > 0) ligneDelays.push(diff);
      }
    }
    if (ligneDelays.length > 0) mtbfLigne = ligneDelays.reduce((a, b) => a + b, 0) / ligneDelays.length;
  }

  // ==========================================
  // NEW: ANALYSE PAR ÉQUIPEMENT PAR LIGNE
  // ==========================================
  const equipementDataByLigne = {};
  filteredInterventions.forEach((intv) => {
    const ligneNom = intv.ligne?.nom || "Inconnue";
    const eqNom =  intv.equipement?.designation ||  "Sans équipement" ;
    
    const duree = (intv.equipementAsubiArret && intv.equipementAdemarre) 
        ? calculerDureeMinutesSansWeekend(intv.dateHeureArretEquipement, intv.dateHeureDemarrageEquipement) 
        : 0;

    if (!equipementDataByLigne[ligneNom]) equipementDataByLigne[ligneNom] = {};
    if (!equipementDataByLigne[ligneNom][eqNom]) equipementDataByLigne[ligneNom][eqNom] = { count: 0, totalDuree: 0 };
    
    if (duree > 0) {
      equipementDataByLigne[ligneNom][eqNom].count += 1;
      equipementDataByLigne[ligneNom][eqNom].totalDuree += duree;
    }
  });

  // Formatter pour le graphique
  const chartEquipData = Object.keys(equipementDataByLigne).map(ligne => {
    const row = { ligne };
    Object.keys(equipementDataByLigne[ligne]).forEach(eq => {
      row[eq] = equipementDataByLigne[ligne][eq].totalDuree;
    });
    return row;
  });

  const allEquipmentsNames = Array.from(new Set(equipements.map(e => e.designation || e.code)));

  // ==========================================
  // LOGIQUE EXISTANTE (SUMMARY BY LINE)
  // ==========================================
  const groupedByLigneMois = {};
  filteredInterventions.forEach((intv) => {
    if (!intv.ligne?._id) return;
    const date = new Date(intv.createdAt);
    const mois = date.toLocaleString("fr-FR", { month: "short", year: "numeric" });
    const ligneNom = intv.ligne.nom || "Inconnue";
    if (!groupedByLigneMois[ligneNom]) groupedByLigneMois[ligneNom] = {};
    if (!groupedByLigneMois[ligneNom][mois]) groupedByLigneMois[ligneNom][mois] = { mttr: 0, count: 0 };
    const duree = intv.ligneAsubiArret && intv.ligneAdemarre ? calculerDureeMinutesSansWeekend(intv.dateHeureArretLigne, intv.dateHeureDemarrageLigne) : 0;
    if (duree > 0) {
      groupedByLigneMois[ligneNom][mois].mttr += duree;
      groupedByLigneMois[ligneNom][mois].count++;
    }
  });

  const exportSummaryExcel = () => {
    // 1. Préparation des données "Résumé par Ligne" (Feuille 1)
    const dataLignes = summaryByLine.map((i) => ({
      Ligne: i.ligne,
      "Nombre d'arrêts": i.count,
      "Total arrêt (min)": i.total,
      "MTTR (min)": i.mttr,
      "MTBF (min)": i.mtbf,
      "Disponibilité (%)": i.dispo,
    }));

    // 2. Préparation des données "Détails Équipements" (Feuille 2)
    const dataEquipements = [];
    Object.keys(equipementDataByLigne).forEach((ligneNom) => {
      Object.keys(equipementDataByLigne[ligneNom]).forEach((eqNom) => {
        dataEquipements.push({
          Ligne: ligneNom,
          Équipement: eqNom,
          "Nombre d'arrêts": equipementDataByLigne[ligneNom][eqNom].count,
          "Durée Totale (min)": equipementDataByLigne[ligneNom][eqNom].totalDuree,
        });
      });
    });

    // 3. Création du classeur Excel
    const wb = XLSX.utils.book_new();

    // Ajout de la feuille Résumé Lignes
    const wsLignes = XLSX.utils.json_to_sheet(dataLignes);
    XLSX.utils.book_append_sheet(wb, wsLignes, "Résumé Lignes");

    // Ajout de la feuille Détails Équipements
    const wsEquip = XLSX.utils.json_to_sheet(dataEquipements);
    XLSX.utils.book_append_sheet(wb, wsEquip, "Détails Équipements");

    // 4. Téléchargement du fichier
    XLSX.writeFile(wb, "Rapport_Maintenance_Complet.xlsx");
  };

  const summaryByLine = Object.keys(groupedByLigneMois).map((ligne) => {
    let total = 0, count = 0;
    const intervLigne = filteredInterventions.filter((i) => i.ligne?.nom === ligne);
    intervLigne.forEach((i) => {
        if (i.ligneAsubiArret && i.ligneAdemarre) {
            const duree = calculerDureeMinutesSansWeekend(i.dateHeureArretLigne, i.dateHeureDemarrageLigne);
            if (duree > 0) { total += duree; count++; }
        }
    });
    const mttr = count > 0 ? total / count : 0;
    const sorted = intervLigne.sort((a, b) => new Date(a.dateHeureArretLigne) - new Date(b.dateHeureArretLigne));
    let delays = [];
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i-1].ligneAdemarre && sorted[i].ligneAsubiArret) {
            const diff = (new Date(sorted[i].dateHeureArretLigne) - new Date(sorted[i-1].dateHeureDemarrageLigne)) / 60000;
            if (diff > 0) delays.push(diff);
        }
    }
    const mtbf = delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;
    const dispo = mtbf + mttr > 0 ? ((mtbf / (mtbf + mttr)) * 100).toFixed(1) : 0;
    return { ligne, count, total, mttr: mttr.toFixed(1), mtbf: mtbf.toFixed(1), dispo };
  });

  const moisLabels = Array.from(new Set(filteredInterventions.map((i) => new Date(i.createdAt).toLocaleString("fr-FR", { month: "short", year: "numeric" })))).sort((a, b) => new Date(a) - new Date(b));
  const mttrChartData = moisLabels.map((mois) => {
    const data = { mois };
    Object.keys(groupedByLigneMois).forEach((ligne) => {
      const obj = groupedByLigneMois[ligne][mois];
      data[ligne] = obj && obj.count > 0 ? (obj.mttr / obj.count).toFixed(1) : 0;
    });
    return data;
  });

  return (
    <div className="maintenance-grid">
      <h2>📊 Analyse & KPI</h2>

      {/* FILTRES */}
      <div className="filters">
        <select value={filters.ligne} onChange={(e) => setFilters({ ...filters, ligne: e.target.value })}>
          <option value="">Toutes les lignes</option>
          {lignes.map((l) => <option key={l._id} value={l._id}>{l.nom}</option>)}
        </select>
        <select value={filters.equipement} onChange={(e) => setFilters({ ...filters, equipement: e.target.value })}>
          <option value="">Tous les équipements</option>
          {equipements.map((eq) => <option key={eq._id} value={eq._id}>{eq.designation || eq.code}</option>)}
        </select>
        <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
      </div>

      {/* KPI GÉNÉRAUX */}
      <div className="totaux-grid">
        <div className="total-card ligne">
          <div className="card-icon">🕒</div>
          <div className="card-value">{totalLigne} min</div>
          <div className="card-label"><strong>Total arrêt ligne</strong></div>
          <div className="card-details">
            🔁 {countLigne} arrêts | ⚙️ MTTR: {MTTRLigne.toFixed(1)} min | ⏱️ MTBF: {mtbfLigne.toFixed(1)} min
          </div>
        </div>
      </div>

      {/* --- SECTION AJOUTÉE : DÉTAILS ÉQUIPEMENTS PAR LIGNE --- */}
      <h3 style={{ marginTop: "40px" }}>🛠️ Répartition des Pannes par Équipement </h3>
      
      {/* Graphique des pannes par équipement */}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartEquipData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ligne" label={{ value: 'Lignes', position: 'insideBottom', offset: -10 }} />
          <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend verticalAlign="top" />
          {allEquipmentsNames.map((name, index) => (
            <Bar 
                key={name} 
                dataKey={name} 
                stackId="a" 
                fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"][index % 6]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Tableau détaillé des équipements */}
      <table className="intervention-table" style={{ marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th>Ligne</th>
            <th>Équipement</th>
            <th>Nombre d'arrêts</th>
            <th>Durée Totale (min)</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(equipementDataByLigne).map((ligneNom) => (
            Object.keys(equipementDataByLigne[ligneNom]).map((eqNom, idx) => (
              <tr key={`${ligneNom}-${eqNom}`}>
                {idx === 0 ? <td rowSpan={Object.keys(equipementDataByLigne[ligneNom]).length}><strong>{ligneNom}</strong></td> : null}
                
                <td> {eqNom}</td>
                <td>{equipementDataByLigne[ligneNom][eqNom].count}</td>
                <td>{equipementDataByLigne[ligneNom][eqNom].totalDuree} min</td>
              </tr>
            ))
          ))}
        </tbody>
      </table>
      {/* --- SECTION AJOUTÉE : DÉTAILS ÉQUIPEMENTS PAR LIGNE --- */}
      <h3 style={{ marginTop: "40px" }}>🛠️ Répartition des Pannes par Équipement (par Ligne)</h3>
      
      {/* BOUTON D'EXPORT DÉDIÉ */}
      <div style={{ marginBottom: "15px" }}>
        <button 
          onClick={exportSummaryExcel} 
          style={{ backgroundColor: "#2e7d32", color: "white", padding: "10px 15px", borderRadius: "5px", cursor: "pointer", border: "none" }}
        >
          📥 Exporter Rapport Complet (Excel)
        </button>
      </div>

      {/* Graphique des pannes par équipement */}
     
      ...
      {/* --- FIN DE LA SECTION AJOUTÉE --- */}

      {/* GRAPHIQUES EXISTANTS */}
      <h3 style={{ marginTop: "40px" }}>Histogramme MTTR par ligne</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={mttrChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mois" />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(groupedByLigneMois).map((ligne, index) => (
            <Bar key={ligne} dataKey={ligne} fill={["#e53935", "#1e88e5", "#43a047", "#fbc02d", "#8e24aa"][index % 5]} />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <h3 style={{ marginTop: "40px" }}>📋 Tableau résumé global par ligne</h3>
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

export default Arret2;