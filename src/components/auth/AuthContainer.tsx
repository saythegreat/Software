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
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Thank you for signing up and use the FreshTrack');
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-brand-bg">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100"
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">FreshTrack</h1>
          <p className="text-gray-400 text-sm mt-1">
            {isLogin ? 'Manage your food waste' : 'Start tracking today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full rounded-2xl py-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold" isLoading={loading}>
            {isLogin ? 'Login' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400 font-medium">
          {isLogin ? "New to FreshTrack? " : "Joined us before? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-600 font-bold hover:underline ml-1"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

