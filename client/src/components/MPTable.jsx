import React from 'react';
export default function MPTable({list, onCreateIntervention}){
return (
<table className="min-w-full bg-white rounded-lg overflow-hidden">
<thead className="bg-gray-50 text-left"><tr>
<th className="p-2">Num</th><th>Titre</th><th>Equip</th><th>Date Prochaine</th><th>Tech</th><th>Action</th>
</tr></thead>
<tbody>
{list.map(mp=> (
<tr key={mp._id} className="border-t">
<td className="p-2">{mp.numero}</td>
<td className="p-2">{mp.titre}</td>
<td className="p-2">{mp.equipement?.nom || '-'}</td>
<td className="p-2">{new Date(mp.dateProchaine).toLocaleDateString()}</td>
<td className="p-2">{mp.technicienAffecte?.nom || '-'}</td>
<td className="p-2">
<button onClick={()=>onCreateIntervention(mp._id)} className="px-3 py-1 rounded bg-indigo-600 text-white">Créer</button>
</td>
</tr>
))}
</tbody>
</table>
);
}