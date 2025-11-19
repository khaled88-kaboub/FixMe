import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "./IntervenantStat.css";

const IntervenantStat = () => {
  const [stats, setStats] = useState([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  // 🔹 États pour la modale
  const [showModal, setShowModal] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);
  const [details, setDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [ligneFilter, setLigneFilter] = useState("");
  const [equipFilter, setEquipFilter] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (startDate, endDate) => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/rapports");

      const filtered = data.filter((rapport) => {
        const dateInterv = new Date(rapport.dateIntervention);
        const afterStart = startDate ? dateInterv >= new Date(startDate) : true;
        const beforeEnd = endDate ? dateInterv <= new Date(endDate) : true;
        return afterStart && beforeEnd;
      });

      const map = {};
      filtered.forEach((rapport) => {
        rapport.techniciens.forEach((t) => {
          const nomComplet = `${t.technicien?.nom || ""} ${t.technicien?.prenom || ""}`.trim();
          if (!map[nomComplet]) {
            map[nomComplet] = { technicien: nomComplet, totalDuree: 0, nbInterventions: 0 };
          }
          map[nomComplet].totalDuree += t.dureeMinutes || 0;
          map[nomComplet].nbInterventions += 1;
        });
      });

      setStats(Object.values(map));
    } catch (error) {
      console.error("Erreur récupération statistiques:", error);
    }
  };

  const handleFiltrer = (e) => {
    e.preventDefault();
    fetchStats(dateDebut, dateFin);
  };

  const handleReset = () => {
    setDateDebut("");
    setDateFin("");
    fetchStats();
  };

  // 🔹 EXPORT GLOBAL EXCEL
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(stats);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Statistiques");
    XLSX.writeFile(wb, "Statistiques_Techniciens.xlsx");
  };

  // 🔹 EXPORT GLOBAL PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Statistiques par Technicien", 14, 10);

    const tableData = stats.map((t) => [
      t.technicien,
      t.nbInterventions,
      t.totalDuree,
    ]);

    autoTable(doc, {
      head: [["Technicien", "Nombre d'interventions", "Temps total (min)"]],
      body: tableData,
      startY: 20,
    });

    doc.save("statistiques_techniciens.pdf");
  };

  // 🆕 Ouvrir la modale
  const openModal = async (technicien) => {
    setSelectedTech(technicien);
    setShowModal(true);

    try {
      const { data } = await axios.get("http://localhost:5000/api/rapports");
      const filtres = data.filter((r) =>
        r.techniciens.some(
          (t) =>
            `${t.technicien?.nom || ""} ${t.technicien?.prenom || ""}`.trim() === technicien
        )
      );

      const map = {};
      filtres.forEach((r) => {
        const ligne = r.intervention?.ligne?.nom || "Non spécifié";
        const equip = r.intervention?.equipement?.code || "Non spécifié";
        const key = `${ligne} - ${equip}`;

        if (!map[key]) {
          map[key] = {
            ligne,
            equip,
            nbInterventions: 0,
            totalDuree: 0,
          };
        }

        r.techniciens.forEach((t) => {
          if (
            `${t.technicien?.nom || ""} ${t.technicien?.prenom || ""}`.trim() === technicien
          ) {
            map[key].nbInterventions += 1;
            map[key].totalDuree += t.dureeMinutes || 0;
          }
        });
      });

      const detailsArray = Object.values(map);
      setDetails(detailsArray);
      setFilteredDetails(detailsArray);
    } catch (error) {
      console.error("Erreur chargement détails:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTech(null);
    setDetails([]);
    setLigneFilter("");
    setEquipFilter("");
  };

  // 🔹 Filtrage dans la modale
  const handleFilterDetails = () => {
    const filtered = details.filter(
      (d) =>
        (!ligneFilter || d.ligne.toLowerCase().includes(ligneFilter.toLowerCase())) &&
        (!equipFilter || d.equip.toLowerCase().includes(equipFilter.toLowerCase()))
    );
    setFilteredDetails(filtered);
  };

  // 🔹 Totaux dans la modale
  const totalDuree = filteredDetails.reduce((sum, d) => sum + d.totalDuree, 0);
  const totalInter = filteredDetails.reduce((sum, d) => sum + d.nbInterventions, 0);

  // 🆕 EXPORT DÉTAIL — EXCEL
  const exportDetailsToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredDetails);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Détails_${selectedTech}`);
    XLSX.writeFile(wb, `Details_${selectedTech.replace(/\s+/g, "_")}.xlsx`);
  };

  // 🆕 EXPORT DÉTAIL — PDF
  const exportDetailsToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Détails — ${selectedTech}`, 14, 10);

    const tableData = filteredDetails.map((d) => [
      d.ligne,
      d.equip,
      d.nbInterventions,
      d.totalDuree,
    ]);

    autoTable(doc, {
      head: [["Ligne", "Équipement", "Nb interventions", "Durée totale (min)"]],
      body: tableData,
      startY: 20,
    });

    doc.text(`Total : ${totalInter} interventions — ${totalDuree} min`, 14, doc.lastAutoTable.finalY + 10);
    doc.save(`Details_${selectedTech.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="stats-container">
      <h2>📊 Statistiques par Technicien</h2>

      {/* 🔹 FILTRE PAR DATE */}
      <form className="filter-form" onSubmit={handleFiltrer}>
        <div className="date-inputs">
          <div>
            <label>📅 Date début :</label>
            <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
          </div>
          <div>
            <label>📅 Date fin :</label>
            <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
          </div>
        </div>
        <div className="filter-buttons">
          <button type="submit" className="btn-filtrer">Filtrer</button>
          <button type="button" className="btn-reset" onClick={handleReset}>Réinitialiser</button>
        </div>
      </form>

      {/* 🔹 TABLEAU GLOBAL */}
      <table className="stats-table">
        <thead>
          <tr>
            <th>Technicien</th>
            <th>Nombre d'interventions</th>
            <th>Temps total (min)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((t, index) => (
            <tr key={index}>
              <td>{t.technicien}</td>
              <td>{t.nbInterventions}</td>
              <td>{t.totalDuree}</td>
              <td>
                <button className="btn-detail" onClick={() => openModal(t.technicien)}>🔍 Détails</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 EXPORT GLOBAL */}
      <div className="export-buttons">
        <button onClick={exportToExcel} className="btn-excel">📊 Exporter Excel</button>
        <button onClick={exportToPDF} className="btn-pdf">📄 Exporter PDF</button>
      </div>

      {/* 🔹 GRAPHE GLOBAL */}
      <div className="chart-section">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="technicien" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="nbInterventions" fill="#82ca9d" name="Nb interventions" />
            <Bar dataKey="totalDuree" fill="#8884d8" name="Durée totale (min)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🆕 MODALE DÉTAILS */}
      {showModal && (
        <div className="modalo-overlayo">
          <div className="modalo-contento">
            <h3>🔍 Détails — {selectedTech}</h3>

            <div className="filter-details">
              <input
                type="text"
                placeholder="Filtrer par ligne"
                value={ligneFilter}
                onChange={(e) => setLigneFilter(e.target.value)}
              />
              <input
                type="text"
                placeholder="Filtrer par équipement"
                value={equipFilter}
                onChange={(e) => setEquipFilter(e.target.value)}
              />
              <button onClick={handleFilterDetails}>Filtrer</button>
            </div>

            {/* 🆕 Boutons export */}
            <div className="export-buttons">
              <button className="btn-excel" onClick={exportDetailsToExcel}>📊 Exporter Détails Excel</button>
              <button className="btn-pdf" onClick={exportDetailsToPDF}>📄 Exporter Détails PDF</button>
            </div>

            <table className="details-table">
              <thead>
                <tr>
                  <th>Ligne</th>
                  <th>Équipement</th>
                  <th>Nb interventions</th>
                  <th>Durée totale (min)</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetails.map((d, i) => (
                  <tr key={i}>
                    <td>{d.ligne}</td>
                    <td>{d.equip}</td>
                    <td>{d.nbInterventions}</td>
                    <td>{d.totalDuree}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="modal-totaux">
              <strong>Total interventions :</strong> {totalInter} —{" "}
              <strong>Total durée :</strong> {totalDuree} min
            </div>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={filteredDetails}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="equip" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="nbInterventions" fill="#82ca9d" name="Nb interventions" />
                  <Bar dataKey="totalDuree" fill="#8884d8" name="Durée totale" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <button className="btn-closed" onClick={closeModal}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntervenantStat;
