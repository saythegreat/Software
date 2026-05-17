"use client";

import { motion } from 'framer-motion';
import { Leaf, ChefHat, Timer, ArrowRight, ShieldCheck, Sparkles, BarChart3, Droplets } from 'lucide-react';
import Link from 'next/link';

export const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const features = [
    {
      icon: <Timer className="w-6 h-6 text-emerald-500" />,
      title: "Smart Expiry Tracking",
      description: "Never let food go bad again. Get intelligent alerts before your ingredients expire."
    },
    {
      icon: <ChefHat className="w-6 h-6 text-emerald-500" />,
      title: "AI-Powered Recipes",
      description: "Generate delicious recipes instantly based on what's about to expire in your fridge."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-500" />,
      title: "Waste Analytics",
      description: "Track your progress, save money, and reduce your carbon footprint effortlessly."
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg font-sans overflow-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm">
              <Leaf className="w-6 h-6 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-800">FreshTrack</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/login"
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            className="text-center max-w-4xl mx-auto mt-16 lg:mt-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-8 border border-emerald-200">
              <Sparkles className="w-4 h-4" />
              <span>Smarter Kitchen Management</span>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-8">
                Eat Fresh. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">Waste Less.</span>
              </h1>
            </motion.div>

            <motion.div variants={itemVariants}>
              <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Your personal kitchen assistant that tracks food expiry, suggests smart recipes, and helps you reduce waste while saving money.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Start Tracking Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium px-4 py-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                No credit card required
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Element / App Mockup */}
          <motion.div 
            className="mt-24 relative max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/50 to-transparent blur-3xl rounded-[3rem] -z-10" />
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl p-4 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400" />
              {/* Abstract App Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-4 w-32 bg-gray-200 rounded-full" />
                    <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Droplets className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${i === 1 ? 'bg-red-500' : i === 2 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <div className="space-y-2">
                            <div className="h-3 w-24 bg-gray-200 rounded-full" />
                            <div className="h-2 w-16 bg-gray-100 rounded-full" />
                          </div>
                        </div>
                        <div className="h-6 w-16 bg-gray-50 rounded-lg border border-gray-100" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex flex-col justify-center">
                  <ChefHat className="w-10 h-10 text-emerald-600 mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Recipe Suggestion</h3>
                  <p className="text-sm text-gray-600 mb-4">You have spinach and eggs expiring soon. Make a Spinach Omelette!</p>
                  <div className="h-10 w-full bg-emerald-600 rounded-xl text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-md">
                    View Recipe
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features Section */}
          <div className="py-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to manage your kitchen</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Simple, intuitive features designed to help you save money and reduce food waste.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-emerald-900/5 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-12 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-600 fill-current" />
            <span className="font-bold text-gray-800">FreshTrack</span>
          </div>
          <p className="text-sm text-gray-500">© 2026 FreshTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
