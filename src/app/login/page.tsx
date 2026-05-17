"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import { AuthContainer } from '../../components/auth/AuthContainer';

export default function LoginPage() {
  const { user, sessionLoading } = useStore();
  const router = useRouter();

  useEffect(() => {
    // If already logged in (after session loads), go to dashboard
    if (!sessionLoading && user) {
      router.replace('/dashboard');
    }
  }, [sessionLoading, user, router]);

  // Show spinner while checking session
  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  // If session loaded and user exists, don't flash the login form
  if (user) return null;

  return <AuthContainer />;
}
