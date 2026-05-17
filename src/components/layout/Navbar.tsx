"use client";

import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { Leaf, Bell, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, signOut, items } = useStore();
  const [showProfile, setShowProfile] = useState(false);
  
  const expiringCount = items.filter(i => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(i.expiry_date);
    return expiry.getTime() <= today.getTime() + (3 * 24 * 60 * 60 * 1000);
  }).length;

  const initials = user?.email?.substring(0, 3).toUpperCase() || 'USR';

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white border-b border-gray-100/50 py-4 px-6 sticky top-0 z-50">
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
            <div className="px-3 py-1 rounded-full bg-red-50 text-red-500 text-[10px] font-bold border border-red-100/50 flex items-center gap-1.5 uppercase">
              {expiringCount} alerts
            </div>
          )}
          
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs border border-emerald-100 shadow-sm hover:bg-emerald-100 transition-colors"
              title="Profile"
            >
              {initials}
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg p-2 z-50 animate-in fade-in zoom-in duration-200">
                <div className="px-3 py-2 border-b border-gray-50 mb-1">
                  <p className="text-xs font-bold text-gray-800 truncate">{user?.user_metadata?.full_name || 'FreshTrack User'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};


