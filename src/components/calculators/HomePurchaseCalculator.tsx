import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Home, ArrowDown, CheckCircle2, AlertCircle, Sparkles, Share2, MapPin, ChevronLeft, Download, Target, BarChart3, ArrowRight } from 'lucide-react';
import { GLOBAL_AI_INSTRUCTION } from '../../aiInsightPrompt';
import { formatCurrency, cn, formatCompactNumber, formatIndianRupees } from '../../lib/utils';
import { calculateEMI, calculateRequiredSIP } from '../../lib/calculators';
import SaveScenarioButton from '../SaveScenarioButton';
import ShareVision from '../ShareVision';
import InfoBox, { RiskLevel } from '../InfoBox';
import { exportToExcel } from '../../lib/exportUtils';
import AIInsightSection from '../AIInsightSection';
import { renderInsight } from '../../renderInsight';
import { Screen } from '../../App';

import SliderWithInput from '../SliderWithInput';

const CITIES = [
  { name: "Bengaluru", areas: ["Whitefield", "Koramangala", "HSR Layout", "Indiranagar", "Electronic City"] },
  { name: "Mumbai", areas: ["Andheri", "Powai", "Thane", "Navi Mumbai", "Bandra"] },
  { name: "Delhi NCR", areas: ["Gurgaon", "Noida", "Dwarka", "Faridabad", "Greater Noida"] },
  { name: "Hyderabad", areas: ["Gachibowli", "Hitech City", "Kondapur", "Madhapur", "Jubilee Hills"] },
];

const RATE = 8.75;
const TENURE_YEARS = 20;
const DOWN_PCT = 0.20;
const SAFE_EMI_RATIO = 0.35;
const SIP_RETURN = 12;

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function fmtK(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const ref = useRef<number | null>(null);
  
  useEffect(() => {
    if (ref.current) cancelAnimationFrame(ref.current);
    const start = Date.now();
    const from = value;
    function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * ease);
      setValue(current);
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    }
    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [target]);
  
  return value;
}

interface HomePurchaseCalculatorProps {
  onBack: () => void;
  onNavigate: (screen: Screen, state?: any) => void;
}

