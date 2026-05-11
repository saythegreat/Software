import { useStore } from '../../store/useStore';
import { getExpiryStatus } from '../../utils/dateUtils';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const StatsCards = () => {
  const { items } = useStore();

  const stats = [
    { 
      label: 'Total Items', 
      value: items.length, 
      icon: Package, 
      color: 'bg-blue-500', 
      bg: 'bg-blue-50 dark:bg-blue-500/10' 
    },
    { 
      label: 'Fresh', 
      value: items.filter(i => getExpiryStatus(i.expiry_date) === 'fresh').length, 
      icon: CheckCircle, 
      color: 'bg-brand-green', 
      bg: 'bg-brand-bg-green dark:bg-brand-green/10' 
    },
    { 
      label: 'Expiring Soon', 
      value: items.filter(i => getExpiryStatus(i.expiry_date) === 'expiring').length, 
      icon: Clock, 
      color: 'bg-orange-500', 
      bg: 'bg-orange-50 dark:bg-orange-500/10' 
    },
    { 
      label: 'Expired', 
      value: items.filter(i => getExpiryStatus(i.expiry_date) === 'expired').length, 
      icon: AlertTriangle, 
      color: 'bg-red-500', 
      bg: 'bg-red-50 dark:bg-red-500/10' 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-[#1e1e1c] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          <h4 className="text-2xl font-bold mt-1">{stat.value}</h4>
        </motion.div>
      ))}
    </div>
  );
};
