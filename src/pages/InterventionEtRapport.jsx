import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTools, FaChevronDown, FaChevronUp, FaUser } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "./InterventionEtRapport.css";

export default function InterventionEtRapport() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [interventions, setInterventions] = useState([]);
  const [rapports, setRapports] = useState([]);
  const [activeTab, setActiveTab] = useState("interventions");
  const [expandedInterventions, setExpandedInterventions] = useState({});
  const [selectedRapport, setSelectedRapport] = useState(null);

  // 🔍 FILTRES
  const [filterNumero, setFilterNumero] = useState("");
  const [filterLigne, setFilterLigne] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  useEffect(() => {
    loadInterventions();
    loadRapports();
  }, []);

  const loadInterventions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/interventions`);
      if (Array.isArray(res.data)) setInterventions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRapports = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/rapports`);
      if (Array.isArray(res.data)) setRapports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getTotalTempsTechniciens = (rapport) => {
    if (!rapport?.techniciens?.length) return 0;
    return rapport.techniciens.reduce((sum, t) => sum + (t.dureeMinutes || 0), 0);
  };

  const toggleAccordion = (id) => {
    setExpandedInterventions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // ---------------------------------------
  // 🔍 APPLICATION DES FILTRES
  // ---------------------------------------

  const filteredInterventions = interventions.filter((i) => {
    const numeroMatch = i.numero.toLowerCase().includes(filterNumero.toLowerCase());

    const ligneMatch = filterLigne ? i.ligne?.nom === filterLigne : true;

    const statusMatch = filterStatus ? i.statut === filterStatus : true;

    const dateInter = i.dateHeureArretLigne ? new Date(i.dateHeureArretLigne) : null;

    const startMatch = filterStart ? dateInter >= new Date(filterStart) : true;
    const endMatch = filterEnd ? dateInter <= new Date(filterEnd) : true;

    return numeroMatch && ligneMatch && statusMatch && startMatch && endMatch;
  });

  const allLines = [...new Set(interventions.map((i) => i.ligne?.nom))];

  const statutRapportColor = (statut) => {
    switch (statut) {
      case "ouvert": return "bg-red-500 text-white";
      case "en_cours": return "bg-yellow-500 text-black";
      case "termine": return "bg-green-600 text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  const getRapportsByIntervention = (id) =>
    rapports.filter((r) => r.intervention?._id === id);
    const exportPDF = () => {
       
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "A4",
        });
      
        // ---------- HEADER ----------
        doc.setFontSize(20);
        doc.text("Rapport complet – Interventions & Rapports", 40, 40);
      
        doc.setFontSize(12);
        doc.text("Date d’export : " + new Date().toLocaleString(), 40, 60);
      
        let y = 90;
      
        // ----------------------------
        // POUR CHAQUE INTERVENTION
        // ----------------------------
      
        filteredInterventions.forEach((i, index) => {
          const rapportsAssocies = getRapportsByIntervention(i._id);
      
          // TITRE INTERVENTION
          doc.setFontSize(15);
          doc.setTextColor(0, 0, 150);
          doc.text(`Intervention : ${i.numero}`, 40, y);
          y += 20;
      
          // TABLEAU DETAIL INTERVENTION
          autoTable(doc, {
            startY: y,
            head: [["Champ", "Valeur"]],
            body: [
              ["Ligne", i.ligne?.nom || ""],
              ["Équipement", (i.equipement?.code || "") + " - " + (i.equipement?.designation || "")],
              ["Demandeur", i.demandeurNom || ""],
              ["Statut", i.statut || ""],
              ["Anomalie", i.descriptionAnomalie || ""],
              ["Date & Heure arret ligne", new Date(i.dateHeureArretLigne).toLocaleString()],
              ["Date & Heure démarrage ligne", new Date(i.dateHeureDémarrageLigne).toLocaleString()],
              ["Date & Heure arret équipement", new Date(i.dateHeureArretEquipement).toLocaleString()],
              ["Date & Heure démarrage équipement", new Date(i.dateHeureDémarrageEquipement).toLocaleString()],
              
              ["Date création", new Date(i.createdAt).toLocaleString()],
            ],
            theme: "striped",
            headStyles: { fillColor: [30, 70, 130] },
          });
      
          y = doc.lastAutoTable.finalY + 20;
      
          // ==============================
          // RAPPORTS ASSOCIÉS
          // ==============================
          if (rapportsAssocies.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(0, 120, 0);
            doc.text("Rapports associés :", 40, y);
            y += 15;
      
            rapportsAssocies.forEach((r, idx) => {
              const total = getTotalTempsTechniciens(r);
      
              autoTable(doc, {
                startY: y,
                head: [["Champ", "Valeur"]],
                body: [
                  ["Date", new Date(r.dateIntervention).toLocaleString()],
                  ["Travaux exécutés", r.descriptionTravaux || ""],
                  ["Temps total techniciens", total + " min"],
                  ["Commentaires", r.commentaires || ""],
                ],
                theme: "grid",
                headStyles: { fillColor: [10, 120, 10] },
              });
      
              y = doc.lastAutoTable.finalY + 10;
      
              // ---------------------------
              // TABLEAU TECHNICIENS
              // ---------------------------
              if (r.techniciens?.length > 0) {
                autoTable(doc, {
                  startY: y,
                  head: [["Technicien", "Durée (min)"]],
                  body: r.techniciens.map((t) => [
                    `${t.technicien?.nom || ""} ${t.technicien?.prenom || ""}`,
                    t.dureeMinutes,
                  ]),
                  theme: "striped",
                  headStyles: { fillColor: [150, 50, 50] },
                });
                y = doc.lastAutoTable.finalY + 10;
              }
      
              // ---------------------------
              // TABLEAU PIÈCES REMPLACÉES
              // ---------------------------
              if (r.piecesRemplacees?.length > 0) {
                autoTable(doc, {
                  startY: y,
                  head: [["Pièce", "Quantité"]],
                  body: r.piecesRemplacees.map((p) => [
                    p.nom,
                    p.quantite,
                  ]),
                  theme: "striped",
                  headStyles: { fillColor: [70, 70, 140] },
                });
                y = doc.lastAutoTable.finalY + 20;
              }
            });
          }
      
          // Ajout de séparation entre interventions
          doc.setDrawColor(180);
          doc.line(30, y, 580, y);
          y += 20;
      
          // NOUVELLE PAGE SI BESOIN
          if (y > 700) {
            doc.addPage();
            y = 40;
          }
        });
      
        // EXPORT
        doc.save("Rapport_Interventions_Detaille.pdf");
      };
      
  return (
    <div className="p-6">
      <h1 className="textes">
        Liste DI & Rapports
      </h1>

      {/* ---------------------------- */}
      {/* 🔍 BARRE DE FILTRES */}
      {/* ---------------------------- */}

      <div className="filters-container">
        <input
          type="text"
          placeholder="Rechercher par numéro..."
          className="filter-input"
          value={filterNumero}
          onChange={(e) => setFilterNumero(e.target.value)}
        />

        <select
          className="filter-select"
          value={filterLigne}
          onChange={(e) => setFilterLigne(e.target.value)}
        >
          <option value="">Toutes les lignes</option>
          {allLines.map((l, i) => (
            <option key={i} value={l}>{l}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tous statuts</option>
          <option value="ouvert">Ouvert</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="annule">Annulée</option>
        </select>

        <input
          type="date"
          className="filter-input"
          value={filterStart}
          onChange={(e) => setFilterStart(e.target.value)}
        />

        <input
          type="date"
          className="filter-input"
          value={filterEnd}
          onChange={(e) => setFilterEnd(e.target.value)}
        />
      </div>
      
      <div className="export">
      <button
         
         onClick={exportPDF}
        
      >
       📄 Export PDF détaillé
      </button>
      </div>

      {/* -------------------------------- */}
      {/* 🛠️ LISTE DES INTERVENTIONS FILTRÉES */}
      {/* -------------------------------- */}

      <div className="ens">
        {filteredInterventions.map((i) => {
          const rapportsAssocies = getRapportsByIntervention(i._id);
          const isExpanded = expandedInterventions[i._id];

          return (
            <div key={i._id} className="cardo">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                  <FaTools /> {i.numero}
                </h2>
                <span className={`statut-tag statut-${i.statut}`}>
                  {i.statut}
                </span>
              </div>

              <p className="mt-3 text-gray-700 leading-relaxed">
                  <strong>Ligne :</strong> {i.ligne?.nom}<br/>
                  <strong>Équipement :</strong> {i.equipement?.code} — {i.equipement?.designation}<br/>
                  <strong>Demandeur :</strong> {i.demandeurNom}<br/>
                  <strong>Anomalie :</strong> {i.descriptionAnomalie}<br/>
                  <strong>--------------------------------------------- </strong><br/>
                  <strong>Arret Ligne :</strong> {i.ligneAsubiArret ? "Oui " : "Non "} —
                  <strong> Date & Heure d'arret :</strong> {i.dateHeureArretLigne ? new Date(i.dateHeureArretLigne).toLocaleString() : "......"}<br/>
                  <strong>Démarrage Ligne :</strong> {i.ligneAdemarre ? "Oui" : "Non"} — 
                  <strong> Date & Heure démarrage :</strong> {i.dateHeureDemarrageLigne ? new Date(i.dateHeureDemarrageLigne).toLocaleString() : "......"}<br/>
                  <strong>--------------------------------------------- </strong><br/>
                  <strong>Arret Equipement :</strong> {i.equipementAsubiArret ? "Oui " : "Non "} —
                  <strong> Date & Heure d'arret :</strong> {i.dateHeureArretEquipement ? new Date(i.dateHeureArretEquipement).toLocaleString() : "......"}<br/>
                  <strong>Démarrage Equipement :</strong> {i.EquipementAdemarre ? "Oui" : "Non"} — 
                  <strong> Date & Heure démarrage :</strong> {i.dateHeureDemarrageEquipement ? new Date(i.dateHeureDemarrageEquipement).toLocaleString() : "......"}<br/>
                  
                  </p>

              <p className="text-sm text-gray-500 mt-2">
                📅 Créée le : {new Date(i.dateHeureArretLigne).toLocaleString()}<br />
                <FaUser /> Créée par : {i.demandeurNom}
              </p>

              {rapportsAssocies.length > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => toggleAccordion(i._id)}
                    className="button button-toggle flex items-center gap-2"
                  >
                    {isExpanded ? "Cacher rapports" : "Voir rapports"}
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </button>

                  <div className={`accordion-content ${isExpanded ? "show" : ""}`}>
                    <div className="timeline">
                      {rapportsAssocies.map((r) => {
                        const total = getTotalTempsTechniciens(r);

                        return (
                          <div key={r._id} className="timeline-item">
                            <p><strong>📅 Date :</strong> {new Date(r.dateIntervention).toLocaleString()}</p>
                            <p><strong>🔧 Travaux :</strong> {r.descriptionTravaux}</p>
                            <p><strong>👨‍🔧 Temps total :</strong> {total} min</p>

                            <button
                              onClick={() => setSelectedRapport(r)}
                              className="button button-blue mt-2"
                            >
                              Voir détails →
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      
      {/* ---------------------------- */}
      {/* 🟦 MODAL RAPPORT */}
      {/* ---------------------------- */}

      {selectedRapport && (
        <div className="modalo-overlayo">
          <div className="modalo-contento" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">
              Rapport – {selectedRapport.intervention?.numero}
            </h2>

            <div className="timeline">
              <div className="timeline-item">
                <p><strong>📅 Date :</strong></p>
                <p>{new Date(selectedRapport.dateIntervention).toLocaleString()}</p>
              </div>

              <div className="timeline-item">
                <p><strong>🔧 Travaux exécutés :</strong></p>
                <p>{selectedRapport.descriptionTravaux}</p>
              </div>

              {selectedRapport.techniciens?.length > 0 && (
                <div className="timeline-item">
                  <p><strong>👨‍🔧 Techniciens :</strong></p>
                  <ul>
                    {selectedRapport.techniciens.map((t) => (
                      <li key={t._id}>
                        👨‍🔧 {t.technicien?.nom} {t.technicien?.prenom} — {t.dureeMinutes} min
                      </li>
                    ))}
                  </ul>
                  <p className="font-bold mt-2">
                    ⏱️ Total : {getTotalTempsTechniciens(selectedRapport)} min
                  </p>
                </div>
              )}

              {selectedRapport.piecesRemplacees?.length > 0 && (
                <div className="timeline-item">
                  <p><strong>🧩 Pièces remplacées :</strong></p>
                  <ul>
                    {selectedRapport.piecesRemplacees.map((p) => (
                      <li key={p._id}>
                        🧩 {p.nom} — {p.quantite} pièces
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="timeline-item">
                <p><strong>✔️ Commentaires :</strong></p>
                <p>{selectedRapport.commentaires}</p>
              </div>
            </div>

            <button
              className="close-button"
              onClick={() => setSelectedRapport(null)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
