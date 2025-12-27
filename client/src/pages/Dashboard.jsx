import React, { useEffect, useState } from 'react';
import API from '../hooks/useApi';
import KPICard from '../components/KPICard';
import MPTable from '../components/MPTable';
import InterventionChart from '../components/InterventionChart';


export default function Dashboard(){
const [kpis,setKpis] = useState({});
const [dueMP,setDueMP] = useState([]);
const [stats,setStats] = useState([]);


useEffect(()=>{ fetchData(); },[]);
async function fetchData(){
const resA = await API.get('/mp/due'); setDueMP(resA.data);
const resB = await API.get('/interventions/stats'); setStats(resB.data);
const resC = await API.get('/stats'); setKpis(resC.data);
}


async function createIntervention(mpId){
await API.post('/mp/create-intervention', { mpId });
fetchData();
}


return (
<div className="p-4 space-y-6">
<div className="grid grid-cols-4 gap-4">
<KPICard title="MP aujourd'hui" value={kpis.mpToday||0} />
<KPICard title="MP retard" value={kpis.mpLate||0} />
<KPICard title="Interv en cours" value={kpis.ipEnCours||0} />
<KPICard title="Terminé ce mois" value={kpis.ipMonth||0} />
</div>


<div>
<h3 className="text-lg font-semibold mb-2">Maintenances dues / en retard</h3>
<MPTable list={dueMP} onCreateIntervention={createIntervention} />
</div>


<div className="grid grid-cols-2 gap-4">
<InterventionChart data={stats} />
{/* timeline / history components here */}
</div>
</div>
);
}