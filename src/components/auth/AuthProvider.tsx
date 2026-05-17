"use client";

import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setSessionLoading } = useStore();

  useEffect(() => {
    // Hydrate session once, then mark sessionLoading = false
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSessionLoading(false);
    });

    // Keep in sync with auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSessionLoading]);

  return <>{children}</>;
};
