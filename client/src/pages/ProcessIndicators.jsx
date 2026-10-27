import React, { useState } from 'react';
import './ProcessIndicators.css';

export default function ProcessIndicators() {
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  const indicators = [
    {
      id: 1,
      title: "Taux de réalisation du programme",
      formula: "Opérations de maintenance réalisées / Opérations de maintenance planifiées",
      target: "> 80 %",
      frequency: "Annuelle",
      source: "Planning de la maintenance préventive",
      icon: "🎯",
      badge: "Planification"
    },
    {
      id: 2,
      title: "MTTR (Temps moyen pour réparer)",
      formula: "Somme des temps de réparation / Nombre des réparations",
      target: "≤ 30 minutes",
      frequency: "Mensuelle",
      source: "Bons de dépannage",
      icon: "⏱️",
      badge: "Efficacité"
    },
    {
      id: 3,
      title: "MTBF (Temps moyen entre les pannes)",
      formula: "Somme des temps de bon fonctionnement / Nombre de défaillances",
      target: "≥ 06 Heures",
      frequency: "Mensuelle",
      source: "Bons de dépannage",
      icon: "📈",
      badge: "Fiabilité"
    },
    {
      id: 4,
      title: "Disponibilité des Équipements",
      formula: "Fiabilité = 1/MTSF | Maintenabilité = 1/MTTR | Disponibilité = MTBF / (MTTR + MTBF)",
      target: "≥ 90 %",
      frequency: "Mensuelle",
      source: "MTTR / MTBF",
      icon: "⚡",
      badge: "Performance Globale"
    }
  ];

  return (
    <div className="indicators-container">
      {/* En-tête */}
      <header className="indicators-header">
        <span className="indicators-tag">Tableau de Bord • PRC-MNT-01-V03</span>
        <h1>Indicateurs Clés de Performance (KPI)</h1>
        <p>Suivi, formules de calcul, cibles et sources d'information des indicateurs du processus de maintenance</p>
      </header>

      {/* Grille des indicateurs sous forme de cartes modernes */}
      <div className="indicators-grid">
        {indicators.map((ind) => (
          <div 
            key={ind.id} 
            className="indicator-card"
            onClick={() => setSelectedIndicator(ind)}
          >
            <div className="card-top">
              <span className="card-icon">{ind.icon}</span>
              <span className="card-badge">{ind.badge}</span>
            </div>

            <h3 className="card-title">{ind.title}</h3>
            
            <div className="card-formula-box">
              <span className="formula-label">Formule :</span>
              <p className="formula-text">{ind.formula}</p>
            </div>

            <div className="card-meta">
              <div className="meta-item target">
                <span className="meta-label">Cible</span>
                <span className="meta-value">{ind.target}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Fréquence</span>
                <span className="meta-value">{ind.frequency}</span>
              </div>
            </div>

            <div className="card-source">
              <span>📚 <strong>Source :</strong> {ind.source}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modale de détail (optionnelle au clic) */}
      {selectedIndicator && (
        <div className="modal-overlay" onClick={() => setSelectedIndicator(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedIndicator(null)}>✕</button>
            <span className="modal-icon-large">{selectedIndicator.icon}</span>
            <h2>{selectedIndicator.title}</h2>
            
            <div className="modal-detail-group">
              <h4>Formule mathématique :</h4>
              <p className="highlight-box">{selectedIndicator.formula}</p>
            </div>

            <div className="modal-row">
              <div>
                <strong>Cible visée :</strong>
                <p className="target-pill">{selectedIndicator.target}</p>
              </div>
              <div>
                <strong>Fréquence de suivi :</strong>
                <p>{selectedIndicator.frequency}</p>
              </div>
            </div>

            <div className="modal-detail-group" style={{ marginTop: '16px' }}>
              <strong>Source d'information :</strong>
              <p>{selectedIndicator.source}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}