import React, { useState, useEffect, useRef } from 'react';
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
import InsightFeedback from './InsightFeedback';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Animation objects
    const coins = Array.from({ length: 6 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 20 + Math.random() * 20,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      color: ['#10b981', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 3)]
    }));

    const shapes = Array.from({ length: 8 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 15 + Math.random() * 25,
      type: ['triangle', 'square', 'hexagon'][Math.floor(Math.random() * 3)],
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.01,
    }));

    const orbs = [
      { x: canvas.width * 0.2, y: canvas.height * 0.3, color: '#10b981', size: 300 },
      { x: canvas.width * 0.8, y: canvas.height * 0.7, color: '#8b5cf6', size: 350 },
      { x: canvas.width * 0.5, y: canvas.height * 0.5, color: '#06b6d4', size: 250 }
    ];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Orbs
      orbs.forEach(orb => {
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size);
        gradient.addColorStop(0, orb.color + '15'); // Very low opacity
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Draw Graph Line
      ctx.beginPath();
      ctx.strokeStyle = '#10b98120';
      ctx.lineWidth = 2;
      ctx.moveTo(0, canvas.height * 0.8);
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.lineTo(i, canvas.height * (0.8 - (i / canvas.width) * 0.5 + Math.sin(i * 0.01) * 0.05));
      }
      ctx.stroke();

      // Draw Coins
      coins.forEach(coin => {
        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.rotate(coin.rotation);
        ctx.strokeStyle = coin.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, coin.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = `${coin.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = coin.color;
        ctx.fillText('₹', 0, 0);
        ctx.restore();

        coin.x = (coin.x + coin.vx + canvas.width) % canvas.width;
        coin.y = (coin.y + coin.vy + canvas.height) % canvas.height;
        coin.rotation += coin.rotationSpeed;
      });

      // Draw Shapes
      shapes.forEach(shape => {
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (shape.type === 'triangle') {
          ctx.moveTo(0, -shape.size);
          ctx.lineTo(shape.size, shape.size);
          ctx.lineTo(-shape.size, shape.size);
          ctx.closePath();
        } else if (shape.type === 'square') {
          ctx.rect(-shape.size/2, -shape.size/2, shape.size, shape.size);
        } else {
          for (let i = 0; i < 6; i++) {
            ctx.lineTo(shape.size * Math.cos(i * Math.PI / 3), shape.size * Math.sin(i * Math.PI / 3));
          }
          ctx.closePath();
        }
        ctx.stroke();
        ctx.restore();

        shape.x = (shape.x + shape.vx + canvas.width) % canvas.width;
        shape.y = (shape.y + shape.vy + canvas.height) % canvas.height;
        shape.rotation += shape.rotationSpeed;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

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
    <div className="relative min-h-screen">
      {/* Background Animation */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full"
        />
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'radial-gradient(circle at center, rgba(9,9,11,0.3) 0%, rgba(9,9,11,0.85) 100%)'
          }}
        />
      </div>

      <div className="relative z-10 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-2 pt-8 pb-12 relative">
          <div className="space-y-10">
            <TypewriterText 
              text1="Know your numbers." 
              text2="Own your future." 
              onComplete={() => setShowPills(true)}
            />
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
          decoding="async"
          fetchPriority="high"
          width="1920"
          height="1080"
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
      
      </div>
      
      {/* Footer Feedback */}
      <footer className="relative z-10 py-12 flex justify-center">
        <InsightFeedback 
          calculator="Dashboard" 
          isDashboard={true} 
        />
      </footer>
    </div>
  );
}
