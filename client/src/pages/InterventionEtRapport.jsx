import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTools, FaChevronDown, FaChevronUp, FaUser } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto";
import "./InterventionEtRapport.css";

export default function InterventionEtRapport() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [interventions, setInterventions] = useState([]);
  const [rapports, setRapports] = useState([]);
  const [activeTab, setActiveTab] = useState("interventions");
  const [expandedInterventions, setExpandedInterventions] = useState({});
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [filterDemandeur, setFilterDemandeur] = useState("");

  // 🔍 FILTRES
  const [filterNumero, setFilterNumero] = useState("");
  const [filterLigne, setFilterLigne] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // Nouveaux filtres de date de création
  const [filterStartCreate, setFilterStartCreate] = useState("");
  const [filterEndCreate, setFilterEndCreate] = useState("");

  // Nouveaux filtres de plage de numéros
  const [filterNumMin, setFilterNumMin] = useState("");
  const [filterNumMax, setFilterNumMax] = useState("");

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

  //-- graphisme
  const createArretsChart = (statsLignes) => {
    return new Promise((resolve) => {
  
      const canvas = document.createElement("canvas");
      canvas.width = 900;
      canvas.height = 450;
  
      const ctx = canvas.getContext("2d");
  
      const labels = Object.keys(statsLignes);
  
      const durees = Object.values(statsLignes).map(
        l => +(l.dureeMinutes / 60).toFixed(2)
      );
  
      const nbArrets = Object.values(statsLignes).map(
        l => l.nbArrets
      );
  
      new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Durée totale (h)",
              data: durees,
              backgroundColor: "#3498db",
              yAxisID: "y"
            },
            {
              label: "Nombre d'arrêts",
              data: nbArrets,
              type: "line",
              borderColor: "#e74c3c",
              borderWidth: 3,
              yAxisID: "y1"
            }
          ]
        },
        options: {
          responsive: false,
          plugins: {
            title: {
              display: true,
              text: "Analyse des arrêts par ligne"
            }
          },
          scales: {
            y: {
              position: "left",
              title: {
                display: true,
                text: "Durée (heures)"
              }
            },
            y1: {
              position: "right",
              grid: {
                drawOnChartArea: false
              },
              title: {
                display: true,
                text: "Nombre d'arrêts"
              }
            }
          }
        }
      });
  
      setTimeout(() => {
        resolve(canvas.toDataURL("image/png"));
      }, 500);
    });
  };

  //--- fin graphisme
  // ---------------------------------------
  // 🔍 APPLICATION DES FILTRES
  // ---------------------------------------

  const filteredInterventions = interventions.filter((i) => {
    // 1. Recherche textuelle classique sur le numéro
    const numeroMatch = i.numero.toLowerCase().includes(filterNumero.toLowerCase());

    // 2. Filtre par Ligne et Statut
    const ligneMatch = filterLigne ? i.ligne?.nom === filterLigne : true;
    const statusMatch = filterStatus ? i.statut === filterStatus : true;
    const demandeurMatch = filterDemandeur ? i.demandeurNom === filterDemandeur : true; // <-- AJOUT

    // 3. Nouveau Filtre : Plage de Date de Création
    const dateCrea = i.createdAt ? new Date(i.createdAt) : null;
    let startCreateMatch = true;
    let endCreateMatch = true;

    if (filterStartCreate && dateCrea) {
      // Début de journée (00:00:00)
      const start = new Date(filterStartCreate);
      start.setHours(0, 0, 0, 0);
      startCreateMatch = dateCrea >= start;
    }
    if (filterEndCreate && dateCrea) {
      // Fin de journée (23:59:59)
      const end = new Date(filterEndCreate);
      end.setHours(23, 59, 59, 999);
      endCreateMatch = dateCrea <= end;
    }

    // 4. 🔥 CORRECTION : Extraction du compteur numérique final
    let numeroAsNumber = null;
    if (i.numero) {
      // On découpe la chaîne par les tirets "-"
      const parts = i.numero.split("-");
      // On prend la dernière partie (ex: "0001")
      const lastPart = parts[parts.length - 1]; 
      // On la convertit en nombre entier (ex: 1)
      if (lastPart) {
        numeroAsNumber = parseInt(lastPart, 10);
      }
    }
    
    // Comparaison avec les bornes saisies (ex: entre 500 et 700)
    const minNumMatch = filterNumMin 
      ? (numeroAsNumber !== null && !isNaN(numeroAsNumber) && numeroAsNumber >= parseInt(filterNumMin, 10)) 
      : true;

    const maxNumMatch = filterNumMax 
      ? (numeroAsNumber !== null && !isNaN(numeroAsNumber) && numeroAsNumber <= parseInt(filterNumMax, 10)) 
      : true;

    // Inclure demandeurMatch dans le return
    return numeroMatch && ligneMatch && statusMatch && demandeurMatch && startCreateMatch && endCreateMatch && minNumMatch && maxNumMatch;
  });

      // Extraction de toutes les lignes uniques et tous les demandeurs uniques
  const allLines = [...new Set(interventions.map((i) => i.ligne?.nom).filter(Boolean))];
  const allDemandeurs = [...new Set(interventions.map((i) => i.demandeurNom).filter(Boolean))]; // <-- AJOUT

  const getRapportsByIntervention = (id) =>
    rapports.filter((r) => r.intervention?._id === id);
    
    const exportPDF = async () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "A4",
    });
  

      // =========================
  // CALCUL DES STATISTIQUES
  // =========================

  const statsStatut = filteredInterventions.reduce((acc, i) => {
    acc[i.statut] = (acc[i.statut] || 0) + 1;
    return acc;
  }, {});

  const totalInterventions = filteredInterventions.length;

  const totalRapports = rapports.filter(r =>
    filteredInterventions.some(i => i._id === r.intervention?._id)
  ).length;

  const statsLignes = {};

  filteredInterventions.forEach((i) => {
    const ligne = i.ligne?.nom || "Non définie";

    if (!statsLignes[ligne]) {
      statsLignes[ligne] = {
        nbArrets: 0,
        dureeMinutes: 0,
      };
    }

    if (
      i.dateHeureArretLigne &&
      i.dateHeureDemarrageLigne
    ) {
      const debut = new Date(i.dateHeureArretLigne);
      const fin = new Date(i.dateHeureDemarrageLigne);

      statsLignes[ligne].nbArrets += 1;
      statsLignes[ligne].dureeMinutes +=
        (fin - debut) / (1000 * 60);
    }
  });

  const statsDemandeurs = {};

