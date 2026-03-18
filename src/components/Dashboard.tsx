import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CreditCard, 
  Target, 
  Palmtree, 
  ShieldCheck,
  ArrowRight,
  Info,
  History,
  Trash2,
  BarChart3,
  CheckCircle2,
  Home,
  ChevronLeft,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen } from '../App';
import { cn, formatCurrency } from '../lib/utils';
import { storage, SavedScenario } from '../lib/storage';
import DisclaimerModal from './DisclaimerModal';
import TypewriterText from './TypewriterText';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
  onCompare: (ids: string[]) => void;
}

const calculators = [
  {
    id: 'sip' as Screen,
    name: 'SIP Calculator',
    description: 'Plan your wealth growth with monthly investments.',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    tag: 'Grow',
  },
  {
    id: 'emi' as Screen,
    name: 'EMI Calculator',
    description: 'Calculate monthly loan repayments and interest.',
    icon: CreditCard,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    tag: 'Borrow',
  },
  {
    id: 'goal' as Screen,
    name: 'Goal Planner',
    description: 'Find out how much you need to save for your dreams.',
    icon: Target,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    tag: 'Grow',
  },
  {
    id: 'retirement' as Screen,
    name: 'Retirement',
    description: 'Ensure a comfortable future with corpus planning.',
    icon: Palmtree,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    tag: 'Grow',
  },
  {
    id: 'basic_fd' as Screen,
    name: 'Basic FD Calculator',
    description: 'Calculate your fixed deposit returns and tax impact.',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    tag: 'Grow',
  },
  {
    id: 'staggered_fd' as Screen,
    name: 'Staggered FD Planner',
    description: 'Optimize your emergency fund for liquidity and returns.',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    tag: 'Grow',
  },
  {
    id: 'affordability' as Screen,
    name: 'Loan Affordability',
    description: 'Check if you can safely afford a new loan.',
    icon: ShieldCheck,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    tag: 'Borrow',
  },
  {
    id: 'home_purchase' as Screen,
    name: 'Home Purchase',
    description: 'Can you buy that dream home? Check EMI and down payment readiness.',
    icon: Home,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    tag: 'Buy',
  },
  {
    id: 'buy_vs_rent' as Screen,
    name: 'Buy vs Rent',
    description: 'Is buying actually better than renting and investing the difference?',
    icon: BarChart3,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    tag: 'Buy',
  },
];

export default function Dashboard({ onNavigate, onCompare }: DashboardProps) {
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [showPills, setShowPills] = useState(false);

  useEffect(() => {
    setSavedScenarios(storage.getScenarios());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storage.deleteScenario(id);
    setSavedScenarios(storage.getScenarios());
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-2 pt-8 pb-12 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2">
          <ShieldCheck className="w-4 h-4 text-zinc-400" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No login, no sign up, no BS.</span>
        </div>
        <div className="space-y-10">
          <TypewriterText 
            text1="Know your numbers." 
            text2="Own your future." 
            onComplete={() => setShowPills(true)}
          />
          
          <AnimatePresence>
            {showPills && (
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-wrap justify-center gap-[24px]"
              >
                <div className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[12px] font-medium flex items-center gap-2">
                  <span>📊</span> Export to Excel
                </div>
                <div className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[12px] font-medium flex items-center gap-2">
                  <span>⚡</span> Compare Scenarios
                </div>
                <div className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[12px] font-medium flex items-center gap-2">
                  <span>📲</span> Share Your Vision
                </div>
                <div className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[12px] font-medium flex items-center gap-2">
                  <span>🤖</span> AI Insights
                </div>
                <div className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[12px] font-medium flex items-center gap-2">
                  <span>🏦</span> Execute Your Plan
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Hero Image Section */}
      <div className="relative w-full overflow-hidden -my-4">
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ 
            background: `
              linear-gradient(to bottom, transparent 60%, #09090b 100%),
              linear-gradient(to top, transparent 70%, #09090b 100%)
            ` 
          }}
        />
        <img 
          src="/crystal-tree.png" 
          alt="Crystal Tree" 
          className="w-full h-[55vh] md:h-[45vh] object-cover object-center block"
          referrerPolicy="no-referrer"
          onError={(e) => e.currentTarget.style.display = 'none'}
        />
      </div>

      {/* Calculators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {calculators.map((calc, index) => (
          <motion.div
            key={calc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onNavigate(calc.id)}
            className="group glass-card p-6 text-left hover:bg-white/5 transition-all duration-300 flex flex-col justify-between h-48 cursor-pointer relative"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", calc.bg)}>
                  <calc.icon className={cn("w-6 h-6", calc.color)} />
                </div>
                <span className={cn("px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider", calc.bg, calc.color)}>
                  {calc.tag}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-white group-hover:text-teal-400 transition-colors">{calc.name}</h3>
                <p className="text-xs text-zinc-500 line-clamp-2">{calc.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">
                Open Calculator <ArrowRight className="w-3 h-3" />
              </div>
            </div>
            <button
              onMouseEnter={(e) => {
                e.stopPropagation();
                setIsDisclaimerOpen(true);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsDisclaimerOpen(true);
              }}
              className="absolute bottom-4 right-4 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      <DisclaimerModal 
        isOpen={isDisclaimerOpen} 
        onClose={() => setIsDisclaimerOpen(false)} 
      />

      {/* Saved Scenarios */}
      {savedScenarios.length > 0 && (
        <section className="space-y-6 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-zinc-500" />
              <h3 className="text-xl font-bold text-white">Recent Scenarios</h3>
            </div>
            {selectedIds.length >= 2 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onCompare(selectedIds)}
                className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-teal-500/20"
              >
                <BarChart3 className="w-4 h-4" />
                Compare {selectedIds.length}
              </motion.button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence>
              {savedScenarios.map((scenario) => {
                const isSelected = selectedIds.includes(scenario.id);
                return (
                  <motion.div
                    key={scenario.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={(e) => toggleSelect(scenario.id, e)}
                    className={cn(
                      "glass-card p-4 flex items-center justify-between cursor-pointer transition-all group",
                      isSelected ? "bg-teal-500/10 border-teal-500/30" : "hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                        isSelected ? "bg-teal-500 border-teal-500" : "border-zinc-700 group-hover:border-zinc-500"
                      )}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{scenario.name}</h4>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                          {scenario.type.replace('_', ' ')} • {new Date(scenario.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">Result</p>
                        <p className="text-sm font-bold text-white">
                          {(() => {
                            const val = scenario.outputs.mainResult ?? scenario.outputs.futureValue ?? scenario.outputs.monthlyEMI ?? scenario.outputs.corpusRequired ?? scenario.outputs.maxLoan;
                            return (val !== undefined && val !== null && isFinite(val)) ? formatCurrency(val) : "—";
                          })()}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => handleDelete(scenario.id, e)}
                        className="p-2 hover:bg-red-500/10 text-zinc-600 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          {selectedIds.length < 2 && (
            <p className="text-[10px] text-zinc-600 text-center uppercase font-bold tracking-widest">Select 2+ scenarios to compare</p>
          )}
        </section>
      )}
      
      <div className="pt-12 pb-8 flex justify-center items-center gap-3">
        <button 
          onClick={() => onNavigate('privacy')}
          className="text-[12px] text-zinc-500 hover:text-white transition-colors"
        >
          Privacy Policy
        </button>
        <span className="text-zinc-700 text-[12px]">·</span>
        <button 
          onClick={() => onNavigate('terms')}
          className="text-[12px] text-zinc-500 hover:text-white transition-colors"
        >
          Terms of Use
        </button>
      </div>
    </div>
  );
}
