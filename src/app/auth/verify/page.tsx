"use client";

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Leaf } from 'lucide-react';
import { Suspense } from 'react';

function VerifyContent() {
  const params = useSearchParams();
  const error = params.get('error');

  if (error === 'expired_token') {
    return (
      <VerifyCard
        icon={<Clock className="w-10 h-10 text-amber-500" />}
        iconBg="bg-amber-50 border-amber-100"
        title="Link Expired"
        message="Your verification link has expired. Please sign up again to receive a new link."
        isError
      />
    );
  }

  if (error === 'invalid_token' || error === 'missing_token') {
    return (
      <VerifyCard
        icon={<XCircle className="w-10 h-10 text-red-500" />}
        iconBg="bg-red-50 border-red-100"
        title="Invalid Link"
        message="This verification link is invalid or has already been used. Please sign in or sign up again."
        isError
      />
    );
  }

  if (error === 'server_error') {
    return (
      <VerifyCard
        icon={<XCircle className="w-10 h-10 text-red-500" />}
        iconBg="bg-red-50 border-red-100"
        title="Something Went Wrong"
        message="We couldn't verify your account due to a server error. Please try again later."
        isError
      />
    );
  }

  // No error — waiting for redirect or showing success message (shouldn't persist here as API redirects to /dashboard)
  return (
    <VerifyCard
      icon={<CheckCircle2 className="w-10 h-10 text-emerald-600" />}
      iconBg="bg-emerald-50 border-emerald-100"
      title="Account Verified!"
      message="Your FreshTrack account has been successfully verified. Redirecting you to the dashboard…"
    />
  );
}

function VerifyCard({
  icon, iconBg, title, message, isError
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  message: string;
  isError?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-emerald-900/5 border border-gray-50"
      >
        <div className={`w-20 h-20 ${iconBg} rounded-[2rem] flex items-center justify-center mx-auto mb-8 border shadow-inner`}>
          {icon}
        </div>

        <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-4">{title}</h1>
        <p className="text-gray-500 font-medium leading-relaxed mb-8">{message}</p>

        {isError && (
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl transition-colors"
          >
            Back to Login
          </a>
        )}

        <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-50 mt-8">
          <Leaf className="w-5 h-5 text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800/40">FreshTrack Security</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