filteredInterventions.forEach((i) => {
  const demandeur = i.demandeurNom || "Non renseigné";

  if (!statsDemandeurs[demandeur]) {
    statsDemandeurs[demandeur] = {
      nbInterventions: 0,
      nbRapports: 0,
    };
  }

  statsDemandeurs[demandeur].nbInterventions++;

  const rapportsAssocies = rapports.filter(
    (r) => r.intervention?._id === i._id
  );

  statsDemandeurs[demandeur].nbRapports += rapportsAssocies.length;
});

    // ---------- HEADER ----------
    const titre = "Demandes Interventions & Rapports";

doc.setFontSize(20);

doc.setFont("helvetica", "bold");
doc.setTextColor(31, 78, 121);

const pageWidth = doc.internal.pageSize.getWidth();
const textWidth = doc.getTextWidth(titre);

const x = (pageWidth - textWidth) / 2;

doc.text(titre, x, 40);
  
    doc.setFontSize(12);
    doc.setTextColor(31, 78, 121);
    doc.text("Date d’export : " + new Date().toLocaleString(), 40, 60);
    
    let y = 90;
  


    doc.setFontSize(18);
doc.setTextColor(0, 0, 0);
//doc.text("TABLEAU DE BORD MAINTENANCE", 40, y);

y += 20;

doc.setFontSize(12);
doc.text("1. Nombre d'interventions VS Nombre de rapports :", 40, y);
doc.setFontSize(18);
y += 20;


autoTable(doc, {
  startY: y,
  head: [["Indicateur", "Valeur"]],
  body: [
    ["Nombre total demandes d'interventions", totalInterventions],
    ["Nombre total de rapports", totalRapports],
  ],
  headStyles: {
    fillColor: [41, 128, 185],
  },
});



y = doc.lastAutoTable.finalY + 25;
doc.setFontSize(12);
doc.text("2. DI & Rapports part shift :", 40, y);

