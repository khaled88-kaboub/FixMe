// utils/dateUtils.js
import add from "date-fns/add"; // optionnel : si tu utilises date-fns; sinon utiliser JS native

/**
 * Calcule la prochaine date à partir d'une date de référence.
 * @param {Date} fromDate - date de référence (p.ex. dateDerniere ou dateProchaine fournie)
 * @param {String} frequence - "jour"|"semaine"|"mois"|"annee"|"fixe"
 * @param {Number} intervalle - entier >0
 * @returns {Date}
 */
export function computeNextDate(fromDate, frequence, intervalle = 1) {
  if (!fromDate) fromDate = new Date();

  // assure intervalle integer >=1
  const n = Math.max(1, parseInt(intervalle, 10) || 1);
  const d = new Date(fromDate);

  switch(frequence) {
    case "jour":
      d.setDate(d.getDate() + n);
      return d;
    case "semaine":
      d.setDate(d.getDate() + (7 * n));
      return d;
    case "mois":
      {
        const month = d.getMonth();
        d.setMonth(month + n);
        // handle last day overflow automatically by JS Date
        return d;
      }
    case "annee":
      d.setFullYear(d.getFullYear() + n);
      return d;
    case "fixe":
    default:
      // pour 'fixe' on ne modifie pas : l'appelant doit fournir dateProchaine explicitement
      return d;
  }
}
