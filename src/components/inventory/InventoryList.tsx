"use client";

import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { getExpiryStatus, getDaysLeft, getExpiryLabel } from '../../utils/dateUtils';
import { Trash2, Search, Package, Milk, Egg, Utensils, Carrot, Beef, CheckCircle2, AlertOctagon, Archive } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Filter tabs definition — All/Fresh/Expiring/Expired are ACTIVE-only views.
// Consumed and Wasted are archive views.
const FILTERS = ['All', 'Fresh', 'Expiring', 'Expired', 'Consumed', 'Wasted'] as const;
type FilterType = typeof FILTERS[number];

const ACTIVE_FILTERS: FilterType[] = ['All', 'Fresh', 'Expiring', 'Expired'];
const ARCHIVE_FILTERS: FilterType[] = ['Consumed', 'Wasted'];

export const InventoryList = ({ fridgeOnly = false }: { fridgeOnly?: boolean }) => {
  const { items, deleteItem, updateItem } = useStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const getCategoryIcon = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('milk') || cat.includes('dairy')) return <Milk className="w-5 h-5 text-blue-500" />;
    if (cat.includes('egg')) return <Egg className="w-5 h-5 text-yellow-600" />;
    if (cat.includes('veg') || cat.includes('carrot')) return <Carrot className="w-5 h-5 text-orange-500" />;
    if (cat.includes('meat') || cat.includes('chicken') || cat.includes('beef')) return <Beef className="w-5 h-5 text-red-500" />;
    if (cat.includes('fruit') || cat.includes('apple') || cat.includes('banana')) return <span className="text-lg">🍎</span>;
    return <Utensils className="w-5 h-5 text-gray-400" />;
  };

  const getExpiryBadge = (status: string, days: number) => {
    const label = getExpiryLabel(days);
    if (status === 'expired')  return <span className="px-3 py-1 rounded-full bg-red-50    text-red-500    text-[10px] font-bold border border-red-100/50    uppercase">{label}</span>;
    if (status === 'expiring') return <span className="px-3 py-1 rounded-full bg-orange-50  text-orange-500 text-[10px] font-bold border border-orange-100/50 uppercase">{label}</span>;
    return                            <span className="px-3 py-1 rounded-full bg-green-50   text-green-600  text-[10px] font-bold border border-green-100/50  uppercase">{label}</span>;
  };

  // ─── Actions ────────────────────────────────────────────────────────────────

  const handleConsume = async (id: string, name: string) => {
    await updateItem(id, { consumed: true, wasted: false });
    toast.success(`${name} marked as consumed! 🎉`);
  };

  const handleWaste = async (id: string, name: string) => {
    await updateItem(id, { wasted: true, consumed: false });
    toast.error(`${name} marked as wasted.`);
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
    toast.success('Item removed.');
  };

  // ─── Filtering ──────────────────────────────────────────────────────────────
  // Active items = not consumed AND not wasted
  // Archive items = consumed OR wasted

  const matchesSearch = (item: typeof items[0]) =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesFridge = (item: typeof items[0]) =>
    !fridgeOnly || item.fridge;

  const filteredItems = items.filter(item => {
    if (!matchesSearch(item) || !matchesFridge(item)) return false;

    const isActive   = !item.consumed && !item.wasted;
    const status     = getExpiryStatus(item.expiry_date);

    switch (activeFilter) {
      // ── Active filters (only show non-consumed, non-wasted items) ──
      case 'All':      return isActive;
      case 'Fresh':    return isActive && status === 'fresh';
      case 'Expiring': return isActive && status === 'expiring';
      case 'Expired':  return isActive && status === 'expired';
      // ── Archive filters ──
      case 'Consumed': return item.consumed;
      case 'Wasted':   return item.wasted;
      default:         return false;
    }
  });

  const isArchiveView = ARCHIVE_FILTERS.includes(activeFilter as typeof ARCHIVE_FILTERS[number]);

  // ─── Empty state messages ────────────────────────────────────────────────────
  const emptyMessage = () => {
    if (searchQuery) return 'No items found';
    if (activeFilter === 'Consumed') return 'No consumed items yet';
    if (activeFilter === 'Wasted')   return 'No wasted items yet';
    return 'Kitchen Empty';
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="text"
          placeholder="Search all items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 rounded-[1.25rem] bg-white border border-gray-100 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map((f) => {
          const isArchive = ARCHIVE_FILTERS.includes(f as typeof ARCHIVE_FILTERS[number]);
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border uppercase tracking-wider flex items-center gap-1.5",
                f === activeFilter
                  ? isArchive
                    ? "bg-gray-500 text-white border-gray-500 shadow-sm"
                    : "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200"
                  : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
              )}
            >
              {isArchive && <Archive className="w-3 h-3" />}
              {f}
            </button>
          );
        })}
      </div>

      {/* Archive mode banner */}
      {isArchiveView && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-100">
          <Archive className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
            {activeFilter === 'Consumed'
              ? 'Showing consumed items — removed from active inventory'
              : 'Showing wasted items — removed from active inventory'}
          </p>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-16 text-center bg-white rounded-[2rem] border border-gray-100/50 card-shadow"
            >
              <Package className="w-16 h-16 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
                {emptyMessage()}
              </p>
            </motion.div>
          ) : (
            filteredItems.map((item) => {
              const status      = getExpiryStatus(item.expiry_date);
              const days        = getDaysLeft(item.expiry_date);
              const isConsumed  = item.consumed;
              const isWasted    = item.wasted;
              const isDone      = isConsumed || isWasted;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={cn(
                    "bg-white p-4 rounded-[1.75rem] border transition-transform active:scale-[0.99]",
                    isDone
                      ? isConsumed
                        ? "opacity-60 border-blue-50  bg-blue-50/20"
                        : "opacity-50 border-gray-100 bg-gray-50/50"
                      : "border-gray-100/50 card-shadow"
                  )}
                >
                  <div className="flex items-center gap-4">

                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border flex-shrink-0 shadow-inner",
                      isDone ? "bg-gray-100/50 border-gray-100/30" : "bg-gray-50/50 border-gray-100/20"
                    )}>
                      {getCategoryIcon(item.category || item.item_name)}
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={cn(
                          "font-bold text-base truncate",
                          isDone ? "line-through text-gray-400" : "text-gray-700"
                        )}>
                          {item.item_name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold truncate uppercase tracking-widest mt-0.5">
                        {item.category || 'General'} • {item.quantity || 'N/A'}
                      </p>
                    </div>

                    {/* Right-side badge + actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">

                      {/* Status badge */}
                      {isConsumed ? (
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-500 text-[10px] font-bold border border-blue-100/50 uppercase">
                          Done ✓
                        </span>
                      ) : isWasted ? (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold border border-gray-200/50 uppercase">
                          Wasted
                        </span>
                      ) : (
                        getExpiryBadge(status, days)
                      )}

                      {/* Action buttons — only for active items */}
                      <div className="flex items-center gap-1.5">
                        {!isDone && (
                          <>
                            <button
                              onClick={() => handleConsume(item.id, item.item_name)}
                              className="px-2 py-1 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors text-[10px] font-bold uppercase tracking-wide flex items-center gap-1"
                              title="Mark as consumed"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Use
                            </button>
                            <button
                              onClick={() => handleWaste(item.id, item.item_name)}
                              className="px-2 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-wide flex items-center gap-1"
                              title="Mark as wasted"
                            >
                              <AlertOctagon className="w-3 h-3" /> Waste
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