y += 20;
doc.setFontSize(18);
autoTable(doc, {
  startY: y,
  head: [[
    "Demandeur",
    "Nb DI",
    "Nb Rapports",
    "% DI",
    "Taux Rapport"
  ]],
  body: Object.entries(statsDemandeurs)
  .sort((a, b) => b[1].nbInterventions - a[1].nbInterventions)
  .map(([demandeur, data]) => [
    demandeur,
    data.nbInterventions,
    data.nbRapports,
    (
      (data.nbInterventions / totalInterventions) *
      100
    ).toFixed(1) + "%",
    data.nbInterventions > 0
      ? (
          (data.nbRapports /
            data.nbInterventions) *
          100
        ).toFixed(1) + "%"
      : "0%"
  ]),
  theme: "grid",
  headStyles: {
    fillColor: [52, 73, 94],
  },
});


y = doc.lastAutoTable.finalY + 25;
doc.setFontSize(12);
doc.text("3. Rpartition DI par status :", 40, y);
y += 20;
doc.setFontSize(18);



autoTable(doc, {
  startY: y,
  head: [["Statut", "Nombre"]],
  body: Object.entries(statsStatut).map(
    ([statut, nb]) => [statut, nb]
  ),
  headStyles: {
    fillColor: [39, 174, 96],
  },
});


y = doc.lastAutoTable.finalY + 25;
doc.setFontSize(12);
doc.text("4. Tableau des arrets des lignes :", 40, y);
y += 20;
doc.setFontSize(18);




autoTable(doc, {
  startY: y,
  head: [
    [
      "Ligne",
      "Nombre arrêts",
      "Durée totale (min)",
      "Durée totale (h)"
    ]
  ],
  body: Object.entries(statsLignes).map(
    ([ligne, data]) => [
      ligne,
      data.nbArrets,
      data.dureeMinutes.toFixed(0),
      (data.dureeMinutes / 60).toFixed(2)
    ]
  ),
  headStyles: {
    fillColor: [192, 57, 43],
  },
});




doc.addPage();

y = 40;

//y = doc.lastAutoTable.finalY + 25;
doc.setFontSize(12);
doc.text("5. Graphique combiné (nombre et durée) :", 40, y);
y += 20;
doc.setFontSize(18);
//doc.addPage();

const chartImage = await createArretsChart(statsLignes);

doc.addImage(
  chartImage,
  "PNG",
  40,
  y,
  500,
  250
);

y += 280;

doc.addPage();
y = 40;
    // ----------------------------
    // POUR CHAQUE INTERVENTION
    // ----------------------------
    
    doc.setFontSize(12);
    doc.text("6. Détail complet des interventions :)", 40, y);
    y += 30;
    doc.setFontSize(18);

    
    
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
          ["Date & Heure arrêt ligne", i.dateHeureArretLigne ? new Date(i.dateHeureArretLigne).toLocaleString() : ""],
          ["Date & Heure démarrage ligne", i.dateHeureDemarrageLigne ? new Date(i.dateHeureDemarrageLigne).toLocaleString() : ""],
          ["Date & Heure arrêt équipement", i.dateHeureArretEquipement ? new Date(i.dateHeureArretEquipement).toLocaleString() : ""],
          ["Date & Heure démarrage équipement", i.dateHeureDemarrageEquipement ? new Date(i.dateHeureDemarrageEquipement).toLocaleString() : ""],
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
  
          // TABLEAU TECHNICIENS
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
  
          // TABLEAU PIÈCES REMPLACÉES
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
  
      // Séparation
      doc.setDrawColor(180);
      doc.line(30, y, 580, y);
      y += 20;
  
      // NOUVELLE PAGE SI BESOIN
      if (y > 700) {
        doc.addPage();
        y = 40;
      }
    });
  
//numerotation

    const pageCount = doc.internal.getNumberOfPages();

