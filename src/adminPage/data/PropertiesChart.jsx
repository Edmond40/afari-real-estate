import { TrendingUp } from "lucide-react";
import { useContext, useState } from "react";
import { ShopContext } from '../../context/ShopContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const groupOptions = [
    { value: 'status', label: 'Status' },
    { value: 'location', label: 'Location' },
    { value: 'type', label: 'Type' },
    { value: 'agent', label: 'Agent' },
    { value: 'purpose', label: 'Purpose' },
    { value: 'bedrooms', label: 'Bedrooms' },
    { value: 'price-range', label: 'Price Range' }
];

function groupBy(arr, keyFn) {
    return arr.reduce((acc, item) => {
        const key = keyFn(item);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
}

function PropertiesCard(){
    const { properties } = useContext(ShopContext);
    const [group, setGroup] = useState('status');

    let grouped = {};
    if (group === 'status') {
        grouped = groupBy(properties, p => p.propertyType || 'Unknown');
    } else if (group === 'location') {
        grouped = groupBy(properties, p => p.location || 'Unknown');
    } else if (group === 'type') {
        grouped = groupBy(properties, p => p.category || p.purpose || 'Unknown');
    } else if (group === 'agent') {
        grouped = groupBy(properties, p => p.AgentName || 'Unknown');
    } else if (group === 'purpose') {
        grouped = groupBy(properties, p => p.purpose || p.category || 'Unknown');
    } else if (group === 'bedrooms') {
        grouped = groupBy(properties, p => p.bedrooms ? String(p.bedrooms) : 'Unknown');
    } else if (group === 'price-range') {
        grouped = groupBy(properties, p => {
            if (!p.price) return 'Unknown';
            if (p.price < 100000) return '< $100k';
            if (p.price < 200000) return '$100k-$200k';
            if (p.price < 400000) return '$200k-$400k';
            return '>$400k';
        });
    }
    // Convert grouped object to array for recharts
    const chartData = Object.entries(grouped).map(([key, value]) => ({ name: key, count: value }));

    return(
        <div className="bg-gray-100 flex flex-col gap-4 rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-1">
                <TrendingUp size={20}/>
                <h1 className="text-lg font-semibold text-gray-600">Properties Overview</h1>
            </div>
            <div>
                <select
                    name="dropdown"
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                    className="p-2 rounded-md bg-blue-500 text-white text-base font-semibold"
                >
                    {groupOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            <div className="mt-4 h-72 w-full">
                {chartData.length === 0 ? (
                    <div className="text-gray-500">No data available.</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}

export default PropertiesCard;