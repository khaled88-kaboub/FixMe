import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTools } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";
import "./ListDi.css";

const ListDi = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [interventions, setInterventions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    ligne: "",
    equipement: "",
    codeEquipement: "",
    numero: "",
    statut: "",
    dateDebut: "",
    dateFin: "",
  });

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/interventions`);
        setInterventions(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des interventions");
      } finally {
        setLoading(false);
      }
    };
    fetchInterventions();
  }, []);

  useEffect(() => {
    let result = interventions;

    if (filters.ligne)
      result = result.filter((i) =>
        i.ligne?.nom?.toLowerCase().includes(filters.ligne.toLowerCase())
      );
    if (filters.equipement)
      result = result.filter((i) =>
        i.equipement?.designation
          ?.toLowerCase()
          .includes(filters.equipement.toLowerCase())
      );
    if (filters.codeEquipement)
      result = result.filter((i) =>
        i.equipement?.code
          ?.toLowerCase()
          .includes(filters.codeEquipement.toLowerCase())
      );
    if (filters.numero)
      result = result.filter((i) =>
        i.numero?.toString().includes(filters.numero)
      );
    if (filters.statut)
      result = result.filter((i) =>
        i.statut?.toLowerCase().includes(filters.statut.toLowerCase())
      );
    if (filters.dateDebut && filters.dateFin)
      result = result.filter((i) => {
        const date = new Date(i.createdAt);
        return date >= new Date(filters.dateDebut) && date <= new Date(filters.dateFin);
      });

    setFiltered(result);
  }, [filters, interventions]);

  const openModal = (item) => {
    setSelected({
      ...item,
      dateHeureDemarrageLigne: item.dateHeureDemarrageLigne
        ? new Date(item.dateHeureDemarrageLigne).toISOString().slice(0, 16)
        : "",
      dateHeureDemarrageEquipement: item.dateHeureDemarrageEquipement
        ? new Date(item.dateHeureDemarrageEquipement).toISOString().slice(0, 16)
        : "",
      dateHeureArretLigne: item.dateHeureArretLigne
        ? new Date(item.dateHeureArretLigne).toISOString().slice(0, 16)
        : "",
      dateHeureArretEquipement: item.dateHeureArretEquipement
        ? new Date(item.dateHeureArretEquipement).toISOString().slice(0, 16)
        : "",
    });
  };

  const exportExcel = () => {
    const data = filtered.map((i) => ({
      Numéro: i.numero,
      Ligne: i.ligne?.nom || "-",
      Équipement: i.equipement?.designation || "-",
      "Code Équipement": i.equipement?.code || "-",
      "Description": i.descriptionAnomalie,
      "Arrêt Ligne": i.dateHeureArretLigne ? new Date(i.dateHeureArretLigne).toLocaleString() : "-",
      "Redémarrage Ligne": i.dateHeureDemarrageLigne ? new Date(i.dateHeureDemarrageLigne).toLocaleString() : "-",
      "Arrêt Équipement": i.dateHeureArretEquipement ? new Date(i.dateHeureArretEquipement).toLocaleString() : "-",
      "Redémarrage Équipement": i.dateHeureDemarrageEquipement ? new Date(i.dateHeureDemarrageEquipement).toLocaleString() : "-",
      Statut: i.statut,
      "Date Création": i.createdAt ? new Date(i.createdAt).toLocaleString() : "-",
      Demandeur: i.demandeurNom || "-",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Interventions");
    XLSX.writeFile(wb, "Interventions.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Numéro", "Ligne", "Équipement", "Code Équipement", "Description", "Arrêt Ligne", "Redémarrage Ligne", "Arrêt Équipement", "Redémarrage Équipement", "Statut", "Date Création", "Demandeur"];
    const tableRows = [];

    filtered.forEach((i) => {
      const row = [
        i.numero,
        i.ligne?.nom || "-",
        i.equipement?.designation || "-",
        i.equipement?.code || "-",
        i.descriptionAnomalie,
        i.dateHeureArretLigne ? new Date(i.dateHeureArretLigne).toLocaleString() : "-",
        i.dateHeureDemarrageLigne ? new Date(i.dateHeureDemarrageLigne).toLocaleString() : "-",
        i.dateHeureArretEquipement ? new Date(i.dateHeureArretEquipement).toLocaleString() : "-",
        i.dateHeureDemarrageEquipement ? new Date(i.dateHeureDemarrageEquipement).toLocaleString() : "-",
        i.statut,
        i.createdAt ? new Date(i.createdAt).toLocaleString() : "-",
        i.demandeurNom || "-",
      ];
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.text("Liste des interventions", 14, 15);
    doc.save("Interventions.pdf");
  };

  if (loading) return <p className="loading-text">Chargement...</p>;

  return (
    <div className="reception-page">
      <h2 className="titre">
        <FaTools /> Liste des demandes d'intervention
      </h2>
      <div className="sectiona-underlina"></div>

      {/* 🔹 Boutons export */}
      <div style={{ marginBottom: "10px" }}>
        <button className="btn-primary" onClick={exportExcel}>Exporter Excel</button>
        <button className="btn-secondary" onClick={exportPDF} style={{ marginLeft: "10px" }}>Exporter PDF</button>
      </div>

      {/* 🔍 Filtres avancés */}
      <div className="advanced-filters">
        <div className="in">
        <input
        className="in"
          type="text"
          placeholder="Filtrer par ligne"
          value={filters.ligne}
          onChange={(e) => setFilters({ ...filters, ligne: e.target.value })}
        />
        </div>
        <div className="in">
        <input
       
          type="text"
          placeholder="Filtrer par équipement"
          value={filters.equipement}
          onChange={(e) => setFilters({ ...filters, equipement: e.target.value })}
        />
        </div>
        <div className="in">
        <input
        
          type="text"
          placeholder="Filtrer par code équipement"
          value={filters.codeEquipement}
          onChange={(e) => setFilters({ ...filters, codeEquipement: e.target.value })}
        />
        </div>
       <div className="in">
       <input
          type="text"
          placeholder="Filtrer par numéro"
          value={filters.numero}
          onChange={(e) => setFilters({ ...filters, numero: e.target.value })}
        />
       </div>
       
        <select
          value={filters.statut}
          onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
        >
          <option value="">Tous les statuts</option>
          <option value="ouvert">Ouvert</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="annule">Annulé</option>
        </select>
        <div className="date-range">
          <label>De :</label>
          <input 
            type="date"
            value={filters.dateDebut}
            onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
          />
          <label>À :</label>
          <input 
            type="date"
            value={filters.dateFin}
            onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
          />
        </div>
      </div>

      {/* 🧾 Tableau */}
      <table className="reception-table">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Ligne</th>
            <th>Équipement</th>
            <th>Code</th>
            <th>Arrêt ligne</th>
            <th>Redémarrage ligne</th>
            <th>Arrêt équipement</th>
            <th>Redémarrage équipement</th>
            <th>Statut</th>
            <th>Date Création</th>
            <th>Demandeur</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="11" style={{ textAlign: "center" }}>
                Aucune intervention trouvée.
              </td>
            </tr>
          ) : (
            filtered.map((i) => (
              <tr key={i._id} onClick={() => openModal(i)} style={{ cursor: "pointer" }}>
                <td className="cell-num" data-label = "Numéro DI" >{i.numero}</td>
                <td data-label = "Ligne">{i.ligne?.nom || "-"}</td>
                <td data-label = "Equipement">{i.equipement?.designation || "-"}</td>
                <td data-label = "Code Equipement">{i.equipement?.code || "-"}</td>
                <td data-label="Date & Heure arret Ligne">{i.dateHeureArretLigne ? i.dateHeureArretLigne.replace('T', ' ').slice(0, 16) : "-"}</td>
                <td data-label = "Date & Heure démarrage Ligne">{i.dateHeureDemarrageLigne ? i.dateHeureDemarrageLigne.replace('T', ' ').slice(0, 16) : "-"}</td>
                <td data-label = "Date & Heure arret Equipement">{i.dateHeureArretEquipement ? i.dateHeureArretEquipement.replace('T', ' ').slice(0, 16) : "-"}</td>
                <td data-label = "Date & Heure démarrage Equipement">{i.dateHeureDemarrageEquipement ? i.dateHeureDemarrageEquipement.replace('T', ' ').slice(0, 16) : "-"}</td>
                
                <td data-label = "Statut ">{i.statut}</td>
                <td data-label = "Créé le">{i.createdAt ? new Date(i.createdAt).toLocaleString() : "-"}</td>
                <td data-label = "Demandeur">{i.demandeurNom || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 🪟 Modale */}
      {selected && (
        <div className="modalo-overlayo" onClick={() => setSelected(null)}>
          <div className="modalo-contento" onClick={(e) => e.stopPropagation()}>
            <h2>Détails de l’intervention {selected.numero}</h2>
            <p><strong>Ligne :</strong> {selected.ligne?.nom || "-"}</p>
            <p><strong>Équipement :</strong> {selected.equipement?.designation || "-"}</p>
            <p><strong>Code Équipement :</strong> {selected.equipement?.code || "-"}</p>
            <p><strong>Description :</strong> {selected.descriptionAnomalie || "-"}</p>
            <p><strong>Demandeur :</strong> {selected.demandeurNom || "-"}</p>
            <p><strong>Date/heure arrêt ligne :</strong> {selected.dateHeureArretLigne ? new Date(selected.dateHeureArretLigne).toLocaleString() : "-"}</p>
            <p><strong>Date/heure redémarrage ligne :</strong> {selected.dateHeureDemarrageLigne ? new Date(selected.dateHeureDemarrageLigne).toLocaleString() : "-"}</p>
            <p><strong>Date/heure arrêt équipement :</strong> {selected.dateHeureArretEquipement ? new Date(selected.dateHeureArretEquipement).toLocaleString() : "-"}</p>
            <p><strong>Date/heure redémarrage équipement :</strong> {selected.dateHeureDemarrageEquipement ? new Date(selected.dateHeureDemarrageEquipement).toLocaleString() : "-"}</p>
            <p><strong>Statut :</strong> {selected.statut}</p>
            <p><strong>Date création :</strong> {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "-"}</p>
            <button className="btn-close" onClick={() => setSelected(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListDi;


