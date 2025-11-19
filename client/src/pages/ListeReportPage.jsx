import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./ListeReportPage.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function ListeReportPage() {
  const [rapports, setRapports] = useState([]);
  const [techniciens, setTechniciens] = useState([]); // techniciens importés du backend
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    fetchRapports();
    fetchTechniciens();

    // Fermer le modal si clic à l’extérieur
    const handleClickOutside = (event) => {
      if (showModal && modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  const fetchRapports = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/rapports");
      setRapports(res.data || []);
    } catch (err) {
      console.error("Erreur de chargement :", err);
    }
  };

  const fetchTechniciens = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/techniciens");
      setTechniciens(res.data || []);
    } catch (err) {
      console.error("Erreur chargement techniciens :", err);
    }
  };

  const handleView = (rapport) => {
    // s'assurer que arrays existent pour l'édition
    setSelectedRapport({
      ...rapport,
      piecesRemplacees: rapport.piecesRemplacees ? [...rapport.piecesRemplacees] : [],
      techniciens: rapport.techniciens ? [...rapport.techniciens] : [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedRapport?._id) return;
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/rapports/${selectedRapport._id}`,
        selectedRapport
      );
      setShowModal(false);
      fetchRapports();
    } catch (err) {
      console.error("Erreur de mise à jour :", err);
      alert("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce rapport ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/rapports/${id}`);
      setRapports((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  //Bouton export to Excel/PDF:
  // 🔹 EXPORT EXCEL
const exportToExcel = () => {
  const data = rapports.map((r) => ({
    "Numéro intervention": r.intervention?.numero || "—",
    "Ligne": r.intervention?.ligne?.nom,
    "Equipement" : r.intervention?.equipement?.code,
    "Date": new Date(r.dateIntervention).toLocaleDateString("fr-FR"),
    "Description": r.descriptionTravaux,
    "Techniciens": r.techniciens?.map((t) => t.technicien?.nom).join(", ") || "—",
    "Durée totale (min)": r.techniciens?.reduce((acc, t) => acc + (Number(t.dureeMinutes) || 0), 0),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rapports");
  XLSX.writeFile(wb, "Rapports_Interventions.xlsx");
};

// 🔹 EXPORT PDF
const exportToPDF = () => {
  const doc = new jsPDF();
  doc.text("Liste des rapports d'interventions", 14, 10);

  const tableData = rapports.map((r) => [
    r.intervention?.numero || "—",
    r.intervention?.ligne?.nom,
    r.intervention?.equipement?.code,
    new Date(r.dateIntervention).toLocaleDateString("fr-FR"),
    r.descriptionTravaux,
    r.techniciens?.map((t) => t.technicien?.nom).join(", ") || "—",
    r.techniciens?.reduce((acc, t) => acc + (Number(t.dureeMinutes) || 0), 0),
  ]);

  autoTable(doc, {
    head: [["Numéro","Ligne", "Equipement", "Date", "Description", "Techniciens", "Durée (min)"]],
    body: tableData,
    startY: 20,
  });

  doc.save("Rapports_Interventions.pdf");
};

//...end export
  const handleChange = (field, value) => {
    setSelectedRapport({ ...selectedRapport, [field]: value });
  };

  // Techniciens
  const handleTechnicienChange = (index, field, value) => {
    const updated = [...(selectedRapport.techniciens || [])];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedRapport({ ...selectedRapport, techniciens: updated });
  };

  const handleAddTechnicienRow = () => {
    const updated = [...(selectedRapport.techniciens || [])];
    updated.push({ technicien: { _id: "", nom: "" }, dureeMinutes: 0 });
    setSelectedRapport({ ...selectedRapport, techniciens: updated });
  };

  const handleRemoveTechnicienRow = (index) => {
    const updated = [...(selectedRapport.techniciens || [])];
    updated.splice(index, 1);
    setSelectedRapport({ ...selectedRapport, techniciens: updated });
  };

  // Pièces remplacées
  const handlePieceChange = (index, field, value) => {
    const updated = [...(selectedRapport.piecesRemplacees || [])];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedRapport({ ...selectedRapport, piecesRemplacees: updated });
  };

  const handleAddPiece = () => {
    const updated = [...(selectedRapport.piecesRemplacees || [])];
    updated.push({ nom: "", quantite: 1 });
    setSelectedRapport({ ...selectedRapport, piecesRemplacees: updated });
  };

  const handleRemovePiece = (index) => {
    const updated = [...(selectedRapport.piecesRemplacees || [])];
    updated.splice(index, 1);
    setSelectedRapport({ ...selectedRapport, piecesRemplacees: updated });
  };

  return (
    <div className="rapport-container">
      <div className="rapport-header">
        <h2>
          📋 Liste des rapports d'interventions <span className="rapport-count">({rapports.length})</span>
        </h2>
      </div>
     
      <div className="boutons" >
       <button className="btn-excel" onClick={exportToExcel}>📊 Exporter Excel</button>
       <button className="btn-pdf" onClick={exportToPDF}>📄 Exporter PDF</button>
      </div>

      <table className="rapport-table">
        <thead>
          <tr>
            <th>Numéro d’intervention</th>
            <th>Date</th>
            <th>Description</th>
            <th>Techniciens</th>
            <th>Durée totale</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rapports.length > 0 ? (
            rapports.map((r) => (
              <tr key={r._id}>
                 <td>
                  <div style={{ fontWeight: "600", color: "#1e2a47" }}>
                     {r.intervention?.numero || "—"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#555" }}>
                      Ligne : {r.intervention?.ligne?.nom || "—"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#555" }}>
                      Équipement : {r.intervention?.equipement?.code || "—"}
                  </div>
                </td>
                <td>{new Date(r.dateIntervention).toLocaleDateString("fr-FR")}</td>
                <td>{r.descriptionTravaux}</td>
                <td>{r.techniciens?.map((t) => t.technicien?.nom).join(", ") || "—"}</td>
                <td>
                  {r.techniciens?.reduce((acc, t) => acc + (Number(t.dureeMinutes) || 0), 0)} min
                </td>
                <td>
                  <button className="btn-view" onClick={() => handleView(r)} title="Voir / modifier">Voir / modifier</button>
                  <button className="btn-delete" onClick={() => handleDelete(r._id)} title="Supprimer">Supprimer</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Aucun rapport trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && selectedRapport && (
        <div className="modalo-overlayo">
          <div className="modalo-contento" ref={modalRef}>
            <h3>📝 Modifier le rapport</h3>

            <label>
              Numéro d’intervention :
              <input type="text" value={selectedRapport.intervention?.numero || ""} readOnly />
            </label>

            <label>
              Date d’intervention :
              <input
                type="date"
                value={
                  selectedRapport.dateIntervention
                    ? new Date(selectedRapport.dateIntervention).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => handleChange("dateIntervention", e.target.value)}
              />
            </label>

            <label>
              Description des travaux :
              <textarea
                value={selectedRapport.descriptionTravaux || ""}
                onChange={(e) => handleChange("descriptionTravaux", e.target.value)}
              />
            </label>

            <h4>🧩 Pièces remplacées</h4>
            {selectedRapport.piecesRemplacees?.length > 0 ? (
              selectedRapport.piecesRemplacees.map((p, i) => (
                <div className="row" key={i}>
                  <input
                    type="text"
                    value={p.nom || ""}
                    onChange={(e) => handlePieceChange(i, "nom", e.target.value)}
                    placeholder="Nom de la pièce"
                  />
                  <input
                    type="number"
                    min="1"
                    value={p.quantite || ""}
                    onChange={(e) => handlePieceChange(i, "quantite", Number(e.target.value))}
                    placeholder="Quantité"
                    style={{ width: "90px" }}
                  />
                  <button className="btn-mini" onClick={() => handleRemovePiece(i)} title="Supprimer pièce">✖</button>
                </div>
              ))
            ) : (
              <p>Aucune pièce remplacée</p>
            )}
            <div style={{ marginTop: 8 }}>
              <button className="btn-small" onClick={handleAddPiece}>+ Ajouter une pièce</button>
            </div>

            <h4 style={{ marginTop: 12 }}>👷 Techniciens</h4>
            {selectedRapport.techniciens?.length > 0 ? (
              selectedRapport.techniciens.map((t, i) => (
                <div className="row" key={i}>
                  <select
                    value={t.technicien?._id || ""}
                    onChange={(e) =>
                      handleTechnicienChange(i, "technicien", {
                        _id: e.target.value,
                        nom: techniciens.find((tech) => tech._id === e.target.value)?.nom || "",
                      })
                    }
                  >
                    <option value="">-- Sélectionner --</option>
                    {techniciens.map((tech) => (
                      <option key={tech._id} value={tech._id}>
                        {tech.nom}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="0"
                    value={t.dureeMinutes || ""}
                    onChange={(e) => handleTechnicienChange(i, "dureeMinutes", Number(e.target.value))}
                    placeholder="Durée (min)"
                    style={{ width: "110px" }}
                  />

                  <button className="btn-mini" onClick={() => handleRemoveTechnicienRow(i)} title="Supprimer technicien">✖</button>
                </div>
              ))
            ) : (
              <p>Aucun technicien</p>
            )}
            <div style={{ marginTop: 8 }}>
              <button className="btn-small" onClick={handleAddTechnicienRow}>+ Ajouter technicien</button>
            </div>

            <label style={{ marginTop: 12 }}>
              Commentaires :
              <textarea
                value={selectedRapport.commentaires || ""}
                onChange={(e) => handleChange("commentaires", e.target.value)}
              />
            </label>

            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)}>❌ Fermer</button>
              <button onClick={handleSave} disabled={loading}>
                {loading ? "⏳ Sauvegarde..." : "💾 Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
