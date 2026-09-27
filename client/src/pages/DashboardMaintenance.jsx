// pages/DashboardMaintenance.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import "./DashboardMaintenance.css";

export default function DashboardMaintenance() {

  const API_URL = import.meta.env.VITE_API_URL;

  const [stats, setStats] = useState({
    interventionsParDemandeur: [],
    statsLignes: [],
    interventionsParStatut: [],
  
    // 👨‍🔧 Techniciens
    statsTechniciens: [],
    nombreIntervenants: 0,
    nombreParticipations: 0,
    dureeTotaleInterventions: 0,
// 👨‍🔧 prestations
  statsPrestataires: [],

  // 👨‍🔧 preventif

  actionsPreventivesPlanifiees: 0,
  actionsPreventivesRealisees: 0,
  tauxRealisationPreventive: 0,
  statsPreventifEquipements: []

  });

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

const [detailsLigne, setDetailsLigne] = useState([]);

const [loadingDetails, setLoadingDetails] = useState(false);

const [selectedLigne, setSelectedLigne] = useState("");
const currentDate = new Date();

const [mois, setMois] = useState(
  currentDate.getMonth() + 1
);

const [annee, setAnnee] = useState(
  currentDate.getFullYear()
);

useEffect(() => {
  fetchDashboard();
}, [mois, annee]);

const fetchDashboard = async () => {
  try {

    const res = await axios.get(
      `${API_URL}/api/dashboard`,
      {
        params: {
          mois,
          annee
        }
      }
    );

    setStats(res.data);

  } catch (error) {
    console.error(error);
  }
  finally {

    setLoading(false);

  }
};


  const handleShowDetails = async (ligne) => {

    try {
  
      setSelectedLigne(ligne.ligne);
  
      setLoadingDetails(true);
  
      setShowModal(true);
  
      const res = await axios.get(
        `${API_URL}/api/dashboard/ligne/${ligne.ligneId}`,
        {
          params: {
            mois,
            annee
          }
        }
      );
  
      setDetailsLigne(res.data);
  
    } catch (error) {
  
      console.error(error);
  
    } finally {
  
      setLoadingDetails(false);
  
    }
  
  };
// ======================================
// 📊 EXPORT TABLEAU PRINCIPAL
// ======================================

// ======================================
// 📄 EXPORT DETAILS LIGNE
// ======================================

const exportDetailsExcel = () => {

  const data = detailsLigne.map((item, index) => ({

    "N°": index + 1,

    "Numéro DI": item.numero,

    "Équipement": item.equipement,

    "Description": item.description,

    "Date arrêt":
      new Date(item.dateArret)
        .toLocaleString("fr-FR"),

    "Date démarrage":
      new Date(item.dateDemarrage)
        .toLocaleString("fr-FR"),

    "Durée (min)": item.dureeMinutes,

    "Demandeur": item.demandeur

  }));

  const ws = XLSX.utils.json_to_sheet(data);

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Details_Arrets"
  );

  XLSX.writeFile(
    wb,
    `Arrets_${selectedLigne}.xlsx`
  );

};

// ======================================
// 📄 EXPORT DETAILS prefentif equipements
// ======================================
const exporterPreventifExcel = () => {
  if (!stats.statsPreventifEquipements?.length) {
    toast.warning("Aucune donnée préventive à exporter.");
    return;
  }

  const donneesExcel = stats.statsPreventifEquipements.map((item) => ({
    "Ligne": item.ligne || "—",
    "Équipement": item.equipement || "—",
    "Code équipement": item.codeEquipement || "—",
    "Tâches planifiées": item.nombrePlanifie || 0,
    "Tâches réalisées": item.nombreRealise || 0,
    "Taux de réalisation (%)": item.tauxRealisation || 0
  }));

  const worksheet = XLSX.utils.json_to_sheet(donneesExcel);

  // Largeur des colonnes
  worksheet["!cols"] = [
    { wch: 25 },
    { wch: 35 },
    { wch: 20 },
    { wch: 22 },
    { wch: 22 },
    { wch: 25 }
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Suivi Préventif"
  );

  const nomFichier = `Suivi_Preventif_${mois}_${annee}.xlsx`;

  XLSX.writeFile(workbook, nomFichier);
};


