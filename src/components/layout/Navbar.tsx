"use client";

import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { Leaf, Bell, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, signOut, items } = useStore();
  
  const expiringCount = items.filter(i => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(i.expiry_date);
    return expiry.getTime() <= today.getTime() + (3 * 24 * 60 * 60 * 1000);
  }).length;

  const initials = user?.email?.substring(0, 3).toUpperCase() || 'FET';

  return (
    <nav className="bg-white border-b border-gray-100 py-3 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between max-w-4xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 text-brand-primary">
            <Leaf className="w-full h-full fill-current" />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">
            FreshTrack
          </span>
        </div>

        <div className="flex items-center gap-4">
          {expiringCount > 0 && (
            <div className="px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-semibold border border-red-100 flex items-center gap-1.5">
              {expiringCount} alerts
            </div>
          )}
          
          <div className="flex items-center gap-2 group cursor-pointer relative">
            <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
              {initials}
            </div>
            
            <button 
              onClick={signOut}
              className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

