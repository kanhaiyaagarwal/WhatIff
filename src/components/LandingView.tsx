import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { ArrowRight, Lock, Zap, BarChart3, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface LandingViewProps {
  onStart: () => void;
  onNavigate: (screen: any) => void;
}

const TypewriterHeader = () => {
  const [text, setText] = useState('');
  const [isDone, setIsDone] = useState(false);
  const fullText1 = "WhatIff you could make ";
  const fullText2 = "every rupee";
  const fullText3 = " count.";
  
  useEffect(() => {
    let currentText = "";
    let i = 0;
    const speed = 40;
    
    const type = () => {
      if (i < fullText1.length + fullText2.length + fullText3.length) {
        if (i < fullText1.length) {
          currentText += fullText1[i];
        } else if (i < fullText1.length + fullText2.length) {
          currentText += fullText2[i - fullText1.length];
        } else {
          currentText += fullText3[i - (fullText1.length + fullText2.length)];
        }
        setText(currentText);
        i++;
        setTimeout(type, speed);
      } else {
        setIsDone(true);
      }
    };
    
    const timeout = setTimeout(type, 500);
    return () => clearTimeout(timeout);
  }, []);

  const part1 = text.slice(0, fullText1.length);
  const part2 = text.slice(fullText1.length, fullText1.length + fullText2.length);
  const part3 = text.slice(fullText1.length + fullText2.length);

  return (
    <span className="inline-block min-h-[3em] md:min-h-[2.2em]">
      {part1}
      <br className="hidden md:block" />
      <span className="text-emerald-500">{part2}</span>
      <br className="hidden md:block" />
      {part3}
      {!isDone && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block w-[2px] h-[0.8em] bg-emerald-500 ml-1 align-middle"
        />
      )}
    </span>
  );
};

const FadeInSection = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn("py-10 px-6", className)}
    >
      {children}
    </motion.section>
  );
};

// ─── CINEMATIC SVG BACKGROUNDS ───────────────────────────────────────────────

function GrowBg() {
  return (
    <svg viewBox="0 0 800 900" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full object-cover opacity-40">
      <defs>
        <radialGradient id="sky" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#0a2a0a" />
          <stop offset="60%" stopColor="#061a06" />
          <stop offset="100%" stopColor="#020c02" />
        </radialGradient>
        <radialGradient id="glow1" cx="50%" cy="45%" r="40%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonGlow" cx="72%" cy="18%" r="12%">
          <stop offset="0%" stopColor="#d4ffd4" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#86efac" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
        <filter id="blur1"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>
      <rect width="800" height="900" fill="url(#sky)" />
      <rect width="800" height="900" fill="url(#glow1)" />
      <circle cx="576" cy="130" r="52" fill="url(#moonGlow)" />
      <circle cx="576" cy="130" r="30" fill="#d4ffd4" opacity="0.85" filter="url(#blur1)" />
      <path d="M380 900 L380 580 Q382 540 390 500 Q400 460 405 420 Q408 390 400 360" stroke="#1a3a1a" strokeWidth="28" fill="none" strokeLinecap="round" />
      <path d="M385 520 Q320 460 260 430 Q220 415 190 410" stroke="#163016" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M388 490 Q450 440 510 400 Q550 375 580 365" stroke="#163016" strokeWidth="12" fill="none" strokeLinecap="round" />
      {[ [390,290,90],[310,320,75],[470,310,70],[260,360,80],[530,350,72] ].map(([cx,cy,r],i) => (
        <ellipse key={`f${i}`} cx={cx} cy={cy} rx={r} ry={r*0.75} fill={`hsl(${130+i%15},${55+i%20}%,${10+i%8}%)`} opacity={0.6} />
      ))}
    </svg>
  );
}