const exportTechniciensExcel = () => {

  const data = stats.statsTechniciens.map((tech, index) => ({

    "N°": index + 1,

    "Technicien":
      tech.technicien || "—",

    "Matricule":
       "—",

    "Spécialité":
       "—",

    "Nombre interventions":
      tech.nombreInterventions || 0,

    "Durée totale (min)":
      tech.dureeTotaleMinutes || 0,

    "Durée moyenne (min)":
      tech.nombreInterventions
        ? Math.round(
            tech.dureeTotaleMinutes /
            tech.nombreInterventions
          )
        : 0

  }));

  const ws =
    XLSX.utils.json_to_sheet(data);

  const wb =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Intervenants"
  );

  XLSX.writeFile(
    wb,
    `Intervenants_${mois}_${annee}.xlsx`
  );
};


const exportDashboardTable = () => {

  const data = stats.statsLignes.map((ligne, index) => {

    // ============================
    // MTTR
    // ============================
    const mttr =
      ligne.nombreArrets > 0
        ? Math.round(
            ligne.tempsTotalArret / ligne.nombreArrets
          )
        : 0;

    // ============================
    // TEMPS DISPONIBLE
    // Production planifiée - Arrêts planifiés
    // ============================
    const tempsDisponible = Math.max(
      0,
      (ligne.tempsPlanifieMinutes || 0) -
      (ligne.tempsArretPlanifieMinutes || 0)
    );

    // ============================
    // MTBF
    // Temps disponible / nombre de pannes
    // Conversion en heures
    // ============================
    const mtbf =
      ligne.nombreArrets > 0
        ? tempsDisponible / ligne.nombreArrets / 60
        : 0;

    // ============================
    // TEMPS DE FONCTIONNEMENT
    // ============================
    const tempsFonctionnement = Math.max(
      0,
      tempsDisponible - (ligne.tempsTotalArret || 0)
    );

    // ============================
    // DISPONIBILITÉ
    // ============================
    const disponibilite =
      tempsDisponible > 0
        ? (tempsFonctionnement / tempsDisponible) * 100
        : 0;

    return {

      "N°": index + 1,

      "Ligne": ligne.ligne,

      "Production planifiée (min)":
        ligne.tempsPlanifieMinutes || 0,

      "Arrêts planifiés (min)":
        ligne.tempsArretPlanifieMinutes || 0,

      "Nombre arrêts pannes":
        ligne.nombreArrets || 0,

      "Temps arrêt pannes (min)":
        ligne.tempsTotalArret || 0,

      "MTTR (min)": mttr,

      "MTBF (h)": Number(mtbf.toFixed(1)),

      "Disponibilité (%)":
        Number(disponibilite.toFixed(1))
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Stats_Lignes"
  );

  XLSX.writeFile(
    wb,
    "Dashboard_Arrets_Lignes.xlsx"
  );
};
// ======================================
// 📈 EXPORT SYNTHESE EQUIPEMENTS
// ======================================

const exportSyntheseEquipements = () => {

  const data = statsEquipements.map((eq, index) => ({

    "N°": index + 1,

    "Équipement": eq.equipement,

    "Nombre arrêts": eq.nombreArrets,

    "Temps arrêt total (min)": eq.tempsArret

  }));

  const ws = XLSX.utils.json_to_sheet(data);

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Synthese_Equipements"
  );

  XLSX.writeFile(
    wb,
    `Synthese_${selectedLigne}.xlsx`
  );

};
  // =========================
  // KPI
  // =========================

  const totalInterventions =
    stats.interventionsParDemandeur?.reduce(
      (acc, item) => acc + item.total,
      0
    ) || 0;

  const totalArrets =
    stats.statsLignes?.reduce(
      (acc, item) => acc + item.nombreArrets,
      0
    ) || 0;

  const tempsTotalArret =
    stats.statsLignes?.reduce(
      (acc, item) => acc + item.tempsTotalArret,
      0
    ) || 0;

  const ligneCritique =
    stats.statsLignes?.length > 0
      ? stats.statsLignes[0].ligne
      : "—";

  // =========================
  // COLORS PIE
  // =========================

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#845EC2",
    "#2C73D2",
  ];


  // ======================================
