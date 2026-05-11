import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Globe, Command } from 'lucide-react';

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
        toast.success('Sign up successful! Check your email for verification.');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#1e1e1c] rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-white/5"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-green">FreshTrack</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isLogin ? 'Welcome back! Manage your food waste.' : 'Start tracking your food today.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#2a2a28] focus:ring-2 focus:ring-brand-green outline-none transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#2a2a28] focus:ring-2 focus:ring-brand-green outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" isLoading={loading}>
            {isLogin ? (
              <><LogIn className="w-4 h-4 mr-2" /> Login</>
            ) : (
              <><UserPlus className="w-4 h-4 mr-2" /> Sign Up</>
            )}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <hr className="w-full border-gray-100 dark:border-gray-800" />
          <span className="px-3 text-xs text-gray-400 uppercase">Or</span>
          <hr className="w-full border-gray-100 dark:border-gray-800" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button variant="outline" size="sm" onClick={() => toast.info('GitHub auth not configured')}>
            <Globe className="w-4 h-4 mr-2" /> GitHub
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Apple auth not configured')}>
            <Command className="w-4 h-4 mr-2" /> Apple
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand-green font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
