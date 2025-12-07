// cron/maintenanceCron.js
import cron from "node-cron";
import MaintenancePreventive from "../models/MaintenancePreventive.js";
import InterventionP from "../models/InterventionP.js"; // si tu as un modèle intervention
import { computeNextDate } from "../models/utils/dateUtils.js";

export default function startMaintenanceCron(io) {
  console.log("⏳ CRON de maintenance préventive initialisé...");

  


  // --- SCHEDULE : Tous les jours à 00h05 ---
  cron.schedule("* * * * *", async () => {
    console.log("🔍 CRON : Vérification des maintenances préventives...");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setDate(today.getDate() );
    today.setHours(0, 0, 0, 0);

    // Récupérer les MP dont la dateProchaine est aujourd'hui ou dépassée
    const dueList = await MaintenancePreventive.find({
      dateProchaine: { $lte: today },
      statut: { $ne: "terminee" }
    }).populate("equipement ligne technicienAffecte.technicien");

    if (dueList.length === 0) {
      console.log("➡️ Aucune maintenance à générer aujourd'hui.");
      return;
    }

    console.log(`⚠️ ${dueList.length} maintenances arrivent à échéance !`);

    for (const mp of dueList) {
      // 🔧 1) Générer automatiquement une intervention

      // Transformer correctement le tableau technicienAffecte
      const techniciensPourIntervention = mp.technicienAffecte?.map(t => ({
      technicien: t.technicien._id, // référence au technicien
      duree: t.duree || 0           // durée associée
      })) || [];
      const interventionP = new InterventionP({
        titre: `Maintenance préventive : ${mp.titre}`,
        equipement: mp.equipement?._id,
        ligne: mp.ligne?._id,
        type: "préventive",
        maintenanceLiee: mp._id,
        statut: "planifiee",
        technicienAffecte: techniciensPourIntervention,
        datePlanifiee: mp.dateProchaine
      });

      await interventionP.save();

      // 🔁 2) Mettre à jour le MP
      mp.dateDerniere = mp.dateProchaine;
      mp.dateProchaine = computeNextDate(mp.dateProchaine, mp.frequence, mp.intervalle);
      await mp.save();

      // 🔔 3) Envoyer une notification temps réel
      io.emit("mp_due", {
        message: `Maintenance préventive due : ${mp.titre}`,
        interventionPId: mp._id,
        equipement: mp.equipement?.designation,
        ligne: mp.ligne?.nom,
        Date: mp.dateProchaine,
      });

      console.log(`➡️ Intervention générée pour : ${mp.titre}`);
    }
  });
}
