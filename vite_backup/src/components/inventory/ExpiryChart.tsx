import { useStore } from '../../store/useStore';
import { getExpiryStatus } from '../../utils/dateUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const ExpiryChart = () => {
  const { items } = useStore();

  const fresh = items.filter(i => getExpiryStatus(i.expiry_date) === 'fresh').length;
  const expiring = items.filter(i => getExpiryStatus(i.expiry_date) === 'expiring').length;
  const expired = items.filter(i => getExpiryStatus(i.expiry_date) === 'expired').length;

  const data = [
    { name: 'Fresh', value: fresh, color: '#1D9E75' },
    { name: 'Expiring', value: expiring, color: '#f97316' },
    { name: 'Expired', value: expired, color: '#ef4444' },
  ].filter(d => d.value > 0);

  if (items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#1e1e1c] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
      <h3 className="font-semibold mb-4 text-center">Freshness Distribution</h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }} 
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
