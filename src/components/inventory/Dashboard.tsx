"use client";

import { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { InventoryList } from './InventoryList';
import { StatsCards } from './StatsCards';
import { ExpiryChart } from './ExpiryChart';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddItemModal } from './AddItemModal';
import { getExpiryStatus } from '../../utils/dateUtils';

export const Dashboard = () => {
  const { items, fetchItems, fetchCategories } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [fetchItems, fetchCategories]);

  const expiringItems = items.filter(i => getExpiryStatus(i.expiry_date) === 'expiring' || getExpiryStatus(i.expiry_date) === 'expired');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kitchen Overview</h2>
          <p className="text-gray-500 text-sm">Track and manage your ingredients</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <InventoryList />
        </div>
        <div className="space-y-8">
          <ExpiryChart />
          <div className="bg-white dark:bg-[#1e1e1c] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <h3 className="font-semibold mb-4">Recipe Suggestion</h3>
            {expiringItems.length > 0 ? (
              <div className="p-4 bg-brand-bg-green dark:bg-brand-green/10 rounded-xl border border-brand-green/20">
                <p className="text-sm text-brand-text-green dark:text-brand-green leading-relaxed">
                  You have <strong>{expiringItems.slice(0, 2).map(i => i.item_name).join(' and ')}</strong> {expiringItems.length > 2 ? 'and others ' : ''}expiring soon. 
                  How about a <span className="underline cursor-pointer">{expiringItems[0].item_name} recipe</span>?
                </p>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Everything looks fresh! No immediate recipe suggestions.
                </p>
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full mt-4" disabled={expiringItems.length === 0}>Generate with AI</Button>
          </div>
        </div>
      </div>


      {isModalOpen && <AddItemModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
