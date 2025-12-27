export default function KPICard({title, value, subtitle}){
    return (
    <div className="p-4 bg-white rounded-xl shadow-sm">
    <div className="text-xs font-medium text-gray-500">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
    {subtitle && <div className="text-sm text-gray-400">{subtitle}</div>}
    </div>
    );
    }