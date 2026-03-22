import React, { useState, useEffect, Suspense, lazy } from 'react';
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

// Lazy load main views
const LandingPage = lazy(() => import('./components/LandingPage'));
const Dashboard = lazy(() => import('./components/Dashboard'));

// Lazy load calculators and other views
const SIPCalculator = lazy(() => import('./components/calculators/SIPCalculator'));
const EMICalculator = lazy(() => import('./components/calculators/EMICalculator'));
const GoalPlanner = lazy(() => import('./components/calculators/GoalPlanner'));
const RetirementCalculator = lazy(() => import('./components/calculators/RetirementCalculator'));
const LoanAffordability = lazy(() => import('./components/calculators/LoanAffordability'));
const HomePurchaseCalculator = lazy(() => import('./components/calculators/HomePurchaseCalculator'));
const StaggeredFDPlanner = lazy(() => import('./components/calculators/StaggeredFDPlanner'));
const BasicFDCalculator = lazy(() => import('./components/calculators/BasicFDCalculator'));
const BuyVsRentCalculator = lazy(() => import('./components/calculators/BuyVsRentCalculator'));
const ComparisonView = lazy(() => import('./components/ComparisonView'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./components/TermsOfUse'));

import { trackPageView } from './lib/analytics';

export type Screen = 'landing' | 'dashboard' | 'sip' | 'emi' | 'goal' | 'retirement' | 'affordability' | 'home_purchase' | 'staggered_fd' | 'basic_fd' | 'buy_vs_rent' | 'comparison' | 'privacy' | 'terms';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [previousScreen, setPreviousScreen] = useState<Screen>('landing');
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);
  const [sharedState, setSharedState] = useState<any>(null);

  useEffect(() => {
    trackPageView(currentScreen);
  }, [currentScreen]);

  const handleNavigate = (screen: Screen, state?: any) => {
    setPreviousScreen(currentScreen);
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
        return <LandingPage onStart={() => { setPreviousScreen('landing'); setCurrentScreen('dashboard'); }} onNavigate={handleNavigate} />;
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
        return <PrivacyPolicy onBack={() => setCurrentScreen(previousScreen)} />;
      case 'terms':
        return <TermsOfUse onBack={() => setCurrentScreen(previousScreen)} />;
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
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderScreen()}
            </motion.div>
          </Suspense>
        </AnimatePresence>
      </main>
    </div>
  );
}