// 📊 STATS PAR EQUIPEMENT
// ======================================

const statsEquipements = Object.values(

  detailsLigne.reduce((acc, item) => {

    const equipement = item.equipement || "Non défini";

    if (!acc[equipement]) {

      acc[equipement] = {

        equipement,

        nombreArrets: 0,

        tempsArret: 0

      };

    }

    acc[equipement].nombreArrets += 1;

    acc[equipement].tempsArret += item.dureeMinutes || 0;

    return acc;

  }, {})

);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Chargement dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      {/* HEADER */}

      <div className="dashboard-header">
        <h1>📊 Dashboard Maintenance</h1>
        <p>Statistiques du mois actuel</p>
      </div>

      {/* KPI */}

      <div className="dashboard-filters">
      <div className="filter-group">
<select
  value={mois}
  onChange={(e) => setMois(Number(e.target.value))}
>
  <option value={1}>Janvier</option>
  <option value={2}>Février</option>
  <option value={3}>Mars</option>
  <option value={4}>Avril</option>
  <option value={5}>Mai</option>
  <option value={6}>Juin</option>
  <option value={7}>Juillet</option>
  <option value={8}>Août</option>
  <option value={9}>Septembre</option>
  <option value={10}>Octobre</option>
  <option value={11}>Novembre</option>
  <option value={12}>Décembre</option>
</select>
</div>

<div className="filter-group">
<select
  value={annee}
  onChange={(e) => setAnnee(Number(e.target.value))}
>
  <option value={2024}>2024</option>
  <option value={2025}>2025</option>
  <option value={2026}>2026</option>
  <option value={2027}>2027</option>
</select>
</div>
</div>
<div className="kpi-grid">

<div className="kpi-card">
  <h3>Demandes d'interventions</h3>
  <p>{totalInterventions}</p>
</div>

<div className="kpi-card">
  <h3>Nombre arrêts lignes</h3>
  <p>{totalArrets}</p>
</div>

<div className="kpi-card">
  <h3>Temps arrêts lignes</h3>
  <p>{tempsTotalArret} min</p>
</div>

<div className="kpi-card">
  <h3>Ligne critique</h3>
  <p>{ligneCritique}</p>
</div>

{/* 👨‍🔧 NOUVEAU */}

<div className="kpi-card">
  <h3>Intervenants</h3>
  <p>{stats.nombreIntervenants}</p>
</div>

<div className="kpi-card">
  <h3>Temps d'intervention</h3>
  <p>{stats.dureeTotaleInterventions} min</p>
</div>



<div className="kpi-card">
    

    <div>
      <h3>Préventif planifié</h3>

      <p>
        {stats.actionsPreventivesPlanifiees || 0}
      </p>

    
    </div>
  </div>



  <div className="kpi-card">
   

    <div>
      <h3>Prventif réalisé</h3>

      <p>
        {stats.actionsPreventivesRealisees || 0}
      </p>

      
    </div>
  </div>


  <div className="kpi-card">

    <div>
      <h3>Taux de réalisation  </h3>

      <p>
        {stats.tauxRealisationPreventive || 0}% 
      </p>

     
    </div>
  </div>


