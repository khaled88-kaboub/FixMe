// controllers/maintenancePreventive.controller.js
import MaintenancePreventive from "../models/MaintenancePreventive.js";
import { computeNextDate } from "../models/utils/dateUtils.js";



/**
 * Génère toutes les occurrences (ex : prochaine maintenance chaque mois)
 */
function generateOccurrences(mp) {
  const result = [];

  const startRange = new Date();
  startRange.setFullYear(startRange.getFullYear() - 1); // -1 an
  startRange.setHours(0, 0, 0, 0);

  const endRange = new Date();
  endRange.setFullYear(endRange.getFullYear() + 1); // +1 an
  endRange.setHours(23, 59, 59, 999);

  // point de départ = dateDebut
  let current = new Date(mp.dateDebut);

  while (current <= endRange) {
    const start = new Date(current);

    if (start >= startRange) {
      const end = new Date(start);
      end.setHours(end.getHours() + 2);

      result.push({
        id: mp._id + "_" + start.toISOString(),
        mpId: mp._id,
        title: mp.titre,
        ligne: mp.ligne,
        statut: mp.statut,
        equipement: mp.equipement,
        start,
        end
      });
    }

    // prochaine date
    current = computeNextDate(current, mp.frequence, mp.intervalle);
  }

  return result;
}



/**
 * CREATE MP — Version corrigée avec dateDebut
 */
export const createMP = async (req, res) => {
  try {
    const payload = req.body;
    console.log("Payload envoyé :", payload);

    // ⭐ Validation obligatoire
    if (!payload.titre || !payload.equipement || !payload.frequence || !payload.dateDebut) {
      return res.status(400).json({
        message: "titre, equipement, frequence et dateDebut sont requis"
      });
    }

    // ⭐ Forcer la dateDebut en Date()
    const dateDebut = new Date(payload.dateDebut);

    // ⭐ dateProchaine = dateDebut si non fournie
    if (!payload.dateProchaine) {
      payload.dateProchaine = dateDebut;
    } else {
      // si dateProchaine est fournie, on la normalise
      payload.dateProchaine = new Date(payload.dateProchaine);
    }

    const mp = new MaintenancePreventive(payload);
    await mp.save();

    return res.status(201).json(mp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Erreur serveur" });
  }
};


/**
 * GET ALL
 */
export const getAllMP = async (req, res) => {
  try {
    const filter = {};

    if (req.query.statut) filter.statut = req.query.statut;
    if (req.query.equipement) filter.equipement = req.query.equipement;
    if (req.query.ligne) filter.ligne = req.query.ligne;

    const list = await MaintenancePreventive.find(filter)
      .populate("equipement ligne technicienAffecte historique.technicien")
      .sort({ dateProchaine: 1 });

    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


/**
 * GET BY ID
 */
export const getMPById = async (req, res) => {
  try {
    const mp = await MaintenancePreventive.findById(req.params.id)
      .populate("equipement ligne technicienAffecte historique.technicien");

    if (!mp) return res.status(404).json({ message: "Non trouvé" });
    return res.json(mp);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


/**
 * UPDATE MP — adapté à dateDebut
 */
export const updateMP = async (req, res) => {
  try {
    const updates = req.body;
    const mp = await MaintenancePreventive.findById(req.params.id);

    if (!mp) return res.status(404).json({ message: "Non trouvé" });

    // ⭐ Mise à jour simple
    Object.assign(mp, updates);

    // ⭐ Normalisation des dates si modifiées
    if (updates.dateDebut) mp.dateDebut = new Date(updates.dateDebut);
    if (updates.dateProchaine) mp.dateProchaine = new Date(updates.dateProchaine);

    /**
     * ⭐ Recalcul des dates
     * - si dateDerniere modifiée → recalcul dateProchaine
     * - sinon, si dateDebut modifiée → aligner dateProchaine = dateDebut
     */
    if (updates.dateDerniere) {
      const d = new Date(updates.dateDerniere);
      mp.dateProchaine = computeNextDate(d, mp.frequence, mp.intervalle);
    }
    else if (updates.dateDebut && !updates.dateProchaine) {
      mp.dateProchaine = mp.dateDebut;
    }

    await mp.save();
    return res.json(mp);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


/**
 * DELETE
 */
export const deleteMP = async (req, res) => {
  try {
    const mp = await MaintenancePreventive.findByIdAndDelete(req.params.id);
    if (!mp) return res.status(404).json({ message: "Non trouvé" });

    return res.json({ message: "Supprimé" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


/**
 * MARK AS DONE — compatible dateDebut
 */
export const markAsDone = async (req, res) => {
  try {
    const { id } = req.params;
    const { technicien, commentaire, dureeReelle, interventionLiee, realiseLe } = req.body;

    const mp = await MaintenancePreventive.findById(id);
    if (!mp) return res.status(404).json({ message: "Non trouvé" });

    const dateReal = realiseLe ? new Date(realiseLe) : new Date();

    // historique
    mp.historique.push({
      dateRealisation: dateReal,
      technicien,
      commentaire,
      dureeReelle,
      interventionLiee
    });

    mp.dateDerniere = dateReal;

    // ⭐ recalcul
    if (mp.frequence !== "fixe") {
      mp.dateProchaine = computeNextDate(dateReal, mp.frequence, mp.intervalle);
    }

    mp.statut = "terminee";
    await mp.save();

    return res.json(mp);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET — occurrences pour calendrier
 */
export const getMPForCalendar = async (req, res) => {
  try {
    const list = await MaintenancePreventive.find()
      .populate("equipement ligne");

    let events = [];

    list.forEach(mp => {
      const occurrences = generateOccurrences(mp, 12);
      events.push(...occurrences);
    });

    return res.json(events);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

