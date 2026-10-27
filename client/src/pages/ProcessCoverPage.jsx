import React from 'react';
import './ProcessCoverPage.css'; // Fichier CSS fourni juste en dessous

export default function ProcessCoverPage() {
  // Données extraites directement de votre fichier Excel (page de garde)
  const processData = {
    reference: "PRC-MNT-01-V03",
    sujet: "Ce processus décrit les régles de gestion de la maintenance",
    perimetre: "Ce processus s'applique pour l'ensemble des activités de l'unité Ramy Milk",
    typeProcessus: "Support",
    interactions: {
      enAmont: "Processus Production, Approvisionnement, Direction Générale, SMQ, Contrôle de Qualité",
      enAval: "Processus Direction, Production, Approvisionnement, SMQ"
    },
    finalite: "Veiller sur la disponibilité des équipements et assurer leurs bon fonctionnement",
    pilote: {
      fonction: "Chef de service Méthodes",
      nom: "M. KABOUB Khaled"
    },
    coPilote: {
      fonction: "Chef de Service Utilité",
      nom: "M. CHAOUCHE Ahmed"
    },
    acteur: "L'ensemble des collaborateurs est chargé d'appliquer et de respecter le processus Maintenance",
    ressources: {
      humaine: "Voir le manuel d'organisation",
      materiel: "PDR, outillages des interventions, logiciel de gestion"
    },
    donneesEntree: [
      "Politique Qualité",
      "Plan stratégique",
      "Etat de stock PDR",
      "Bon de dépannage",
      "Permis de travail",
      "exigences des PIP",
      "Planning d'étalonnage"
    ],
    donneesSortie: [
      "Planning annuel de la maintenance préventive",
      "Ordre de travail",
      "Demande de prestation",
      "Demande d'achat PDR",
      "Demande de permis de travail",
      "Objectifs qualité du processus",
      "Satisfaction des PIP",
      "Certificats d'étalonnage"
    ],
    documentsConstructeur: [
      "Constructeurs des machines"
    ]
  };

  return (
    <div className="process-cover-container">
      {/* En-tête de la fiche */}
      <header className="process-header">
        <div className="process-badge">Processus Maintenance</div>
        <h1>Page de Garde</h1>
        <div className="process-ref">
          <span>Référence : <strong>{processData.reference}</strong></span>
          <span className="process-date">Date : 26/05/2022</span>
        </div>
      </header>

      {/* Grille principale des informations générales */}
      <div className="process-grid">
        <div className="process-card">
          <h3>📌 Sujet</h3>
          <p>{processData.sujet}</p>
        </div>

        <div className="process-card">
          <h3>🎯 Périmètre d'application</h3>
          <p>{processData.perimetre}</p>
        </div>

        <div className="process-card">
          <h3>⚙️ Type de processus</h3>
          <span className="badge-support">{processData.typeProcessus}</span>
        </div>

        <div className="process-card">
          <h3>🏆 Finalité</h3>
          <p>{processData.finalite}</p>
        </div>
      </div>

      {/* Responsables (Pilote & Co-Pilote) */}
      <div className="process-section-title">Responsables du Processus</div>
      <div className="process-grid-2">
        <div className="process-card highlight-card">
          <h3>👨‍💼 Pilote</h3>
          <p><strong>Nom :</strong> {processData.pilote.nom}</p>
          <p><strong>Fonction :</strong> {processData.pilote.fonction}</p>
        </div>

        <div className="process-card highlight-card">
          <h3>🤝 Co-Pilote</h3>
          <p><strong>Nom :</strong> {processData.coPilote.nom}</p>
          <p><strong>Fonction :</strong> {processData.coPilote.fonction}</p>
        </div>
      </div>

      {/* Interactions et Acteurs */}
      <div className="process-grid-2">
        <div className="process-card">
          <h3>🔄 Interactions</h3>
          <p><strong>En amont :</strong> {processData.interactions.enAmont}</p>
          <p><strong>En aval :</strong> {processData.interactions.enAval}</p>
        </div>

        <div className="process-card">
          <h3>👥 Acteurs & Ressources</h3>
          <p><strong>Acteurs :</strong> {processData.acteur}</p>
          <p><strong>Ressources Humaines :</strong> {processData.ressources.humaine}</p>
          <p><strong>Ressources Matérielles :</strong> {processData.ressources.materiel}</p>
        </div>
      </div>

      {/* Données d'Entrée et de Sortie */}
      <div className="process-section-title">Flux de Données</div>
      <div className="process-grid-2">
        <div className="process-card flow-card">
          <h3>📥 Données d'Entrée (Interne)</h3>
          <ul>
            {processData.donneesEntree.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="process-card flow-card">
          <h3>📤 Données de Sortie</h3>
          <ul>
            {processData.donneesSortie.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Références Externes */}
      <div className="process-card full-width">
        <h3>📚 Documents Externes</h3>
        <p><strong>Source :</strong> {processData.documentsConstructeur.join(', ')}</p>
      </div>
    </div>
  );
}