</div>

      {/* CHARTS */}

      <div className="charts-grid">

        {/* BAR CHART */}

        <div className="chart-card">

          <h2>📈 Interventions par demandeur</h2>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={stats.interventionsParDemandeur}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="_id" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="total"
                fill="#2563eb"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

        </div>

        {/* PIE CHART */}

        <div className="chart-card">

          <h2>🛑 Temps arrêt par ligne</h2>

          <ResponsiveContainer width="100%" height={350}>
            <PieChart>

              <Pie
                data={stats.statsLignes}
                dataKey="tempsTotalArret"
                nameKey="ligne"
                outerRadius={120}
                label
              >
                {stats.statsLignes.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>
          </ResponsiveContainer>

        </div>


        <div className="chart-card">

<h2>📌 Interventions par statut</h2>

<ResponsiveContainer width="100%" height={350}>

  <PieChart>

    <Pie
      data={stats.interventionsParStatut}
      dataKey="total"
      nameKey="_id"
      outerRadius={120}
      label
    >

      {stats.interventionsParStatut?.map((entry, index) => (

        <Cell
          key={index}
          fill={COLORS[index % COLORS.length]}
        />

      ))}

    </Pie>

    <Tooltip />

    <Legend />

  </PieChart>

</ResponsiveContainer>

</div>

<div className="chart-card">

  <h2>👨‍🔧 Interventions par technicien</h2>

  <ResponsiveContainer
    width="100%"
    height={350}
  >

    <BarChart
      data={stats.statsTechniciens}
    >

      <CartesianGrid
        strokeDasharray="3 3"
      />

      <XAxis
        dataKey="technicien"
      />

      <YAxis />

      <Tooltip />

      <Bar
        dataKey="nombreInterventions"
        fill="#2563eb"
        radius={[8, 8, 0, 0]}
      />

    </BarChart>

  </ResponsiveContainer>

</div>

<div className="chart-card">

  <h2>⏱ Temps d'intervention par technicien</h2>

  <ResponsiveContainer
    width="100%"
    height={350}
  >

    <BarChart
      data={stats.statsTechniciens}
    >

      <CartesianGrid
        strokeDasharray="3 3"
      />

      <XAxis
        dataKey="technicien"
      />

      <YAxis />

      <Tooltip
        formatter={(value) => [
          `${value} min`,
          "Durée"
        ]}
      />

      <Bar
        dataKey="dureeTotaleMinutes"
        fill="#00C49F"
        radius={[8, 8, 0, 0]}
      />

    </BarChart>

  </ResponsiveContainer>

</div>
      </div>

      {/* TABLE */}

      <div className="table-card">

        <h3>⏱ Détails arrêts par ligne</h3>

        <table className="dashboardo-table">

  <thead>
    <tr>
      <th>Ligne</th>
      <th>Production planifiée</th>
      <th>Arrêts planifiés (min)</th>
      <th>Nombre arrêts panne</th>
      <th>Temps arrêt pannes (min)</th>
      <th>MTTR (min)</th>
      <th>MTBF (h)</th>
      <th>Disponibilité</th>

      <th>Plus..</th>
    </tr>
  </thead>

  <tbody>

{stats.statsLignes?.map((ligne, index) => {

  // ============================
  // MTTR
  // ============================
  const mttr =
    ligne.nombreArrets > 0
      ? Math.round(
          ligne.tempsTotalArret / ligne.nombreArrets
        )
      : 0;

  // ============================
  // TEMPS DISPONIBLE
  // Production planifiée
  // - Arrêts planifiés
  // ============================
  const tempsDisponible =
    Math.max(
      0,
      (ligne.tempsPlanifieMinutes || 0) -
      (ligne.tempsArretPlanifieMinutes || 0)
    );

  // ============================
  // MTBF
  // Temps disponible / nombre de pannes
  // Conversion minutes -> heures
  // ============================
  const mtbf =
    ligne.nombreArrets > 0
      ? tempsDisponible / ligne.nombreArrets / 60
      : 0;

  // ============================
  // TEMPS DE FONCTIONNEMENT
  // Temps disponible - temps des pannes
  // ============================
  const tempsFonctionnement = Math.max(
    0,
    tempsDisponible - (ligne.tempsTotalArret || 0)
  );


  // ============================
  // DISPONIBILITÉ
  // ============================
      const disponibilite =
      tempsDisponible > 0
        ? (tempsFonctionnement / tempsDisponible) * 100
        : 0;

  return (
    <tr key={index}>

      <td data-label="Ligne :">
        {ligne.ligne}
      </td>

      <td data-label="Production planifiée">
        {ligne.tempsPlanifieMinutes || 0} min
      </td>

      <td data-label="Arrêt planifié :">
        {ligne.tempsArretPlanifieMinutes || 0} min
      </td>

      <td data-label="Nombre des arrets :">
        {ligne.nombreArrets}
      </td>

      <td data-label="Temps d'arret :">
        {ligne.tempsTotalArret} min
      </td>

      {/* MTTR */}
      <td data-label="MTTR :">
        <span
          className={`mttr-badge ${
            mttr > 30
              ? "mttr-badge-danger"
              : "mttr-badge-success"
          }`}
        >
          {mttr} min
        </span>
      </td>

      {/* MTBF */}
      <td data-label="MTBF :">
        <span
          className={`mtbf-badge ${
            mtbf >= 6
              ? "mtbf-badge-success"
              : "mtbf-badge-danger"
          }`}
        >
          {mtbf.toFixed(1)} h
        </span>
      </td>
 {/* DISPONIBILITÉ */}
      <td data-label="Disponibilité :">
        <span
          className={`disponibilite-badge ${
            disponibilite > 90
              ? "disponibilite-badge-success"
              : "disponibilite-badge-danger"
          }`}
        >
          {disponibilite.toFixed(1)} %
        </span>
      </td>
      <td>
        <button
          className="btn-details"
          onClick={() => handleShowDetails(ligne)}
        >
          🔍 Détails
        </button>
      </td>

    </tr>
  );
})}

</tbody>

</table>

        <div className="export-actions">

<button
  className="btn-export"
  onClick={exportDashboardTable}
>
  📊 Export Excel
</button>


</div>
      </div>
<div className="espace">    </div>

<div className="maintenance-objectives">

  <div className="objectives-header">
    <div>
     {/* <span className="objectives-kicker">🎯 PERFORMANCE MAINTENANCE</span>*/}
      <h3>🎯 Nos objectifs</h3>
      <p>
        Les objectifs de référence pour améliorer la fiabilité,
        la réactivité et la disponibilité des équipements.
      </p>
    </div>
  </div>

  <div className="objectives-grid">

    {/* MTTR */}
    <div className="objective-card">

      <div className="objective-icon">
        🔧
      </div>

      <div className="objective-content">
        <span className="objective-label">
          MTTR
        </span>

        <strong className="objective-value">
          ≤ 30 <small>min</small>
        </strong>

        <span className="objective-description">
          Temps moyen de réparation
        </span>
      </div>

      <div className="objective-target">
        🎯 Objectif
      </div>

    </div>


    {/* MTBF */}
    <div className="objective-card">

      <div className="objective-icon">
        ⏱️
      </div>

      <div className="objective-content">
        <span className="objective-label">
          MTBF
        </span>

        <strong className="objective-value">
          ≥ 6 <small>heures</small>
        </strong>

        <span className="objective-description">
          Temps moyen entre deux pannes
        </span>
      </div>

      <div className="objective-target">
        🎯 Objectif
      </div>

    </div>


    {/* Disponibilité */}
    <div className="objective-card">

      <div className="objective-icon">
        📊
      </div>

      <div className="objective-content">
        <span className="objective-label">
          Disponibilité
        </span>

        <strong className="objective-value">
          &gt; 90 <small>%</small>
        </strong>

        <span className="objective-description">
          Disponibilité opérationnelle
        </span>
      </div>

      <div className="objective-target">
        🎯 Objectif
      </div>

    </div>

  </div>

</div>

<div className="kpi-legend">

  <div className="kpi-legend-title">
  💡 Comprendre les indicateurs de performance maintenance
  </div>

  <div className="kpi-legend-intro">
    Ces indicateurs permettent d'évaluer la fiabilité, la maintenabilité
    et la disponibilité des équipements et des lignes de production.
  </div>

  <div className="kpi-legend-grid">

    {/* MTTR */}
    <div className="kpi-legend-item">

      <div className="kpi-legend-icon">
        🔧
      </div>

      <div>

        <h4>MTTR — Mean Time To Repair</h4>

        <p>
          <strong>Temps moyen de réparation.</strong>{" "}
          Il représente le temps moyen nécessaire pour réparer une panne
          et remettre l'équipement en service.
        </p>

        <div className="kpi-formula">
          MTTR = Temps total d'arrêt panne ÷ Nombre de pannes
        </div>

        <div className="kpi-example">
          <strong>Exemple :</strong> 300 min d'arrêt pour 10 pannes
          → MTTR = 30 min.
        </div>

      </div>

    </div>


    {/* MTBF méthode 1 */}
    <div className="kpi-legend-item">

      <div className="kpi-legend-icon">
        ⏱️
      </div>

      <div>

        <h4>MTBF — Méthode 1 : temps de fonctionnement</h4>

        <p>
          <strong>Mean Time Between Failures.</strong>{" "}
          Temps moyen de fonctionnement entre deux pannes.
        </p>

        <div className="kpi-formula">
          MTBF = Temps de fonctionnement ÷ Nombre de pannes
        </div>

        <div className="kpi-formula-detail">
          Temps de fonctionnement =
          Production planifiée − Arrêts planifiés − Arrêts pannes
        </div>

        <div className="kpi-example">
          <strong>Exemple :</strong> 1 200 − 120 − 300 = 780 min
          de fonctionnement.
          <br />
          MTBF = 780 ÷ 10 = <strong>78 min</strong>.
        </div>

      </div>

    </div>


    {/* MTBF méthode 2 */}
    <div className="kpi-legend-item">

      <div className="kpi-legend-icon">
        📐
      </div>

      <div>

        <h4>MTBF — Méthode 2 : temps disponible</h4>

        <p>
          Cette approche rapporte le temps disponible pour fonctionner
          au nombre de pannes enregistrées.
        </p>

        <div className="kpi-formula">
          MTBF = Temps disponible ÷ Nombre de pannes
        </div>

        <div className="kpi-formula-detail">
          Temps disponible =
          Production planifiée − Arrêts planifiés
        </div>

        <div className="kpi-example">
          <strong>Exemple :</strong> 1 200 − 120 = 1 080 min disponibles.
          <br />
          MTBF = 1 080 ÷ 10 = <strong>108 min</strong>.
        </div>

      </div>

    </div>


    {/* Disponibilité */}
    <div className="kpi-legend-item">

      <div className="kpi-legend-icon">
        📊
      </div>

      <div>

        <h4>Disponibilité</h4>

        <p>
          La disponibilité représente la proportion du temps pendant
          laquelle l'équipement est réellement disponible pour fonctionner,
          par rapport au temps pendant lequel il était prévu pour fonctionner.
        </p>

        <div className="kpi-formula">
          Disponibilité = Temps de fonctionnement ÷ Temps disponible × 100
        </div>

        <div className="kpi-formula-detail">
          Temps de fonctionnement =
          Temps disponible − Temps d'arrêt panne
        </div>

        <div className="kpi-example">
          <strong>Exemple :</strong> 780 ÷ 1 080 × 100
          = <strong>72,2 %</strong>.
        </div>

      </div>

    </div>

  </div>


  {/* Lecture des indicateurs */}
  <div className="kpi-legend-note">

    <strong>💡 Interprétation des indicateurs</strong>

    <ul>
      <li>
        <strong>MTTR faible :</strong> les interventions de réparation
        sont réalisées rapidement.
      </li>

      <li>
        <strong>MTBF élevé :</strong> les périodes de fonctionnement
        entre les pannes sont plus longues.
      </li>

      <li>
        <strong>Disponibilité élevée :</strong> l'équipement est disponible
        pendant une plus grande proportion du temps prévu pour fonctionner.
      </li>

      <li>
        <strong>Arrêt planifié :</strong> arrêt prévu à l'avance
        (maintenance préventive, nettoyage, changement de format, etc.).
      </li>

      <li>
        <strong>Arrêt panne :</strong> arrêt résultant d'une défaillance
        nécessitant une intervention corrective.
      </li>
    </ul>

  </div>

</div>

<div className="table-card preventive-table-card">

  <div className="table-header">
    <div>
      <h3>🛠️ Suivi du préventif par équipement</h3>

      <p>
        Réalisation des actions préventives du mois sélectionné
      </p>
    </div>
  </div>

  <div className="table-responsive">

    <table className="dashboardo-table">

      <thead>
        <tr>
          <th>Ligne</th>
          <th>Équipement</th>
          <th>Tâches planifiées</th>
          <th>Tâches réalisées</th>
          <th>Taux de réalisation</th>
        </tr>
      </thead>

      <tbody>

        {stats.statsPreventifEquipements?.length > 0 ? (

          stats.statsPreventifEquipements.map((item, index) => (

            <tr key={item.equipementId || index}>

              <td data-label="Ligne">
                {item.ligne || "—"}
              </td>

              <td data-label="Équipement">
                <strong>
                  {item.equipement || "—"}
                </strong>

                {item.codeEquipement && (
                  <small>
                    {" "}({item.codeEquipement})
                  </small>
                )}
              </td>

              <td data-label="Tâches planifiées">
                {item.nombrePlanifie}
              </td>

              <td data-label="Tâches réalisées">
                {item.nombreRealise}
              </td>

              <td data-label="Taux de réalisation">

<div className="progress-container">

  <div className="progress-bar">

    <div
      className="progress-fill"
      style={{
        width: `${Math.min(item.tauxRealisation, 100)}%`
      }}
    />

  </div>

  <strong>
    {item.tauxRealisation} %
  </strong>

</div>

</td>
            </tr>

          ))

        ) : (

          <tr>
            <td
              colSpan="5"
              style={{ textAlign: "center" }}
            >
              Aucune action préventive pour cette période
            </td>
          </tr>

        )}

      </tbody>

    </table>

  </div>

  <div className="export-actions">

<button
  className="btn-export"
  onClick={exporterPreventifExcel}
>
  📊 Export Excel
</button>

</div>

</div>

<div className="espace">    </div>

      <div className="table-card">

<h3>👨‍🔧 Synthèse des intervenants</h3>

<table className="dashboardo-table">

  <thead>

    <tr>
      <th>Technicien</th>
      <th>Matricule</th>
      <th>Spécialité</th>
      <th>Nombre interventions</th>
      <th>Durée totale</th>
    </tr>

  </thead>

  <tbody>

    {stats.statsTechniciens?.map(
      (tech, index) => (

        <tr key={tech.technicienId || index}>

          <td data-label="Technicien :">
            {tech.technicien || "—"}
          </td>

          <td data-label="Matricule :">
            ---
            {/*{tech.matricule || "—"}*/}
          </td>

          <td data-label="Spécialité :">
            ---
           {/* {tech.specialite || "—"} */}
          </td>

          <td data-label="Interventions :">
            {tech.nombreInterventions}
          </td>

          <td data-label="Durée :">
            {tech.dureeTotaleMinutes} min
          </td>

        </tr>

      )
    )}

  </tbody>

</table>

<div className="export-actions">

  <button
    className="btn-export"
    onClick={exportTechniciensExcel}
  >
    📊 Export Intervenants Excel
  </button>

</div>

</div>

<div className="espace">    </div>
<div className="table-card">

  <h3>🏢 Prestations externes</h3>

  <table className="dashboardo-table">

    <thead>
      <tr>
        <th>Prestataire</th>
        
        <th>Nombre de prestations</th>
        <th>Montant total</th>
      </tr>
    </thead>

    <tbody>

      {stats.statsPrestataires?.length > 0 ? (

        stats.statsPrestataires.map(
          (prestataire, index) => (

            <tr key={prestataire.fournisseurId || index}>

<td data-label="Prestataire :">
  <strong>{prestataire.prestataire}</strong>
  <br />
  <span>Specialité : {prestataire.specialite}</span>
</td>

              

              <td data-label="Nombre prestations :">
                {prestataire.nombrePrestations}
              </td>

              <td data-label="Montant total :">
                {prestataire.montantTotal.toLocaleString("fr-FR")} DA
              </td>

            </tr>

          )
        )

      ) : (

        <tr>
          <td colSpan="3" style={{ textAlign: "center" }}>
            Aucune prestation pour cette période
          </td>
        </tr>

      )}

    </tbody>

  </table>

</div>

      {
  showModal && (

    <div className="modal-overlay">

      <div className="modal-content">

        <div className="modal-header">

        <h3>
  📋 Liste des Arrêts — {selectedLigne} -- ({mois}/{annee})
</h3>

          <button
            className="closed-btno"
            onClick={() => setShowModal(false)}
          >
            x
          </button>

        </div>

        {
          loadingDetails ? (

            <p>Chargement...</p>

            ) : (

              <>
            
                {/* =========================
                    TABLEAU RESUME
                ========================== */}
            
                <div className="resume-card">
            
                  <h3>
                    📊 Synthèse arrêts par équipement
                  </h3>
            
                  <table className="resume-table">
            
                    <thead>
            
                      <tr>
            
                        <th>Équipement</th>
            
                        <th>Nombre arrêts</th>
            
                        <th>Temps arrêt total</th>
            
                      </tr>
            
                    </thead>
            
                    <tbody>
            
                      {
                        statsEquipements.map((eq, index) => (
            
                          <tr key={index}>
            
                            <td data-label = "Equipement :">{eq.equipement}</td>
            
                            <td data-label = "Nombre d'arrets :">{eq.nombreArrets}</td>
            
                            <td data-label = "Durée des arrets">{eq.tempsArret} min</td>
            
                          </tr>
            
                        ))
                      }
            
                    </tbody>
            
                  </table>
            
                  <div className="export-actions">

<button
  className="btn-export"
  onClick={exportSyntheseEquipements}
>
  📊 Export Synthèse
</button>

</div>
                </div>
            
                {/* =========================
                    GRAPHIQUE
                ========================== */}
            

            <div className="chart-card modal-chart">

  <h3>
    📊 Nombre d'arrêts par équipement
  </h3>

  <ResponsiveContainer width="100%" height={320}>

    <BarChart data={statsEquipements}>

      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="equipement" />

      <YAxis />

      <Tooltip />

      <Bar
        dataKey="nombreArrets"
        fill="#00C49F"
        radius={[8,8,0,0]}
      />

    </BarChart>

  </ResponsiveContainer>

</div>


                <div className="chart-card modal-chart">
            
                  <h3>
                    📈 Temps arrêt par équipement
                  </h3>
            
                  <ResponsiveContainer width="100%" height={320}>
            
                    <BarChart data={statsEquipements}>
            
                      <CartesianGrid strokeDasharray="3 3" />
            
                      <XAxis dataKey="equipement" />
            
                      <YAxis />
            
                      <Tooltip />
            
                      <Bar
                        dataKey="tempsArret"
                        fill="#2563eb"
                        radius={[8,8,0,0]}
                      />
            
                    </BarChart>
            
                  </ResponsiveContainer>
            
                </div>
            
                {/* =========================
                    TABLE DETAILS
                ========================== */}
            
                


            

            <table className="details-table">

              <thead>

                <tr>
                <th></th>
                  <th>Num DI</th>
                  <th>Équipement</th>
                  <th>Description</th>

                  <th>Date arrêt</th>

                  <th>Date démarrage</th>

                  <th>Durée</th>

                  <th>Demandeur</th>

                </tr>

              </thead>

              <tbody>

                {
                  detailsLigne.map((item, index) => (

                      <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td data-label = "Numéro DI :">{item.numero}</td>
                      <td data-label = "Equipement :">{item.equipement}</td>
                     

                      <td data-label = "Description anomalie :">{item.description}</td>

                      <td data-label = "Date arret :">
                        
                      {item.dateArret ? item.dateArret.replace('T', ' ').slice(0, 16) : "-"}
                      </td >

                      <td data-label = "Date démarrage :">
                      {item.dateDemarrage ? item.dateDemarrage.replace('T', ' ').slice(0, 16) : "-"}
                       
                      </td>

                      <td data-label = "Durée :">
                        {item.dureeMinutes} min
                      </td>

                      <td data-label = "Demandeur :">{item.demandeur}</td>

                    </tr>

                  ))
                }

              </tbody>

            </table>
            <div className="export-actions">

  <button
    className="btn-export"
    onClick={exportDetailsExcel}
  >
    📄 Export Détails
  </button>

</div>
            </>
          )
        }

      </div>

    </div>

  )
}


    </div>
  );
}