for (let i = 1; i <= pageCount; i++) {
  doc.setPage(i);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);

  doc.text(
    `Rapport Maintenance • Page ${i} sur ${pageCount}`,
    pageWidth / 2,
    pageHeight - 20,
    { align: "center" }
  );
}


    // EXPORT
    doc.save("Rapport_Interventions_Detaille.pdf");
  };
      
  return (
    <div className="p-6">
      <h1 className="textes">
        Liste DI & Rapports
      </h1>

      {/* ---------------------------- */}
      {/* 🔍 BARRE DE FILTRES OPTIMISÉE */}
      {/* ---------------------------- */}
      <div className="filters-container">
        
        {/* 1️⃣ LIGNE DES FILTRES PRINCIPAUX */}
        <div className="filters-main-row">
          


          <div className="filter-group">
            <label className="filter-label">Ligne :</label>
            <select
              className="filter-select-full"
              value={filterLigne}
              onChange={(e) => setFilterLigne(e.target.value)}
            >
              <option value="">Toutes les lignes</option>
              {allLines.map((l, i) => (
                <option key={i} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Statut :</label>
            <select
              className="filter-select-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tous statuts</option>
              <option value="ouvert">Ouvert</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="annule">Annulée</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Demandeur :</label>
            <select
              className="filter-select-full"
              value={filterDemandeur}
              onChange={(e) => setFilterDemandeur(e.target.value)}
            >
              <option value="">Tous les demandeurs</option>
              {allDemandeurs.map((d, index) => (
                <option key={index} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Créé du :</label>
            <input
              type="date"
              className="filter-input"
              value={filterStartCreate}
              onChange={(e) => setFilterStartCreate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Au :</label>
            <input
              type="date"
              className="filter-input"
              value={filterEndCreate}
              onChange={(e) => setFilterEndCreate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">N° Min :</label>
            <input
              type="number"
              placeholder="Ex: 500"
              className="filter-input sub-num"
              value={filterNumMin}
              onChange={(e) => setFilterNumMin(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">N° Max :</label>
            <input
              type="number"
              placeholder="Ex: 700"
              className="filter-input sub-num"
              value={filterNumMax}
              onChange={(e) => setFilterNumMax(e.target.value)}
            />
          </div>


        </div>

       

        {/* 2️⃣ LIGNE DES FILTRES SECONDAIRES (DATES & PLAGES) */}
       

      </div>
      
      <div className="export">
        <button onClick={exportPDF}>
          📄 Export PDF détaillé
        </button>
      </div>

{/* 📊 COMPTEUR DE RÉSULTATS ÉLÉGANT */}
<div className="search-summary">
        <div className="summary-badge">
          <span className="summary-count">{filteredInterventions.length}</span>
          <span className="summary-label">
            {filteredInterventions.length > 1 ? "interventions trouvées" : "intervention trouvée"}
          </span>
        </div>
        <div className="summary-line"></div>
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
                <strong >Ligne :</strong > {i.ligne?.nom}<br/>
                <strong>Équipement :</strong> {i.equipement?.code} — {i.equipement?.designation}<br/>
                <strong>Demandeur :</strong> {i.demandeurNom}<br/>
                <strong>Anomalie :</strong> {i.descriptionAnomalie}<br/>
                <strong className="couleur">--------------------------------------------- </strong><br/>
                <strong>Arrêt Ligne :</strong> {i.ligneAsubiArret ? "Oui " : "Non "} —
                <strong> Date & Heure d'arrêt :</strong> {i.dateHeureArretLigne ? i.dateHeureArretLigne.replace('T', ' ').slice(0, 16) : "......"}<br/>
                <strong>Démarrage Ligne :</strong> {i.ligneAdemarre ? "Oui" : "Non"} — 
                <strong> Date & Heure démarrage :</strong> {i.dateHeureDemarrageLigne ? i.dateHeureDemarrageLigne.replace('T', ' ').slice(0, 16) : "......"}<br/>
                <strong className="couleur">--------------------------------------------- </strong><br/>
                <strong>Arrêt Équipement :</strong> {i.equipementAsubiArret ? "Oui " : "Non "} —
                <strong> Date & Heure d'arrêt :</strong> {i.dateHeureArretEquipement ? i.dateHeureArretEquipement.replace('T', ' ').slice(0, 16) : "......"}<br/>
                <strong>Démarrage Équipement :</strong> {i.equipementAdemarre ? "Oui" : "Non"} — 
                <strong> Date & Heure démarrage :</strong> {i.dateHeureDemarrageEquipement ? i.dateHeureDemarrageEquipement.replace('T', ' ').slice(0, 16) : "......"}<br/>
              </p>
                <strong className="couleur">--------------------------------------------- </strong><br/>
              <p className="text-sm text-gray-500 mt-2">
                📅 Créée le : {new Date(i.createdAt).toLocaleString()}<br />
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
      
      {/* 🟦 MODAL RAPPORT */}
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