"use client";

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { Navbar } from '../components/layout/Navbar';
import { Dashboard } from '../components/inventory/Dashboard';
import { AuthContainer } from '../components/auth/AuthContainer';
import { useNotifications } from '../hooks/useNotifications';

export default function Home() {
  const { user, setUser, loading } = useStore();
  useNotifications();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eeede8] dark:bg-[#141412] text-[#1a1a18] dark:text-[#f0ede6]">
      {user ? (
        <>
          <Navbar />
          <main className="container mx-auto px-4 py-8 max-w-5xl">
            <Dashboard />
          </main>
        </>
      ) : (
        <AuthContainer />
      )}
    </div>
  );
}
