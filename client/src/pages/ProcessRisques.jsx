import React, { useState } from 'react';
import './ProcessRisques.css';

export default function ProcessRisques() {
  const [selectedRisk, setSelectedRisk] = useState(null);

  // Données extraites de votre tableau d'évaluation des risques
  const risquesData = [
    {
      id: 1,
      etape: "Personnel de maintenance",
      risque: "Manque de main d'œuvre qualifié",
      gravite: { niveau: "Grave", val: 4 },
      frequence: { niveau: "Fréquent", val: 4 },
      detectabilite: { niveau: "Détectable", val: 1 },
      risqueBrut: 16,
      niveauPriorite: "P2",
      cibleDetectabilite: { niveau: "Détectable", val: 1 },
      risqueResiduel: 16,
      actions: "* Renforcer le processus de recrutement afin d'attirer et sélectionner des profils qualifiés correspondant aux besoins de l'organisation.\n* Mettre en œuvre des mesures de fidélisation et de motivation des compétences clés afin de réduire le risque de turnover.",
      responsable: "DG / DU / DCRH / DTM",
      delaiOeuvre: "en continue",
      statut: "En cours",
      observation: "Suivi trimestriel des compétences"
    },
    {
      id: 2,
      etape: "Sous-traitants et fournisseurs",
      risque: "La durée d'intervention / fourniture dépassant les délais convenus",
      gravite: { niveau: "Modérée", val: 3 },
      frequence: { niveau: "Rare", val: 2 },
      detectabilite: { niveau: "Détectable", val: 1 },
      risqueBrut: 6,
      niveauPriorite: "P3",
      cibleDetectabilite: { niveau: "Détectable", val: 1 },
      risqueResiduel: 6,
      actions: "* Sensibiliser les fournisseurs et prestataires au respect des délais contractuels et intégrer des engagements de délai dans les contrats/commandes.",
      responsable: "DU / DTM",
      delaiOeuvre: "en continue",
      statut: "Actif",
      observation: "Évaluation annuelle des fournisseurs"
    },
    {
      id: 3,
      etape: "Fournisseurs",
      risque: "Livraison de la pièce non conforme",
      gravite: { niveau: "Intolérable", val: 6 },
      frequence: { niveau: "Très rare", val: 1 },
      detectabilite: { niveau: "Détectable", val: 1 },
      risqueBrut: 6,
      niveauPriorite: "P3",
      cibleDetectabilite: { niveau: "Détectable", val: 1 },
      risqueResiduel: 6,
      actions: "* Renforcer le contrôle de la conformité des pièces livrées par rapport aux spécifications techniques, plans, normes et exigences de la commande.",
      responsable: "DU / DTM",
      delaiOeuvre: "en continue",
      statut: "Actif",
      observation: "Contrôle rigoureux à la réception"
    },
    {
      id: 4,
      etape: "Importation",
      risque: "Blocage ou retard d'importation des pièces de rechange critiques entraînant un dépassement du MTTR objectif",
      gravite: { niveau: "Intolérable", val: 6 },
      frequence: { niveau: "Fréquent", val: 4 },
      detectabilite: { niveau: "Détectable", val: 1 },
      risqueBrut: 24,
      niveauPriorite: "P2",
      cibleDetectabilite: { niveau: "Détectable", val: 1 },
      risqueResiduel: 24,
      actions: "* Prévoir des solutions alternatives d'approvisionnement des pièces critiques en cas de rupture de disponibilité ou de blocage des importations.",
      responsable: "ACHAT",
      delaiOeuvre: "en continue",
      statut: "À surveiller",
      observation: "Constitution d'un stock de sécurité critique"
    }
  ];

  // Fonction pour attribuer une couleur selon le niveau de priorité ou score de risque
  const getPriorityClass = (priority) => {
    switch (priority) {
      case "P1": return "priority-p1";
      case "P2": return "priority-p2";
      case "P3": return "priority-p3";
      default: return "priority-p4";
    }
  };

  return (
    <div className="risques-container">
      {/* En-tête */}
      <header className="risques-header">
        <span className="risques-tag">Analyse des Risques • PRC-MNT-01-V03</span>
        <h1>Matrice d'Évaluation & Plan d'Action</h1>
        <p>Évaluation des risques liés au processus de maintenance, cotation, criticité et mesures préventives.</p>
      </header>

      {/* Grille des Cartes de Risques */}
      <div className="risques-grid">
        {risquesData.map((item) => (
          <div 
            key={item.id} 
            className="risque-card"
            onClick={() => setSelectedRisk(item)}
          >
            <div className="card-header-row">
              <span className="etape-badge">{item.etape}</span>
              <span className={`priority-badge ${getPriorityClass(item.niveauPriorite)}`}>
                Priorité {item.niveauPriorite}
              </span>
            </div>

            <h3 className="risque-title">{item.risque}</h3>

            {/* Cotation du Risque Brut & Résiduel */}
            <div className="cotation-summary">
              <div className="cotation-box brut">
                <span className="c-label">Risque Brut</span>
                <span className="c-val">{item.risqueBrut}</span>
              </div>
              <div className="cotation-box residuel">
                <span className="c-label">Risque Résiduel</span>
                <span className="c-val">{item.risqueResiduel}</span>
              </div>
            </div>

            {/* Plan d'action succinct */}
            <div className="action-preview">
              <span className="action-label">🛠️ Plan d'action :</span>
              <p>{item.actions}</p>
            </div>

            <div className="card-footer-info">
              <span>👤 <strong>Resp:</strong> {item.responsable}</span>
              <span className="status-pill">{item.statut}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modale de détails complète au clic */}
      {selectedRisk && (
        <div className="modal-overlay" onClick={() => setSelectedRisk(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedRisk(null)}>✕</button>
            <span className="modal-subtitle">{selectedRisk.etape}</span>
            <h2>{selectedRisk.risque}</h2>

            <div className="modal-grid-cotation">
              <div className="m-section">
                <h4>Cotation du Risque Brut</h4>
                <p><strong>Gravité :</strong> {selectedRisk.gravite.niveau} ({selectedRisk.gravite.val})</p>
                <p><strong>Fréquence :</strong> {selectedRisk.frequence.niveau} ({selectedRisk.frequence.val})</p>
                <p><strong>Détectabilité :</strong> {selectedRisk.detectabilite.niveau} ({selectedRisk.detectabilite.val})</p>
                <p className="score-highlight">Score Brut : <strong>{selectedRisk.risqueBrut}</strong> (Priorité {selectedRisk.niveauPriorite})</p>
              </div>

              <div className="m-section">
                <h4>Cible & Risque Résiduel[cite: 2]</h4>
                <p><strong>Cible Détectabilité :</strong> {selectedRisk.cibleDetectabilite.niveau} ({selectedRisk.cibleDetectabilite.val})</p>
                <p className="score-highlight residuel">Score Résiduel : <strong>{selectedRisk.risqueResiduel}</strong></p>
              </div>
            </div>

            <div className="modal-section-action">
              <h4>Plan d'Action & Mesures</h4>
              <div className="action-box-full">
                {selectedRisk.actions.split('\n').map((act, i) => (
                  <p key={i}>{act}</p>
                ))}
              </div>
            </div>

            <div className="modal-meta-row">
              <div><strong>Responsable :</strong> {selectedRisk.responsable}</div>
              <div><strong>Délai :</strong> {selectedRisk.delaiOeuvre}</div>
              <div><strong>Statut :</strong> {selectedRisk.statut}</div>
            </div>

            {selectedRisk.observation && (
              <p className="observation-text"><strong>Observation :</strong> {selectedRisk.observation}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}