export default function HomePurchaseCalculator({ onBack, onNavigate }: HomePurchaseCalculatorProps) {
  const [price, setPrice] = useState(10000000);
  const [salary, setSalary] = useState(150000);
  const [savings, setSavings] = useState(500000);
  const [yearsToGoal, setYearsToGoal] = useState(5);
  const [city, setCity] = useState("Bengaluru");
  const [showGoalPlanner, setShowGoalPlanner] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const downPayment = price * DOWN_PCT;
  const loanAmt = price - downPayment;
  const emiResult = useMemo(() => calculateEMI(loanAmt, RATE, TENURE_YEARS), [loanAmt]);
  const monthlyEMI = emiResult.monthlyEMI;
  const minSalary = monthlyEMI / SAFE_EMI_RATIO;
  const salaryGap = minSalary - salary;
  const qualifies = salary >= minSalary;
  const savingsGap = downPayment - savings;
  const hasSavingsGap = savingsGap > 0;
  const sipNeeded = hasSavingsGap ? calculateRequiredSIP(savingsGap, SIP_RETURN, yearsToGoal) : 0;
  const pct = Math.min(100, Math.round((savings / downPayment) * 100));

  const amortizationData = emiResult.amortization;

  const riskLevel = useMemo((): RiskLevel => {
    const ratio = monthlyEMI / salary;
    if (ratio > 0.45) return 'high';
    if (ratio > 0.30) return 'moderate';
    return 'safe';
  }, [monthlyEMI, salary]);

  const aiData = useMemo(() => {
    const totalPayment = monthlyEMI * TENURE_YEARS * 12;
    const totalInterest = totalPayment - loanAmt;
    const emiToIncomePercent = (monthlyEMI / salary) * 100;
    const monthsOfSalaryForInterest = totalInterest / salary;
    const paisaLeftPerRupee = (salary - monthlyEMI) / salary;
    const totalCostOfAsset = price + totalInterest;
    const interestToPrincipalRatio = totalInterest / loanAmt;

    return {
      propertyValue: price,
      salary,
      savings,
      yearsToGoal,
      downPayment,
      loanAmount: loanAmt,
      monthlyEMI,
      totalInterest,
      totalPayment,
      emiToIncomePercent,
      monthsOfSalaryForInterest,
      paisaLeftPerRupee,
      totalCostOfAsset,
      interestToPrincipalRatio
    };
  }, [price, salary, savings, yearsToGoal, downPayment, loanAmt, monthlyEMI]);

  const handleExport = () => {
    exportToExcel(
      "Home Purchase Readiness",
      `Dream home in ${city} at ${fmt(price)}`,
      { price, salary, savings, city },
      "Monthly EMI",
      monthlyEMI,
      [
        { label: 'Down Payment', value: downPayment },
        { label: 'Loan Amount', value: loanAmt },
        { label: 'Min. Salary Required', value: minSalary }
      ],
      `Your dream home in ${city} is within reach.`
    );
  };

  const animEMI = useCountUp(Math.round(monthlyEMI));
  const animSalary = useCountUp(Math.round(minSalary));
  const animDown = useCountUp(Math.round(downPayment));
  const animSIP = useCountUp(Math.round(sipNeeded));

  const checkColor = qualifies && !hasSavingsGap ? "green" : qualifies || pct > 50 ? "yellow" : "red";

  const handleGoalTransition = () => {
    setTransitioning(true);
    setTimeout(() => {
      setShowGoalPlanner(true);
      setTransitioning(false);
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-500" />
            Home Purchase Readiness
          </h2>
          <p className="text-zinc-500 text-sm">Can you buy that dream home?</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
            title="Export to Excel"
          >
            <Download className="w-5 h-5" />
          </button>
          <SaveScenarioButton 
            type="home_purchase" 
            inputs={{ price, salary, savings, city }} 
            outputs={{ 
              downPayment, 
              monthlyEMI, 
              minSalary, 
              qualifies,
              mainResult: isFinite(monthlyEMI) ? monthlyEMI : 0
            }} 
          />
          <button 
            onClick={() => setIsShareOpen(true)}
            className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* City selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CITIES.map(c => (
          <button 
            key={c.name} 
            onClick={() => setCity(c.name)} 
            className={cn(
              "px-4 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all",
              city === c.name 
                ? "bg-blue-500 border-blue-500 text-white" 
                : "bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/20"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!showGoalPlanner ? (
          <motion.div 
            key="calculator"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* Main Inputs Card */}
            <div className="glass-card p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <SliderWithInput
                    label="Home Price"
                    value={price}
                    min={2500000}
                    max={50000000}
                    step={500000}
                    onChange={setPrice}
                    formatDisplay={(v) => fmt(v)}
                    accentColor="blue"
                  />

                  <SliderWithInput
                    label="Monthly Salary"
                    value={salary}
                    min={30000}
                    max={500000}
                    step={5000}
                    onChange={setSalary}
                    formatDisplay={(v) => fmtK(v)}
                    accentColor="blue"
                  />

                  <SliderWithInput
                    label="Current Savings"
                    value={savings}
                    min={0}
                    max={20000000}
                    step={50000}
                    onChange={setSavings}
                    formatDisplay={(v) => fmt(v)}
                    accentColor="blue"
                  />
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Down Payment (20%)</p>
                    <p className="text-2xl font-bold text-white">{fmt(animDown)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Estimated Monthly EMI</p>
                    <p className="text-2xl font-bold text-white">{fmtK(animEMI)}</p>
                    <p className="text-[10px] text-zinc-500">{TENURE_YEARS} years @ {RATE}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                    <p className="text-xs text-blue-500 uppercase tracking-wider font-semibold">Min. Salary Required</p>
                    <p className="text-2xl font-bold text-blue-400">{fmt(animSalary)}</p>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className={cn(
                "p-4 rounded-xl border flex gap-4 items-center",
                checkColor === 'green' ? "bg-emerald-500/10 border-emerald-500/20" :
                checkColor === 'yellow' ? "bg-yellow-500/10 border-yellow-500/20" :
                "bg-red-500/10 border-red-500/20"
              )}>
                <div className="shrink-0">
                  {checkColor === 'green' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> :
                   checkColor === 'yellow' ? <AlertCircle className="w-6 h-6 text-yellow-500" /> :
                   <AlertCircle className="w-6 h-6 text-red-500" />}
                </div>
                <div className="text-sm">
                  {qualifies ? (
                    <p className="text-zinc-300">
                      Your salary qualifies. EMI will be <span className="text-white font-bold">{Math.round((monthlyEMI / salary) * 100)}% of income</span>.
                      {hasSavingsGap && <span className="block mt-1">However, you still need {fmt(savingsGap)} for the down payment.</span>}
                    </p>
                  ) : (
                    <p className="text-zinc-300">
                      Salary gap of <span className="text-white font-bold">{fmt(salaryGap)}/month</span>. At your current income, EMI would be {Math.round((monthlyEMI / salary) * 100)}% of take-home.
                    </p>
                  )}
                </div>
              </div>

              {/* Savings Progress */}
              {hasSavingsGap && (
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-xs text-zinc-500 font-medium">Down payment progress</p>
                    <span className="text-sm font-bold text-white">{pct}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        ) : (
          <motion.div 
            key="goal-planner"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Goal Planner</h3>
                <p className="text-xs text-zinc-500">Pre-filled from Dream Home</p>
              </div>
            </div>

            <div className="space-y-8">
              <SliderWithInput
                label="Years to Save"
                value={yearsToGoal}
                min={1}
                max={15}
                step={1}
                onChange={setYearsToGoal}
                formatDisplay={(v) => `${v} Years`}
                accentColor="blue"
              />

              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">SIP Needed</p>
                    <p className="text-2xl font-bold text-white">{fmtK(animSIP)}<span className="text-xs font-normal text-zinc-500 ml-1">/mo</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Target</p>
                    <p className="text-2xl font-bold text-white">{fmt(savingsGap)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Timeline</p>
                    <p className="text-2xl font-bold text-white">{yearsToGoal} yrs</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    💡 Invest <span className="text-white font-bold">{fmtK(Math.round(sipNeeded))}/month</span> in a mutual fund SIP for {yearsToGoal} years at 12% returns to have <span className="text-white font-bold">{fmt(savingsGap)}</span> ready for your {city} down payment.
                  </p>
                </div>

                <div className="flex gap-2">
                  {sipNeeded < salary * 0.3 ? (
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      Manageable — {Math.round((sipNeeded / salary) * 100)}% of income
                    </div>
                  ) : sipNeeded < salary * 0.5 ? (
                    <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold text-yellow-500 uppercase tracking-wider">
                      Stretch — {Math.round((sipNeeded / salary) * 100)}% of income
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                      Too steep — Try {yearsToGoal + 3} years
                    </div>
                  )}
                </div>
              </div>

              <InfoBox 
                level={riskLevel}
                message={`To reach your home goal in ${yearsToGoal} years, you need an additional ${formatCurrency(savingsGap)} for the down payment.`}
              />
            </div>

            <button 
              onClick={() => setShowGoalPlanner(false)}
              className="w-full py-3 text-zinc-500 hover:text-white text-xs font-medium transition-colors"
            >
              ← Back to Home Details
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No gap state */}
      {!hasSavingsGap && !showGoalPlanner && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 text-center space-y-6 bg-emerald-500/5 border-emerald-500/10"
        >
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Down payment covered!</h3>
            <p className="text-sm text-zinc-500">
              Your savings of {fmt(savings)} exceed the {fmt(downPayment)} required. Focus on EMI affordability.
            </p>
          </div>
        </motion.div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Price Breakdown Chart */}
        <div className="p-6 min-w-0 border border-white/10 rounded-2xl bg-transparent">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Property Price Breakdown</h3>
          <div className="h-[300px] w-full bg-transparent" style={{ minWidth: 0, minHeight: 300 }}>
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%" className="bg-transparent">
                <BarChart
                  data={[
                    { 
                      name: 'Property Price', 
                      'Down Payment': downPayment, 
                      'Loan Amount': loanAmt 
                    }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  className="!bg-transparent"
                  style={{ background: 'transparent !important', backgroundColor: 'transparent !important' }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => formatCompactNumber(val)}
                  />
                  <Tooltip 
                    cursor={false}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                  <Legend verticalAlign="top" align="center" height={48} iconType="circle" />
                  <Bar dataKey="Down Payment" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} barSize={60} />
                  <Bar dataKey="Loan Amount" stackId="a" fill="#52525b" radius={[0, 0, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Amortization Chart */}
        <div className="p-6 min-w-0 border border-white/10 rounded-2xl bg-transparent">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">EMI Amortization</h3>
          <div className="h-[300px] w-full bg-transparent" style={{ minWidth: 0, minHeight: 300 }}>
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%" className="!bg-transparent">
                <AreaChart data={amortizationData} className="!bg-transparent" style={{ background: 'transparent !important', backgroundColor: 'transparent !important' }}>
                  <defs>
                    <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    stroke="#52525b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#52525b', fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => formatCompactNumber(val)}
                  />
                  <Tooltip 
                    cursor={false}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend verticalAlign="top" align="center" height={48} iconType="circle" />
                  <Area 
                    type="monotone" 
                    dataKey="principal" 
                    name="Principal Component"
                    stackId="1"
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorPrincipal)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="interest" 
                    name="Interest Component"
                    stackId="1"
                    stroke="#52525b" 
                    fill="#52525b"
                    fillOpacity={0.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <AIInsightSection 
        title="Dream Home Vision"
        description={`Your dream home in ${city} at ${formatIndianRupees(price)} is within reach. Monthly EMI would be ${formatIndianRupees(monthlyEMI)}.`}
        mainValue={monthlyEMI}
        mainLabel="Monthly EMI"
        secondaryValues={[
          { label: 'Home Price', value: price },
          { label: 'Down Payment', value: downPayment },
          { label: 'Loan Amount', value: loanAmt },
          { label: 'Min. Salary', value: minSalary }
        ]}
        category="borrow"
        inputs={aiData}
        onInsightGenerated={setAiInsight}
        customPrompt={(() => {
          const bulletInstructions = "Bullet 1 must state the emiToIncomePercent and compare it to the monthly salary. Bullet 2 must state the monthsOfSalaryForInterest showing how many months of total work go only toward paying the bank's interest. Bullet 3 must state the paisaLeftPerRupee showing how much of every 1 rupee earned is left after the EMI is paid.";
          return GLOBAL_AI_INSTRUCTION + "\n\nData:\n" + JSON.stringify(aiData) + "\n\nBullet instructions:\n" + bulletInstructions;
        })()}
      />

      {/* Explore Further Section */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Explore Further</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Goal Planner Card */}
          <button 
            onClick={() => onNavigate('goal', { targetAmount: downPayment })}
            className="glass-card p-6 text-left hover:bg-white/5 transition-all border-l-4 border-l-emerald-500 flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">Save for Down Payment</h4>
                <p className="text-xs text-zinc-500">How much do you need to save monthly to afford this home?</p>
              </div>
            </div>
            <div className="mt-6 text-xs font-bold text-emerald-500 flex items-center gap-1">
              Open Goal Planner <ArrowRight className="w-3 h-3" />
            </div>
          </button>

          {/* Buy vs Rent Card */}
          <button 
            onClick={() => onNavigate('buy_vs_rent', { 
              propertyPrice: price, 
              downPaymentPercent: 20, 
              loanRate: RATE, 
              tenureYears: TENURE_YEARS 
            })}
            className="glass-card p-6 text-left hover:bg-white/5 transition-all border-l-4 border-l-emerald-500 flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">Buy vs Rent</h4>
                <p className="text-xs text-zinc-500">Is buying actually better than renting and investing the difference?</p>
              </div>
            </div>
            <div className="mt-6 text-xs font-bold text-emerald-500 flex items-center gap-1">
              Compare Now <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>

      <ShareVision 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Dream Home Vision"
        description={`Your dream home in ${city} at ${formatIndianRupees(price)} is within reach.`}
        mainValue={downPayment}
        mainLabel="Down Payment"
        secondaryValues={[
          { label: 'Monthly EMI', value: monthlyEMI },
          { label: 'Min. Salary', value: minSalary }
        ]}
        insight={renderInsight(aiInsight || (qualifies ? "Your salary qualifies for this purchase." : "Consider a lower price point or higher down payment."))}
        category="buy"
        inputs={{ price, salary, savings, city, monthlyEMI, emiToIncome: Math.round((monthlyEMI / salary) * 100), propertyPrice: price, downPayment, loanAmount: loanAmt }}
        onSave={() => setIsShareOpen(false)}
      />
    </div>
  );
}
