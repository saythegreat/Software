"use client";

import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { InventoryList } from './InventoryList';
import { StatsCards } from './StatsCards';
import { Button } from '../ui/Button';
import { Plus, List, Refrigerator, LayoutGrid, Bell as BellIcon, UtensilsCrossed } from 'lucide-react';
import { AddItemModal } from './AddItemModal';
import { getExpiryStatus } from '../../utils/dateUtils';
import { cn } from '../../lib/utils';

export const Dashboard = () => {
  const { items, fetchItems, fetchCategories } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Inventory');

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [fetchItems, fetchCategories]);

  const tabs = [
    { name: 'Inventory', icon: List },
    { name: 'My Fridge', icon: Refrigerator },
    { name: 'Categories', icon: LayoutGrid },
    { name: 'Alerts', icon: BellIcon },
    { name: 'Recipes', icon: UtensilsCrossed },
  ];

  const expiringItems = items.filter(i => getExpiryStatus(i.expiry_date) === 'expiring' || getExpiryStatus(i.expiry_date) === 'expired');

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              activeTab === tab.name 
                ? "bg-emerald-50 text-emerald-600 shadow-sm" 
                : "text-gray-400 hover:bg-gray-50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      <StatsCards />

      <div className="flex items-center justify-between gap-4">
         <h2 className="text-xl font-bold text-gray-800">{activeTab}</h2>
         <Button 
           onClick={() => setIsModalOpen(true)}
           className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
         >
           <Plus className="w-4 h-4 mr-2" /> Add item
         </Button>
      </div>

      {activeTab === 'Inventory' && <InventoryList />}
      
      {activeTab === 'Recipes' && (
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 text-center space-y-4">
          <UtensilsCrossed className="w-12 h-12 text-emerald-100 mx-auto" />
          <h3 className="font-bold text-lg">Smart Recipes</h3>
          {expiringItems.length > 0 ? (
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-left">
              <p className="text-emerald-800 text-sm leading-relaxed">
                Based on your expiring <strong>{expiringItems[0].item_name}</strong>, we suggest trying a new healthy dish today!
              </p>
              <Button className="mt-4 bg-emerald-600 w-full rounded-xl text-xs font-bold">Generate Recipe</Button>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Add items expiring soon to see recipe suggestions!</p>
          )}
        </div>
      )}

      {isModalOpen && <AddItemModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

