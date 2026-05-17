"use client";

import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface AddItemModalProps {
  onClose: () => void;
}

export const AddItemModal = ({ onClose }: AddItemModalProps) => {
  const { addItem } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    category: 'Dairy',
    quantity: '',
    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fridge: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addItem(formData);
      toast.success('Item added successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#1e1e1c] text-gray-900 dark:text-gray-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5"
      >
        <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Item</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><X className="w-5 h-5" /></Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Item Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Greek Yogurt"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#2a2a28] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#2a2a28] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
              >
                <option value="Dairy">Dairy</option>
                <option value="Meat">Meat</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Beverages">Beverages</option>
                <option value="Snacks">Snacks</option>
                <option value="Cooked">Cooked</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Quantity</label>
              <input
                type="text"
                placeholder="e.g. 500g, 2L"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#2a2a28] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Expiry Date</label>
            <input
              type="date"
              required
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#2a2a28] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-green [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#2a2a28] cursor-pointer hover:bg-gray-100 dark:hover:bg-[#323230] transition-colors">
            <input
              type="checkbox"
              checked={formData.fridge}
              onChange={(e) => setFormData({ ...formData, fridge: e.target.checked })}
              className="w-5 h-5 accent-brand-green"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Store in Fridge ❄️</span>
          </label>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1 bg-white dark:bg-[#1e1e1c] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2a2a28]" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-brand-green text-white hover:bg-emerald-600" isLoading={loading}>Save Item</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