function BuyBg() {
  return (
    <svg viewBox="0 0 800 900" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full object-cover opacity-40">
      <defs>
        <linearGradient id="buySky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1628" />
          <stop offset="50%" stopColor="#0d1f3e" />
          <stop offset="100%" stopColor="#060f1e" />
        </linearGradient>
        <radialGradient id="cityGlow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="900" fill="url(#buySky)" />
      <rect width="800" height="900" fill="url(#cityGlow)" />
      <rect x="160" y="480" width="480" height="340" fill="#0d1f38" rx="4" />
      <rect x="140" y="460" width="520" height="30" fill="#0a1830" rx="3" />
      <rect x="185" y="500" width="100" height="140" fill="#1e3a5f" rx="2" />
      <rect x="310" y="490" width="180" height="160" fill="#1e3a5f" rx="2" />
      <rect x="515" y="500" width="100" height="140" fill="#1e3a5f" rx="2" />
    </svg>
  );
}

function BorrowBg() {
  return (
    <svg viewBox="0 0 800 900" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full object-cover opacity-40">
      <defs>
        <linearGradient id="borrowSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0a2e" />
          <stop offset="45%" stopColor="#2d1050" />
          <stop offset="100%" stopColor="#0d0618" />
        </linearGradient>
      </defs>
      <rect width="800" height="900" fill="url(#borrowSky)" />
      <rect x="370" y="620" width="60" height="180" fill="#2d1060" rx="4" />
      <rect x="160" y="490" width="480" height="12" fill="#6d28d9" rx="6" />
      <ellipse cx="230" cy="585" rx="50" ry="12" fill="#4c1d95" opacity="0.9" />
      <ellipse cx="570" cy="555" rx="40" ry="10" fill="#3b1580" opacity="0.9" />
    </svg>
  );
}

const BG_MAP = { grow: GrowBg, buy: BuyBg, borrow: BorrowBg };

const CALCULATOR_CARDS = [
  {
    id: 'grow',
    label: 'Wealth Creation',
    title: 'GROW',
    description: 'Project your SIP returns, FD maturity, retirement corpus, and financial goals.',
    progress: 66,
    accent: 'emerald',
    color: '#10b981',
    icon: '🌱'
  },
  {
    id: 'buy',
    label: 'Lifestyle Assets',
    title: 'BUY',
    description: 'Plan your home purchase, compare buying versus renting, and understand real estate costs.',
    progress: 50,
    accent: 'cyan',
    color: '#06b6d4',
    icon: '🏠'
  },
  {
    id: 'borrow',
    label: 'Credit Power',
    title: 'BORROW',
    description: 'Calculate your EMI, check your loan affordability, and understand the true cost of credit.',
    progress: 75,
    accent: 'purple',
    color: '#a855f7',
    icon: '💳'
  }
];

export default function LandingView({ onStart, onNavigate }: LandingViewProps) {
  const [activeCalc, setActiveCalc] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setActiveCalc(prev => Math.min(prev + 1, CALCULATOR_CARDS.length - 1));
      } else {
        setActiveCalc(prev => Math.max(prev - 1, 0));
      }
      setTouchStart(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-emerald-500/30 relative">
      {/* Global Glowing Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute top-[30%] left-[20%] w-[60%] h-[60%] bg-cyan-500/5 blur-[150px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md border-b border-white/5 bg-black/20">
        <div className="text-xl font-bold tracking-tight text-white">WhatIff</div>
        <button 
          onClick={onStart}
          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all duration-300 text-sm"
        >
          Open App
        </button>
      </header>

      {/* Section 1: Hero */}
      <section 
        className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden bg-cover bg-[center_top] bg-no-repeat before:absolute before:inset-0 before:z-0 before:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.85)_60%,#000000_100%)] before:pointer-events-none"
        style={{ backgroundImage: "url('/assets/hero-bg.jpg')" }}
      >
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
              NO LOGIN · NO SIGN UP · NO BS
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]"
          >
            <TypewriterHeader />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto"
          >
            One place to run your numbers and actually understand them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-4 flex justify-center"
          >
            <button
              onClick={onStart}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all duration-300 text-sm flex items-center gap-2 group shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              Start Calculating
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Problem */}
      <FadeInSection className="max-w-4xl mx-auto text-center space-y-4 py-8">
        <h2 className="text-xl md:text-3xl font-bold text-white">
          The problem with financial tools today.
        </h2>
        <p className="text-sm md:text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto">
          Most financial calculators give you a number and leave you alone with it. 
          They are scattered, they are silent, and they are built for someone else's agenda. 
          You deserve one place that brings it all together — and actually tells you what your numbers mean.
        </p>
      </FadeInSection>

      {/* Section 3: Features */}
      <FadeInSection className="max-w-6xl mx-auto space-y-12">
        <h2 className="text-2xl md:text-4xl font-bold text-white text-center">
          WhatIff is different.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 - Privacy */}
          <div className="group relative p-6 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-colors" />
            <div className="relative z-10 space-y-4">
              <div className="text-emerald-500 font-bold tracking-widest uppercase text-[10px]">Privacy</div>
              <h3 className="text-xl font-bold text-white leading-tight">Your numbers never leave your device.</h3>
              <ul className="space-y-2">
                {['No login', 'No account', 'No data collection', 'Free to use', 'No paywall', 'No hidden agenda'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-zinc-400 text-xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card 2 - Intelligence */}
          <div className="group relative p-6 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-colors" />
            <div className="relative z-10 space-y-4">
              <div className="text-purple-500 font-bold tracking-widest uppercase text-[10px]">Intelligence</div>
              <h3 className="text-xl font-bold text-white leading-tight">AI that explains what your numbers mean.</h3>
              <ul className="space-y-2">
                {['Export to Excel', 'Share Your Vision', 'Plain language', 'Not jargon', 'Not advice', 'Just clarity'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-zinc-400 text-xs">
                    <CheckCircle2 className="w-3 h-3 text-purple-500/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card 3 - Action */}
          <div className="group relative p-6 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full group-hover:bg-cyan-500/20 transition-colors" />
            <div className="relative z-10 space-y-4">
              <div className="text-cyan-500 font-bold tracking-widest uppercase text-[10px]">Action</div>
              <h3 className="text-xl font-bold text-white leading-tight">From insight to action in one tap.</h3>
              <ul className="space-y-2">
                {['Compare Scenarios', 'Execute Your Plan', 'See your numbers', 'Understand them', 'Act on them'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-zinc-400 text-xs">
                    <CheckCircle2 className="w-3 h-3 text-cyan-500/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* Section 4: Calculators Carousel */}
      <FadeInSection className="max-w-6xl mx-auto space-y-8 overflow-hidden">
        <div className="text-center space-y-3 relative">
          <h2 className="text-2xl md:text-4xl font-bold text-white">Pick what matters to you right now.</h2>
          <p className="text-zinc-500 text-sm">Every calculator you need. More being added.</p>
          <div className="absolute top-0 right-0 md:hidden text-[10px] font-black tracking-widest text-zinc-600">SWIPE →</div>
        </div>

        <div className="relative flex items-center justify-center">
          {/* Desktop Arrows */}
          <button 
            onClick={() => setActiveCalc(prev => Math.max(prev - 1, 0))}
            className="hidden md:flex absolute left-0 z-20 p-4 text-zinc-600 hover:text-white transition-colors disabled:opacity-20"
            disabled={activeCalc === 0}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button 
            onClick={() => setActiveCalc(prev => Math.min(prev + 1, CALCULATOR_CARDS.length - 1))}
            className="hidden md:flex absolute right-0 z-20 p-4 text-zinc-600 hover:text-white transition-colors disabled:opacity-20"
            disabled={activeCalc === CALCULATOR_CARDS.length - 1}
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          {/* Carousel Container */}
          <div 
            className="w-full max-w-[480px] touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <div className="relative h-[450px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCalc}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={cn(
                    "absolute inset-0 p-8 rounded-3xl bg-zinc-900/60 border-l-4 backdrop-blur-2xl flex flex-col justify-between overflow-hidden",
                    activeCalc === 0 ? "border-emerald-500" : activeCalc === 1 ? "border-cyan-500" : "border-purple-500"
                  )}
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 z-0">
                    {activeCalc === 0 && <GrowBg />}
                    {activeCalc === 1 && <BuyBg />}
                    {activeCalc === 2 && <BorrowBg />}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                      {CALCULATOR_CARDS[activeCalc].label}
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-3xl font-black text-white italic tracking-tighter">
                        {CALCULATOR_CARDS[activeCalc].title}
                      </h3>
                      <span className="text-2xl">{CALCULATOR_CARDS[activeCalc].icon}</span>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {CALCULATOR_CARDS[activeCalc].description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${CALCULATOR_CARDS[activeCalc].progress}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ 
                            backgroundColor: CALCULATOR_CARDS[activeCalc].color,
                            boxShadow: `0 0 12px ${CALCULATOR_CARDS[activeCalc].color}80`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onStart();
                    }}
                    className="px-5 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-110 relative z-20 text-sm"
                    style={{ backgroundColor: CALCULATOR_CARDS[activeCalc].color, color: '#000' }}
                  >
                    Run Scenarios <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3">
          {CALCULATOR_CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveCalc(i)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                activeCalc === i 
                  ? (i === 0 ? "bg-emerald-500 scale-125" : i === 1 ? "bg-cyan-500 scale-125" : "bg-purple-500 scale-125")
                  : "bg-zinc-600"
              )}
            />
          ))}
        </div>
      </FadeInSection>

      {/* Section 5: Stats */}
      <FadeInSection className="max-w-6xl mx-auto py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center space-y-1">
            <div className="text-4xl md:text-5xl font-black text-emerald-500">27%</div>
            <p className="text-[10px] md:text-xs text-emerald-500/70 leading-tight font-medium tracking-wide">
              Only 27% of Indian adults are financially literate
            </p>
          </div>
          <div className="flex-1 text-center space-y-1">
            <div className="text-4xl md:text-5xl font-black text-emerald-500">73rd</div>
            <p className="text-[10px] md:text-xs text-emerald-500/70 leading-tight font-medium tracking-wide">
              India's rank out of 144 countries in financial literacy
            </p>
          </div>
          <div className="flex-1 text-center space-y-1">
            <div className="text-4xl md:text-5xl font-black text-emerald-500">3 in 4</div>
            <p className="text-[10px] md:text-xs text-emerald-500/70 leading-tight font-medium tracking-wide">
              Indians lack basic understanding of financial concepts
            </p>
          </div>
        </div>
      </FadeInSection>

      {/* Section 6: Final CTA */}
      <FadeInSection className="max-w-4xl mx-auto text-center space-y-6 py-8">
        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
          Your numbers. Your decisions. <br />
          <span className="text-emerald-500">No middleman.</span>
        </h2>
        <div className="space-y-4">
          <button
            onClick={onStart}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all duration-300 text-sm shadow-[0_0_20px_rgba(16,185,129,0.15)] mx-auto block"
          >
            Open WhatIff
          </button>
          <p className="text-zinc-600 text-xs font-medium">
            No login required. Start in seconds.
          </p>
        </div>
      </FadeInSection>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-zinc-950 pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-2xl font-bold text-white">WhatIff</div>
            <div className="flex gap-8 text-sm font-bold uppercase tracking-widest text-zinc-500">
              <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Terms of Use</button>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
              © 2026 WhatIff. All rights reserved.
            </p>
            <p className="text-[9px] text-zinc-600 text-center md:text-right max-w-md leading-relaxed uppercase font-bold tracking-tighter">
              All calculations are for educational purposes only. Not financial advice. Not SEBI registered.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
