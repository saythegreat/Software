"use client";

import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { Leaf, Bell, LogOut, User as UserIcon, Edit2, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const Navbar = () => {
  const { user, setUser, signOut, items } = useStore();
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.user_metadata?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
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

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: newName.trim() }
      });
      if (error) throw error;
      setUser(data.user);
      setIsEditingName(false);
      toast.success('Name updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update name');
    } finally {
      setIsUpdating(false);
    }
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
              onClick={() => {
                setShowProfile(!showProfile);
                setIsEditingName(false);
                setNewName(user?.user_metadata?.full_name || '');
              }}
              className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs border border-emerald-100 shadow-sm hover:bg-emerald-100 transition-colors"
              title="Profile"
            >
              {initials}
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg p-2 z-50 animate-in fade-in zoom-in duration-200">
                <div className="px-3 py-2 border-b border-gray-50 mb-1">
                  {!isEditingName ? (
                    <div className="flex items-center justify-between group">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate pr-2">
                          {user?.user_metadata?.full_name || 'FreshTrack User'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setIsEditingName(true)} 
                        className="text-gray-300 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mb-1">
                      <input 
                        type="text" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        className="w-full text-xs font-bold text-gray-800 border border-emerald-200 rounded px-1.5 py-1 outline-none focus:ring-1 focus:ring-emerald-500"
                        autoFocus
                        placeholder="Enter your name"
                      />
                      <button onClick={handleUpdateName} disabled={isUpdating} className="text-emerald-500 hover:text-emerald-700 disabled:opacity-50">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setIsEditingName(false)} disabled={isUpdating} className="text-gray-400 hover:text-red-500 disabled:opacity-50">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{user?.email}</p>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1"
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


