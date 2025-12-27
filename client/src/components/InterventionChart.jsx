import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
export default function InterventionChart({data}){
const transformed = data.map(d=>({ name: d._id, value: d.count }));
return (
<div className="p-4 bg-white rounded-xl shadow-sm">
<h4 className="mb-2">Statut interventions</h4>
<PieChart width={300} height={220}><Pie data={transformed} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label />
<Tooltip />
</PieChart>
</div>
);
}