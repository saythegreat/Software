"use client";

import { useStore } from '../../store/useStore';
import { getExpiryStatus } from '../../utils/dateUtils';
import { motion } from 'framer-motion';

export const StatsCards = () => {
  const { items } = useStore();

  // Only count items that haven't been consumed or wasted
  const activeItems = items.filter(i => !i.consumed && !i.wasted);

  const stats = [
    { 
      label: 'Total', 
      value: activeItems.length, 
      color: 'text-gray-800', 
      bg: 'bg-white' 
    },
    { 
      label: 'Fresh', 
      value: activeItems.filter(i => getExpiryStatus(i.expiry_date) === 'fresh').length, 
      color: 'text-emerald-500', 
      bg: 'bg-white' 
    },
    { 
      label: 'Expiring', 
      value: activeItems.filter(i => getExpiryStatus(i.expiry_date) === 'expiring').length, 
      color: 'text-orange-500', 
      bg: 'bg-white' 
    },
    { 
      label: 'Expired', 
      value: activeItems.filter(i => getExpiryStatus(i.expiry_date) === 'expired').length, 
      color: 'text-red-500', 
      bg: 'bg-white' 
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white p-3.5 rounded-[1.25rem] border border-gray-100/50 flex flex-col items-start card-shadow"
        >
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">{stat.label}</p>
          <h4 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h4>
        </motion.div>
      ))}
    </div>
  );
};
