"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import { Navbar } from '../../components/layout/Navbar';
import { Dashboard } from '../../components/inventory/Dashboard';
import { useNotifications } from '../../hooks/useNotifications';

export default function DashboardPage() {
  const { user, sessionLoading } = useStore();
  const router = useRouter();
  useNotifications();

  useEffect(() => {
    // Only redirect after session has been checked
    if (!sessionLoading && !user) {
      router.replace('/login');
    }
  }, [sessionLoading, user, router]);

  // Show spinner while session is loading OR while redirecting
  if (sessionLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-[#2d3436]">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Dashboard />
      </main>
    </div>
  );
}
