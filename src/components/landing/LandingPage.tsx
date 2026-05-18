"use client";

import { motion, useInView } from 'framer-motion';
import { Leaf, ChefHat, Timer, ArrowRight, ShieldCheck, Sparkles, BarChart3, Bell, Star, CheckCircle2, Zap, RefreshCw, Scan } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
};

export const LandingPage = () => {
  const features = [
    { icon: <Timer className="w-7 h-7" />, color: "from-red-400 to-orange-400", title: "Expiry Alerts", desc: "Smart notifications days before anything goes bad. Never throw away forgotten produce again." },
    { icon: <ChefHat className="w-7 h-7" />, color: "from-emerald-400 to-teal-400", title: "AI Recipe Engine", desc: "FreshTrack reads your fridge and generates tailored recipes from whatever is about to expire." },
    { icon: <BarChart3 className="w-7 h-7" />, color: "from-blue-400 to-indigo-400", title: "Waste Analytics", desc: "Weekly and monthly stats showing exactly how much food and money you are saving." },
    { icon: <Bell className="w-7 h-7" />, color: "from-purple-400 to-pink-400", title: "Smart Reminders", desc: "Push notifications synced to your inventory so nothing slips past your attention." },
    { icon: <RefreshCw className="w-7 h-7" />, color: "from-amber-400 to-yellow-400", title: "Auto Restock List", desc: "Generates a grocery list based on items that are running low or have expired." },
    { icon: <Scan className="w-7 h-7" />, color: "from-cyan-400 to-sky-400", title: "Smart Scanner", desc: "Add items in seconds. Scan barcodes or type manually to log your groceries with automatic categorization." },
  ];

  const steps = [
    { num: "01", title: "Add your groceries", desc: "Log items as you shop or when you return home. Takes under a minute." },
    { num: "02", title: "Track expiry dates", desc: "FreshTrack colour-codes every item — green, amber, red — so status is instant." },
    { num: "03", title: "Get smart recipes", desc: "Our AI combines your expiring items into delicious, practical meal suggestions." },
    { num: "04", title: "Save money & the planet", desc: "Watch your food waste and spending drop week over week with live analytics." },
  ];

  const testimonials = [
    { name: "Skanda", role: "Hostel Student", stars: 5, quote: "FreshTrack made hostel food management much easier for us. We were able to track food items properly and identify products that were close to expiry before they got wasted." },
    { name: "Harikerthan", role: "Hostel Student", stars: 5, quote: "We started using FreshTrack in our hostel kitchen and it helped a lot in checking expired items and managing stock efficiently. The interface is simple and very useful." },
    { name: "Kushal", role: "Hostel Student", stars: 5, quote: "FreshTrack helped us monitor food storage in the hostel and reduced food waste by tracking expiry dates accurately. It made inventory management much more organized." },
  ];

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: "linear-gradient(160deg,#f0fdf4 0%,#f5f6f2 40%,#ecfdf5 100%)" }}>

      {/* ── NAV ── */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/60" style={{ backdropFilter: "blur(18px)", background: "rgba(255,255,255,0.75)" }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Leaf className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">FreshTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-emerald-600 transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block px-5 py-2.5 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors">Sign In</Link>
            <Link href="/login" className="px-6 py-2.5 rounded-full text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-200" style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle,#6ee7b7,transparent)" }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle,#a7f3d0,transparent)" }} />

        <div className="max-w-7xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.5 }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-10" style={{ background: "rgba(209,250,229,0.7)", borderColor: "#6ee7b7", color: "#065f46" }}>
              <Sparkles className="w-3.5 h-3.5" />
              Smart Kitchen Management • AI-Powered
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black text-gray-950 tracking-tight leading-[1.0] mb-8">
              Eat Fresh.<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#059669 0%,#10b981 50%,#34d399 100%)" }}>Waste Nothing.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              FreshTrack is your AI-powered kitchen companion that tracks expiry dates, suggests smart recipes, and helps you save money while reducing food waste.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/login" className="group w-full sm:w-auto px-10 py-5 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-3 shadow-2xl shadow-emerald-300 transition-all hover:-translate-y-1 hover:shadow-3xl" style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
                Start Tracking Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-2.5 text-sm text-gray-500 font-semibold">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                No credit card · Free forever plan
              </div>
            </div>


          </motion.div>

          {/* ── APP MOCKUP ── */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }} className="mt-24 max-w-5xl mx-auto">
            <div className="relative p-1 rounded-[2.5rem]" style={{ background: "linear-gradient(135deg,#6ee7b7,#34d399,#059669)" }}>
              <div className="bg-white rounded-[2.3rem] p-8 md:p-12 shadow-2xl">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Your Inventory</p>
                    <h2 className="text-2xl font-black text-gray-900 mt-1">Good Morning! 👋</h2>
                  </div>
                  <div className="flex gap-3">
                    <div className="px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-100">3 Expiring Soon</div>
                    <div className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">14 Fresh Items</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-5 gap-6">
                  {/* Item list */}
                  <div className="md:col-span-3 space-y-3">
                    {[
                      { name: "Baby Spinach", cat: "Vegetables", days: "1 day left", color: "bg-red-500", badge: "bg-red-50 text-red-600 border-red-100" },
                      { name: "Free Range Eggs", cat: "Dairy & Eggs", days: "3 days left", color: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-100" },
                      { name: "Greek Yogurt", cat: "Dairy & Eggs", days: "5 days left", color: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-100" },
                      { name: "Cherry Tomatoes", cat: "Vegetables", days: "8 days left", color: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                      { name: "Sourdough Bread", cat: "Bakery", days: "10 days left", color: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm`} />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.cat}</p>
                          </div>
                        </div>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${item.badge}`}>{item.days}</span>
                      </div>
                    ))}
                  </div>

                  {/* Recipe card */}
                  <div className="md:col-span-2 flex flex-col gap-4">
                    <div className="rounded-2xl p-6 text-white flex-1" style={{ background: "linear-gradient(145deg,#059669,#047857)" }}>
                      <div className="flex items-center gap-2 mb-4">
                        <ChefHat className="w-5 h-5 opacity-80" />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">AI Recipe</span>
                      </div>
                      <h3 className="font-black text-lg leading-tight mb-2">Spinach & Egg Shakshuka</h3>
                      <p className="text-xs opacity-75 leading-relaxed mb-5">Uses your expiring spinach and eggs. Ready in 20 minutes — perfect for tonight.</p>
                      <div className="flex gap-2 flex-wrap mb-5">
                        {["Spinach", "Eggs", "Tomatoes"].map(t => (
                          <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-white/20 font-semibold">{t}</span>
                        ))}
                      </div>
                      <Link href="/login" className="w-full block text-center py-3 rounded-xl bg-white text-emerald-700 text-xs font-black hover:bg-emerald-50 transition-colors">
                        View Full Recipe →
                      </Link>
                    </div>
                    {/* Mini stat */}
                    <div className="rounded-2xl p-5 bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">This Month</p>
                      <p className="text-3xl font-black text-emerald-600">₹3,840</p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">saved by reducing waste</p>
                      <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" style={{ width: "72%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-20">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 block mb-4">Everything you need</span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">Packed with powerful features</h2>
            <p className="text-lg text-gray-500 mt-5 max-w-2xl mx-auto font-light">Every tool you need to run a smarter, waste-free kitchen — all in one place.</p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-gray-100 hover:shadow-2xl hover:shadow-emerald-100 hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center mb-6 shadow-lg`}>{f.icon}</div>
                  <h3 className="text-xl font-black text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-32 px-6 relative overflow-hidden" style={{ background: "linear-gradient(160deg,#ecfdf5 0%,#f0fdf4 100%)" }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-40" style={{ background: "radial-gradient(circle,#a7f3d0,transparent)" }} />
        <div className="max-w-7xl mx-auto relative">
          <FadeIn className="text-center mb-20">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 block mb-4">Simple as 1-2-3-4</span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">How FreshTrack works</h2>
          </FadeIn>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-emerald-200" />
            {steps.map((s, i) => (
              <FadeIn key={i} delay={i * 0.1} className="relative">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl shadow-emerald-100/50 border border-emerald-50 h-full">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 text-white font-black text-lg flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">{s.num}</div>
                  <h3 className="font-black text-gray-900 text-lg mb-3">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-20">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 block mb-4">What users say</span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">Real kitchens. Real results.</h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all h-full flex flex-col">
                  <div className="flex gap-1 mb-5">
                    {Array(t.stars).fill(0).map((_, si) => <Star key={si} className="w-4 h-4 text-amber-400 fill-current" />)}
                  </div>
                  <p className="text-gray-700 leading-relaxed text-base flex-1 mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm">{t.name[0]}</div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400 font-medium">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── BIG CTA ── */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="relative rounded-[3rem] overflow-hidden p-16 md:p-24 text-center text-white shadow-2xl" style={{ background: "linear-gradient(145deg,#064e3b,#065f46,#059669)" }}>
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle,#6ee7b7,transparent)" }} />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle,#34d399,transparent)" }} />
              <div className="relative">
                <Leaf className="w-14 h-14 mx-auto mb-8 text-emerald-300 fill-current opacity-80" />
                <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Ready to waste less?</h2>
                <p className="text-lg md:text-xl text-emerald-200 mb-12 max-w-2xl mx-auto font-light">Join thousands of households that have cut their food waste and grocery bills. Free to start in under 60 seconds.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/login" className="group w-full sm:w-auto px-10 py-5 rounded-2xl text-base font-black text-emerald-900 bg-white hover:bg-emerald-50 shadow-2xl transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
                    Create Free Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto px-10 py-5 rounded-2xl text-base font-bold text-white border-2 border-emerald-400/50 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    Sign In
                  </Link>
                </div>
                <div className="flex items-center justify-center gap-8 mt-10 text-sm text-emerald-300 font-medium">
                  {["No credit card", "Free forever plan", "Setup in 60 secs"].map(t => (
                    <div key={t} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{t}</div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="font-black text-gray-900 text-lg">FreshTrack</span>
          </div>
          <p className="text-sm text-gray-400 font-medium">© 2026 FreshTrack. Designed to reduce food waste.</p>
          <div className="flex gap-6 text-sm font-semibold text-gray-500">
            <Link href="/login" className="hover:text-emerald-600 transition-colors">Sign In</Link>
            <Link href="/login" className="hover:text-emerald-600 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
