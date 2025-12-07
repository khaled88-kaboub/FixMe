export default function MPStatusBadge({ statut }) {
    const colors = {
      planifiee: "bg-blue-100 text-blue-600",
      en_cours: "bg-yellow-100 text-yellow-600",
      terminee: "bg-green-100 text-green-600",
      retard: "bg-red-100 text-red-600",
      annulee: "bg-gray-200 text-gray-500",
    };
  
    return (
      <span className={`px-2 py-1 rounded text-sm ${colors[statut]}`}>
        {statut.replace("_", " ")}
      </span>
    );
  }
  