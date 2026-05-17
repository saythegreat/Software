"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Mail } from 'lucide-react';

export const AuthContainer = () => {
  const router = useRouter();
  const { setUser } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Login failed.');

        setUser(data.user);
        toast.success('Logged in successfully!');
        router.push('/dashboard');
      } else {
        if (!name.trim()) {
          toast.error('Please enter your name.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, full_name: name.trim() }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Signup failed.');

        toast.success('Account created! You can now log in.');
        setIsLogin(true);  // switch to login tab
        setPassword('');   // clear password for security
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Show "check your email" screen after successful signup
  if (signupDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-brand-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-900/5 border border-gray-100 text-center"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-inner">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-3">Check your inbox</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            We sent a verification link to <strong className="text-gray-600">{email}</strong>. Click the link to activate your account.
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
            The link expires in 24 hours
          </p>
          <button
            onClick={() => { setSignupDone(false); setIsLogin(true); }}
            className="mt-6 text-xs text-emerald-700 font-bold hover:underline"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

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
          {/* Name field — only on sign up */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-2xl py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 uppercase tracking-widest text-xs"
            isLoading={loading}
          >
            {isLogin ? 'Login' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          {isLogin ? 'New to FreshTrack? ' : 'Joined us before? '}
          <button
            onClick={() => { setIsLogin(!isLogin); setName(''); setSignupDone(false); }}
            className="text-emerald-700 font-bold hover:underline ml-1"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
