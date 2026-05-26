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
  });

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

const [detailsLigne, setDetailsLigne] = useState([]);

const [loadingDetails, setLoadingDetails] = useState(false);

const [selectedLigne, setSelectedLigne] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {

      const res = await axios.get(`${API_URL}/api/dashboard`);

      setStats(res.data);

    } catch (error) {
      console.error("Erreur dashboard :", error);
    } finally {
      setLoading(false);
    }
  };


  const handleShowDetails = async (ligne) => {

    try {
  
      setSelectedLigne(ligne.ligne);
  
      setLoadingDetails(true);
  
      setShowModal(true);
  
      const res = await axios.get(
        `${API_URL}/api/dashboard/ligne/${ligne.ligneId}`
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

                <td data-label = "Line :">{ligne.ligne}</td>

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


      {
  showModal && (

    <div className="modal-overlay">

      <div className="modal-content">

        <div className="modal-header">

          <h3>
            📋 Liste des Arrêts — {selectedLigne}
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
            
                            <td>{eq.equipement}</td>
            
                            <td>{eq.nombreArrets}</td>
            
                            <td>{eq.tempsArret} min</td>
            
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