"use client";

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Leaf } from 'lucide-react';

export const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Logged in successfully!');
      } else {
        const redirectUrl = `${window.location.origin}/auth/verify`;
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        if (error) throw error;
        toast.success('Check your email to verify your account!');
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      if (error.message === 'Failed to fetch') {
        toast.error('Waking up secure server... Please try again in a few seconds.');
      } else {
        toast.error(error.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-brand-bg">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-900/5 border border-gray-100"
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-inner">
            <Leaf className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">FreshTrack</h1>
          <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-1">
            {isLogin ? 'Manage your food waste' : 'Start tracking today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm font-medium"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full rounded-2xl py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 uppercase tracking-widest text-xs" isLoading={loading}>
            {isLogin ? 'Login' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          {isLogin ? "New to FreshTrack? " : "Joined us before? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-700 font-bold hover:underline ml-1"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};


