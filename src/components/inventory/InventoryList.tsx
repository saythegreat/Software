"use client";

import { useStore } from '../../store/useStore';
import { getExpiryStatus, getDaysLeft, getExpiryLabel } from '../../utils/dateUtils';
import { Button } from '../ui/Button';
import { Trash2, Snowflake, Search, Filter, Package, Milk, Egg, Utensils, Carrot, Beef } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const InventoryList = () => {
  const { items, deleteItem, updateItem } = useStore();
  const [filter, setFilter] = (useStore as any).getState().filter || 'all'; // Placeholder if store doesn't have it

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('milk') || cat.includes('dairy')) return <Milk className="w-5 h-5 text-blue-500" />;
    if (cat.includes('egg')) return <Egg className="w-5 h-5 text-yellow-600" />;
    if (cat.includes('veg') || cat.includes('carrot')) return <Carrot className="w-5 h-5 text-orange-500" />;
    if (cat.includes('meat') || cat.includes('chicken') || cat.includes('beef')) return <Beef className="w-5 h-5 text-red-500" />;
    return <Utensils className="w-5 h-5 text-gray-400" />;
  };

  const getStatusBadge = (status: string, days: number) => {
    const label = getExpiryLabel(days);
    switch (status) {
      case 'expired': return <span className="px-3 py-1 rounded-full bg-red-50 text-red-500 text-[10px] font-bold border border-red-100/30 uppercase">{label}</span>;
      case 'expiring': return <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-[10px] font-bold border border-orange-100/30 uppercase">{label}</span>;
      default: return <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold border border-green-100/30 uppercase">{label}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
          <input 
            type="text" 
            placeholder="Search all items..." 
            className="w-full pl-11 pr-4 py-3.5 rounded-[1.25rem] bg-white border border-gray-100 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['All', 'Fresh', 'Expiring', 'Expired'].map((f) => (
            <button
              key={f}
              className={cn(
                "px-5 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border uppercase tracking-wider",
                f === 'All' ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200" : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {items.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-[2rem] border border-gray-100/50 card-shadow">
              <Package className="w-16 h-16 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Kitchen Empty</p>
            </div>
          ) : (
            items.map((item) => {
              const status = getExpiryStatus(item.expiry_date);
              const days = getDaysLeft(item.expiry_date);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white p-4.5 rounded-[1.75rem] border border-gray-100/50 flex items-center gap-5 card-shadow transition-transform active:scale-[0.99]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gray-50/50 flex items-center justify-center border border-gray-100/20 shadow-inner">
                    {getCategoryIcon(item.category || item.item_name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-700 text-base truncate">{item.item_name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold truncate uppercase tracking-widest mt-0.5">
                      {item.category || 'General'} • {item.quantity || 'N/A'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2.5">
                    {getStatusBadge(status, days)}
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateItem(item.id, { notifications_enabled: !item.notifications_enabled })}
                        className={cn(
                          "w-11 h-6 rounded-full transition-all relative p-1.5",
                          item.notifications_enabled ? "bg-emerald-500 shadow-inner shadow-emerald-600/20" : "bg-gray-200"
                        )}
                      >
                        <div className={cn(
                          "w-3 h-3 bg-white rounded-full transition-all shadow-sm",
                          item.notifications_enabled ? "translate-x-5" : "translate-x-0"
                        )} />
                      </button>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="text-gray-200 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

