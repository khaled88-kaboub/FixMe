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

  const data = stats.statsLignes.map((ligne, index) => ({

    "N°": index + 1,

    "Ligne": ligne.ligne,

    "Nombre arrêts": ligne.nombreArrets,

    "Temps arrêt total (min)": ligne.tempsTotalArret

  }));

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
  <h3>Total interventions</h3>
  <p>{totalInterventions}</p>
</div>

<div className="kpi-card">
  <h3>Total arrêts</h3>
  <p>{totalArrets}</p>
</div>

<div className="kpi-card">
  <h3>Temps arrêt total</h3>
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
              <th>Nombre arrêts</th>
              <th>Temps arrêt total (min)</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {stats.statsLignes?.map((ligne, index) => (

              <tr key={index}>

                <td data-label = "Ligne :">{ligne.ligne}</td>

                <td data-label = "Nombre des arrets :">{ligne.nombreArrets}</td>

                <td data-label = "Temps d'arret :">{ligne.tempsTotalArret} min</td>
                <td>

               <button
             className="btn-details"
             onClick={() => handleShowDetails(ligne)}
               >
              🔍 Détails
               </button>

              </td>
              </tr>

            ))}

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