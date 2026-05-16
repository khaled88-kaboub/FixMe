// pages/DashboardMaintenance.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
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
                     

                      <td data-label = "Date :">{item.description}</td>

                      <td data-label = "Date arret :">
                        {
                          new Date(item.dateArret)
                            .toLocaleString("fr-FR")
                        }
                      </td >

                      <td data-label = "Date démarrage :">
                        {
                          new Date(item.dateDemarrage)
                            .toLocaleString("fr-FR")
                        }
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

          )
        }

      </div>

    </div>

  )
}


    </div>
  );
}