import React, { useState } from 'react';
import './ProcessLogigrammePage.css';

export default function ProcessLogigrammePage() {
  const [selectedNode, setSelectedNode] = useState(null);

  // Étapes du logigramme de maintenance
  const flowchartNodes = [
    {
      id: 1,
      step: "01",
      title: "Détection de l'Anomalie",
      actor: "Production / Opérateur",
      description: "Constat d'une défaillance ou d'une anomalie sur l'équipement de la ligne.",
      type: "start",
      icon: "🚨"
    },
    {
      id: 2,
      step: "02",
      title: "Émission du Bon de Dépannage (BD)",
      actor: "Chef d'équipe Production",
      description: "Création et transmission du bon de dépannage ou de la demande d'intervention.",
      type: "process",
      icon: "📝"
    },
    {
      id: 3,
      step: "03",
      title: "Analyse & Planification de l'Intervention",
      actor: "Service Méthodes / Maintenance",
      description: "Évaluation de la criticité, affectation des techniciens et préparation des pièces de rechange (PDR).",
      type: "process",
      icon: "⚙️"
    },
    {
      id: 4,
      step: "04",
      title: "Consignation & Permis de Travail",
      actor: "Maintenance / HSE",
      description: "Vérification des règles de sécurité, consignation électrique/mécanique et validation du permis de travail.",
      type: "decision",
      icon: "🛡️"
    },
    {
      id: 5,
      step: "05",
      title: "Exécution de la Réparation",
      actor: "Techniciens Maintenance",
      description: "Intervention sur machine, diagnostic approfondi, réparation ou remplacement des composants défectueux.",
      type: "process",
      icon: "🔧"
    },
    {
      id: 6,
      step: "06",
      title: "Essais & Remise en Service",
      actor: "Production & Maintenance",
      description: "Tests de bon fonctionnement en charge et validation conjointe de la conformité.",
      type: "decision",
      icon: "✅"
    },
    {
      id: 7,
      step: "07",
      title: "Clôture & Mise à Jour GMAO",
      actor: "Responsable Méthodes Maintenance",
      description: "Saisie des temps d'arrêt, clôture de l'ordre de travail et calcul des KPI (MTTR, MTBF, Disponibilité).",
      type: "end",
      icon: "📊"
    }
  ];

  return (
    <div className="flowchart-container">
      {/* En-tête */}
      <header className="flowchart-header">
        <span className="flowchart-badge">Logigramme Officiel • PRC-MNT-01-V03</span>
        <h1>Processus de Gestion de la Maintenance</h1>
        <p>Cliquez sur une étape pour afficher les détails complets des responsabilités et des flux.</p>
      </header>

      {/* Arbre / Flux du Logigramme */}
      <div className="flowchart-pipeline">
        {flowchartNodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <div 
              className={`flow-card ${node.type} ${selectedNode?.id === node.id ? 'active' : ''}`}
              onClick={() => setSelectedNode(node)}
            >
              <div className="flow-card-top">
                <span className="step-number">{node.step}</span>
                <span className="step-icon">{node.icon}</span>
              </div>
              <div className="flow-card-body">
                <span className="step-actor">{node.actor}</span>
                <h3>{node.title}</h3>
                <p>{node.description}</p>
              </div>
            </div>

            {/* Flèche de liaison entre les étapes */}
            {index < flowchartNodes.length - 1 && (
              <div className="flow-arrow">
                <div className="arrow-line"></div>
                <div className="arrow-head">▼</div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Panneau de détails dynamique */}
      {selectedNode && (
        <div className="flow-modal-overlay" onClick={() => setSelectedNode(null)}>
          <div className="flow-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedNode(null)}>✕</button>
            <div className="modal-icon">{selectedNode.icon}</div>
            <span className="modal-step">Étape {selectedNode.step}</span>
            <h2>{selectedNode.title}</h2>
            <p><strong>Acteur responsable :</strong> {selectedNode.actor}</p>
            <p><strong>Description détaillée :</strong> {selectedNode.description}</p>
            <div className="modal-footer">
              <span className="tag-type">Type : {selectedNode.type.toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}