// MaintenancePreventiveDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaTools, FaCogs, FaClipboardCheck } from "react-icons/fa";

export default function MaintenancePreventiveDashboard() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [stats, setStats] = useState({
    totalInterventions: 0,
    totalEquipements: 0,
    totalMaintenances: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [recentInterventions, setRecentInterventions] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axios.get(`${API_URL}/api/dashboard/stats`)
      .then(res => {
        const data = res.data.data || res.data;
        setStats({
          totalInterventions: data.totalInterventions || 0,
          totalEquipements: data.totalEquipements || 0,
          totalMaintenances: data.totalMaintenances || 0,
        });
      })
      .catch(err => console.error(err));

    axios.get(`${API_URL}/api/dashboard/chart`)
      .then(res => {
        const data = Array.isArray(res.data.data) ? res.data.data : res.data;
        setChartData(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));

    axios.get(`${API_URL}/api/interventions/recent`)
      .then(res => {
        const data = Array.isArray(res.data.data) ? res.data.data : res.data;
        setRecentInterventions(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));
  }, []);

  const statusColor = (statut) => {
    switch (statut?.toLowerCase()) {
      case "terminé": return "bg-green-100 text-green-800";
      case "en cours": return "bg-yellow-100 text-yellow-800";
      case "annulé": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // --- Filtrage et recherche ---
  const filteredInterventions = recentInterventions
    .filter(i => filterStatus === "all" || i.statut?.toLowerCase() === filterStatus)
    .filter(i => i.equipement?.toLowerCase().includes(search.toLowerCase()) ||
                 i.technicien?.toLowerCase().includes(search.toLowerCase()));

  // --- Pagination ---
  const totalPages = Math.ceil(filteredInterventions.length / itemsPerPage);
  const paginatedInterventions = filteredInterventions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Maintenance</h1>

      {/* --- Widgets --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="flex items-center p-4 bg-blue-100 rounded-lg shadow">
          <FaTools className="text-blue-600 text-3xl mr-4" />
          <div>
            <p className="text-gray-700 text-sm">Interventions</p>
            <p className="text-2xl font-bold">{stats.totalInterventions}</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-purple-100 rounded-lg shadow">
          <FaCogs className="text-purple-600 text-3xl mr-4" />
          <div>
            <p className="text-gray-700 text-sm">Équipements</p>
            <p className="text-2xl font-bold">{stats.totalEquipements}</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-green-100 rounded-lg shadow">
          <FaClipboardCheck className="text-green-600 text-3xl mr-4" />
          <div>
            <p className="text-gray-700 text-sm">Maintenances prévues</p>
            <p className="text-2xl font-bold">{stats.totalMaintenances}</p>
          </div>
        </div>
      </div>

      {/* --- Graphique --- */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-gray-700 font-semibold mb-4">Activité des interventions</h2>
        {Array.isArray(chartData) && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="interventions" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-10">Aucune donnée disponible</p>
        )}
      </div>

      {/* --- Filtres et recherche --- */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Rechercher par équipement ou technicien..."
          className="border p-2 rounded w-full sm:w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded w-full sm:w-1/4"
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
        >
          <option value="all">Tous les statuts</option>
          <option value="terminé">Terminé</option>
          <option value="en cours">En cours</option>
          <option value="annulé">Annulé</option>
        </select>
      </div>

      {/* --- Table --- */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Équipement</th>
                <th className="px-4 py-2">Technicien</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInterventions.length > 0 ? (
                paginatedInterventions.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="px-4 py-2">{item._id}</td>
                    <td className="px-4 py-2">{item.equipement}</td>
                    <td className="px-4 py-2">{item.technicien}</td>
                    <td className="px-4 py-2">{item.date ? new Date(item.date).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(item.statut)}`}>
                        {item.statut || "-"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    Aucune intervention correspondante
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
