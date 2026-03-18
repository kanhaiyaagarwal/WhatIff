import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  CreditCard, 
  Target, 
  Palmtree, 
  ShieldCheck,
  ChevronLeft,
  Info,
  Lock,
  Home,
  BarChart2,
  Settings,
  User,
  Instagram,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import LandingView from './components/LandingView';
import Dashboard from './components/Dashboard';
import SIPCalculator from './components/calculators/SIPCalculator';
import EMICalculator from './components/calculators/EMICalculator';
import GoalPlanner from './components/calculators/GoalPlanner';
import RetirementCalculator from './components/calculators/RetirementCalculator';
import LoanAffordability from './components/calculators/LoanAffordability';
import HomePurchaseCalculator from './components/calculators/HomePurchaseCalculator';
import StaggeredFDPlanner from './components/calculators/StaggeredFDPlanner';
import BasicFDCalculator from './components/calculators/BasicFDCalculator';
import BuyVsRentCalculator from './components/calculators/BuyVsRentCalculator';
import ComparisonView from './components/ComparisonView';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfUse from './components/TermsOfUse';
import { trackPageView } from './lib/analytics';

export type Screen = 'landing' | 'dashboard' | 'sip' | 'emi' | 'goal' | 'retirement' | 'affordability' | 'home_purchase' | 'staggered_fd' | 'basic_fd' | 'buy_vs_rent' | 'comparison' | 'privacy' | 'terms';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);
  const [sharedState, setSharedState] = useState<any>(null);

  useEffect(() => {
    trackPageView(currentScreen);
  }, [currentScreen]);

  const handleNavigate = (screen: Screen, state?: any) => {
    setSharedState(state);
    setCurrentScreen(screen);
  };

  const handleCompare = (ids: string[]) => {
    setSelectedScenarioIds(ids);
    setCurrentScreen('comparison');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingView onStart={() => setCurrentScreen('dashboard')} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} onCompare={handleCompare} />;
      case 'sip':
        return <SIPCalculator onBack={() => setCurrentScreen('dashboard')} />;
      case 'emi':
        return <EMICalculator onBack={() => setCurrentScreen('dashboard')} />;
      case 'goal':
        return <GoalPlanner onBack={() => setCurrentScreen('dashboard')} initialData={sharedState} />;
      case 'retirement':
        return <RetirementCalculator onBack={() => setCurrentScreen('dashboard')} />;
      case 'affordability':
        return <LoanAffordability onBack={() => setCurrentScreen('dashboard')} />;
      case 'home_purchase':
        return <HomePurchaseCalculator onBack={() => setCurrentScreen('dashboard')} onNavigate={handleNavigate} />;
      case 'staggered_fd':
        return <StaggeredFDPlanner onBack={() => setCurrentScreen('dashboard')} initialPrincipal={sharedState?.principal} />;
      case 'basic_fd':
        return <BasicFDCalculator onBack={() => setCurrentScreen('dashboard')} onNavigate={handleNavigate} />;
      case 'buy_vs_rent':
        return <BuyVsRentCalculator onBack={() => setCurrentScreen('dashboard')} initialData={sharedState} />;
      case 'comparison':
        return <ComparisonView ids={selectedScenarioIds} onBack={() => setCurrentScreen('dashboard')} />;
      case 'privacy':
        return <PrivacyPolicy onBack={() => setCurrentScreen('dashboard')} />;
      case 'terms':
        return <TermsOfUse onBack={() => setCurrentScreen('dashboard')} />;
      default:
        return <Dashboard onNavigate={handleNavigate} onCompare={handleCompare} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      {currentScreen !== 'landing' && currentScreen !== 'privacy' && currentScreen !== 'terms' && (
        <header className="border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (currentScreen === 'dashboard') {
                    setCurrentScreen('landing');
                  } else {
                    setCurrentScreen('dashboard');
                  }
                }}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                WhatIff
              </h1>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Privacy First</span>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={cn("flex-1 w-full", (currentScreen !== 'landing' && currentScreen !== 'privacy' && currentScreen !== 'terms') && "max-w-5xl mx-auto p-6")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      {currentScreen !== 'landing' && currentScreen !== 'privacy' && currentScreen !== 'terms' && (
        <footer className="border-t border-white/5 py-12 bg-zinc-900/30">
          <div className="max-w-5xl mx-auto px-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-xl font-bold text-white tracking-tight">WhatIff</span>
                </div>
                <p className="text-sm text-zinc-500 max-w-xs">
                  Financial planning tools for the modern investor. Simple, secure, and private.
                </p>
              </div>

              <div className="flex flex-col items-center md:items-end gap-6">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs">All calculations happen locally on your device.</span>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                © 2026 WhatIff. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
