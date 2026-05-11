import { useStore } from '../../store/useStore';
import { getExpiryStatus, getDaysLeft, getExpiryLabel } from '../../utils/dateUtils';
import { Button } from '../ui/Button';
import { Trash2, Snowflake, Search, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const InventoryList = () => {
  const { items, deleteItem, updateItem } = useStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400';
      case 'expiring': return 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400';
      default: return 'bg-brand-bg-green text-brand-text-green dark:bg-brand-green/20 dark:text-brand-green';
    }
  };

  return (
    <div className="bg-white dark:bg-[#1e1e1c] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
      <div className="p-6 border-b border-gray-50 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-semibold text-lg">Inventory</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 text-sm rounded-lg bg-gray-50 dark:bg-[#2a2a28] border border-gray-100 dark:border-white/5 outline-none focus:ring-2 focus:ring-brand-green transition-all"
            />
          </div>
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
        </div>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-white/5">
        <AnimatePresence>
          {items.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No items found. Start adding some!</p>
            </div>
          ) : (
            items.map((item) => {
              const status = getExpiryStatus(item.expiry_date);
              const days = getDaysLeft(item.expiry_date);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group flex items-center gap-4"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-xl",
                    getStatusColor(status).split(' ')[0]
                  )}>
                    {item.fridge ? '❄️' : '📦'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base truncate">{item.item_name}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{item.category} • {item.quantity}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap",
                      getStatusColor(status)
                    )}>
                      {getExpiryLabel(days)}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => updateItem(item.id, { fridge: !item.fridge })}
                      >
                        <Snowflake className={cn("w-4 h-4", item.fridge ? "text-blue-500" : "text-gray-300")} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

import { Package } from 'lucide-react';
