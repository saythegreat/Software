"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Leaf } from 'lucide-react';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-emerald-900/5 border border-gray-50"
      >
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-4">Account Authenticated</h1>
        <p className="text-gray-500 font-medium leading-relaxed mb-8">
          Your FreshTrack account has been successfully verified. You can now close this window and return to the application.
        </p>

        <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-50">
          <Leaf className="w-5 h-5 text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800/40">FreshTrack Security</span>
        </div>
      </motion.div>
    </div>
  );
}
