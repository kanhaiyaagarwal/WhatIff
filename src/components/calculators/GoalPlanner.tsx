import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Target, Info, Share2, Sparkles, Download, Instagram, MessageCircle, Linkedin, ChevronLeft } from 'lucide-react';
import { formatCurrency, cn, formatCompactNumber, formatIndianRupees } from '../../lib/utils';
import SaveScenarioButton from '../SaveScenarioButton';
import ShareVision from '../ShareVision';
import InvestmentBrokerSection from '../InvestmentBrokerSection';
import InfoBox, { RiskLevel } from '../InfoBox';
import { exportToExcel } from '../../lib/exportUtils';
import AIInsightSection from '../AIInsightSection';

import SliderWithInput from '../SliderWithInput';

interface GoalPlannerProps {
  onBack: () => void;
  initialData?: {
    targetAmount?: number;
  };
}

export default function GoalPlanner({ onBack, initialData }: GoalPlannerProps) {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount || 5000000);
  const [years, setYears] = useState(10);
  const [monthlySIP, setMonthlySIP] = useState(15000);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');

  const { isOverInvesting, simpleMonthlyNeeded } = useMemo(() => {
    const tenureMonths = years * 12;
    const needed = targetAmount / tenureMonths;
    return {
      isOverInvesting: monthlySIP > needed,
      simpleMonthlyNeeded: Math.round(needed)
    };
  }, [targetAmount, years, monthlySIP]);

  const requiredReturn = useMemo(() => {
    if (isOverInvesting) return 0;
    let low = 0;
    let high = 2; // 200% annual return
    const n = years * 12;

    for (let i = 0; i < 100; i++) {
      const r = (low + high) / 2;
      const monthlyRate = r / 12;
      let fv = 0;
      if (monthlyRate === 0) {
        fv = monthlySIP * n;
      } else {
        fv = monthlySIP * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
      }

      if (fv < targetAmount) {
        low = r;
      } else {
        high = r;
      }
    }
    return Math.round(low * 1000) / 10;
  }, [targetAmount, years, monthlySIP]);

  const totalInvestment = monthlySIP * years * 12;
  const totalEarnings = isOverInvesting ? 0 : targetAmount - totalInvestment;
  const wealthGainPercent = isOverInvesting ? 0 : Math.round((totalEarnings / targetAmount) * 100);
  const finalCorpus = isOverInvesting ? totalInvestment : targetAmount;

  const yearlyData = useMemo(() => {
    const data = [];
    const monthlyRate = requiredReturn / 12 / 100;
    const n = years * 12;
    let balance = 0;
    let investment = 0;

    for (let m = 1; m <= n; m++) {
      balance = (balance + monthlySIP) * (1 + monthlyRate);
      investment += monthlySIP;

      if (m % 12 === 0) {
        data.push({
          year: m / 12,
          balance: Math.round(balance),
          investment: Math.round(investment),
        });
      }
    }
    return data;
  }, [requiredReturn, years, monthlySIP]);

  const allocation = useMemo(() => {
    if (requiredReturn < 7) {
      return { 
        label: 'Conservative', 
        equity: 0, debt: 80, gold: 10, liquid: 10,
        note: 'Focuses on capital protection with minimal equity exposure.'
      };
    } else if (requiredReturn < 9) {
      return { 
        label: 'Moderate', 
        equity: 30, debt: 55, gold: 10, liquid: 5,
        note: 'A balanced mix of stability and growth potential.'
      };
    } else if (requiredReturn < 12) {
      return { 
        label: 'Growth', 
        equity: 70, debt: 20, gold: 10, liquid: 0,
        note: 'Equity-heavy to maximize compounding over the long term.'
      };
    } else if (requiredReturn <= 15) {
      return { 
        label: 'Aggressive', 
        equity: 85, debt: 10, gold: 5, liquid: 0,
        note: 'High-risk, high-reward strategy for ambitious goals.'
      };
    } else {
      return { 
        label: 'Unrealistic', 
        equity: 0, debt: 0, gold: 0, liquid: 0,
        note: "This goal isn't achievable at this SIP and timeline. Try increasing your monthly SIP or extending your timeline."
      };
    }
  }, [requiredReturn]);

  const handleExport = () => {
    exportToExcel(
      `${goalName} Goal Plan`,
      `Target of ${formatCurrency(targetAmount)} in ${years} years`,
      { targetAmount, years, monthlySIP },
      "Required Return Rate",
      requiredReturn,
      [
        { label: 'Total Principal', value: totalInvestment },
        { label: 'Wealth Gain', value: totalEarnings }
      ],
      `To reach your goal, you need a return rate of ${requiredReturn}% p.a.`
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-500" />
            Goal Planner
          </h2>
          <p className="text-zinc-500 text-sm">Reverse engineer your financial dreams.</p>
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
            type="goal" 
            inputs={{ targetAmount, years, monthlySIP }} 
            outputs={{ 
              requiredReturn, 
              totalInvestment, 
              totalEarnings,
              mainResult: isFinite(monthlySIP) ? monthlySIP : 0
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Controls */}
        <div className="space-y-6 w-full">
          {isOverInvesting && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-500">
                <Info className="w-4 h-4" />
                <p className="text-sm font-bold uppercase tracking-wider">Over-Investing Detected</p>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Your monthly SIP of <span className="text-white font-medium">{formatCurrency(monthlySIP)}</span> already covers this goal without any market returns. 
                You only need <span className="text-white font-medium">{formatIndianRupees(simpleMonthlyNeeded)}</span> per month to reach <span className="text-white font-medium">{formatCurrency(targetAmount)}</span> in {years} years. 
                Consider reducing your SIP or setting a bigger goal.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">What's your goal?</label>
            <input 
              type="text" 
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="e.g. Retirement, Dream Home, World Tour"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 text-white"
            />
          </div>

          <SliderWithInput
            label="Target Amount"
            value={targetAmount}
            min={100000}
            max={50000000}
            step={100000}
            onChange={setTargetAmount}
            formatDisplay={(v) => formatCurrency(v)}
          />

          <SliderWithInput
            label="Years"
            value={years}
            min={1}
            max={40}
            step={1}
            onChange={setYears}
            formatDisplay={(v) => `${v} Years`}
          />

          <SliderWithInput
            label="Monthly SIP"
            value={monthlySIP}
            min={500}
            max={200000}
            step={500}
            onChange={setMonthlySIP}
            formatDisplay={(v) => formatCurrency(v)}
          />
        </div>

        {/* Results Card */}
        <div className="glass-card p-8 space-y-8 flex flex-col w-full h-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Monthly SIP</p>
              <p className="text-xl font-bold text-white">{formatCurrency(monthlySIP)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Required Return Rate</p>
              <p className={cn("text-xl font-bold", requiredReturn > 15 ? "text-red-500" : "text-emerald-400")}>
                {requiredReturn}% <span className="text-[10px] uppercase">p.a</span>
              </p>
              {isOverInvesting && (
                <p className="text-[10px] text-zinc-500 leading-tight mt-1">
                  No market returns needed — your monthly SIP contributions alone exceed this goal.
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Invested</p>
              <p className="text-lg font-bold text-white">{formatCurrency(totalInvestment)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Wealth Gain</p>
              <p className={cn("text-lg font-bold", isOverInvesting ? "text-zinc-500" : "text-emerald-400")}>
                +{formatCurrency(totalEarnings)}
              </p>
            </div>
          </div>
          
          {!isOverInvesting && (
            <InfoBox 
              level={requiredReturn > 15 ? 'high' : requiredReturn > 12 ? 'moderate' : 'safe'}
              message={requiredReturn > 15 
                ? "This goal requires extremely high returns. Consider increasing your SIP or timeline."
                : `To reach ${formatCurrency(targetAmount)} in ${years} years with ${formatCurrency(monthlySIP)} SIP, you need a ${requiredReturn}% annual return.`}
              className="w-full mt-auto"
            />
          )}
        </div>
      </div>

      {isOverInvesting && (
        <div className="p-6 rounded-2xl bg-zinc-900 border-l-4 border-emerald-500 shadow-xl space-y-2">
          <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
            WHATIFF AI INSIGHT
          </p>
          <p className="text-sm text-zinc-300 leading-relaxed">
            With <span className="text-white font-medium">{formatCurrency(monthlySIP)}</span> per month for {years} years you will accumulate <span className="text-white font-medium">{formatIndianRupees(finalCorpus)}</span> — <span className="text-white font-medium">{formatIndianRupees(finalCorpus - targetAmount)}</span> more than your <span className="text-white font-medium">{formatIndianRupees(targetAmount)}</span> goal. 
            Reduce your SIP to <span className="text-white font-medium">{formatIndianRupees(simpleMonthlyNeeded)}</span> and redirect the <span className="text-white font-medium">{formatIndianRupees(monthlySIP - simpleMonthlyNeeded)}</span> difference to a higher-growth instrument, or set a bigger goal that puts this capital to work.
          </p>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donut Chart */}
        <div className="glass-card p-6 min-w-0">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Wealth Breakdown</h3>
          <div className="h-[300px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Principal', value: totalInvestment },
                    { name: 'Wealth Gain', value: Math.max(0, totalEarnings) }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#52525b" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-bold text-emerald-400">
                {wealthGainPercent}%
              </p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Wealth Gain</p>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-600" />
              <span className="text-xs text-zinc-400">Principal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-400">Wealth Gain</span>
            </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="glass-card p-6 min-w-0">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Growth Projection</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyData}>
                <defs>
                  <linearGradient id="colorValueGoal" x1="0" y1="0" x2="0" y2="1">
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
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  formatter={(value: number) => [formatCurrency(value), 'Value']}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValueGoal)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="investment" 
                  stroke="#3f3f46" 
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Asset Allocation Section */}
      {!isOverInvesting && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recommended Asset Allocation</h3>
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
              requiredReturn < 7 ? "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20" :
              requiredReturn < 9 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
              requiredReturn < 12 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
              requiredReturn <= 15 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
              "bg-red-500/10 text-red-500 border border-red-500/20"
            )}>
              {allocation.label}
            </span>
          </div>

          {requiredReturn > 15 ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-500 font-medium">{allocation.note}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setMonthlySIP(prev => Math.min(prev + 5000, 200000))}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-all"
                >
                  Increase SIP by ₹5,000
                </button>
                <button 
                  onClick={() => setYears(prev => Math.min(prev + 2, 40))}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-all"
                >
                  Extend by 2 years
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stacked Bar */}
              <div className="h-4 w-full flex rounded-full overflow-hidden bg-zinc-800">
                {allocation.equity > 0 && (
                  <div 
                    style={{ width: `${allocation.equity}%` }} 
                    className="bg-emerald-500 h-full flex items-center justify-center"
                  >
                    <span className="text-[8px] font-bold text-white">{allocation.equity}%</span>
                  </div>
                )}
                {allocation.debt > 0 && (
                  <div 
                    style={{ width: `${allocation.debt}%` }} 
                    className="bg-blue-500 h-full flex items-center justify-center"
                  >
                    <span className="text-[8px] font-bold text-white">{allocation.debt}%</span>
                  </div>
                )}
                {allocation.gold > 0 && (
                  <div 
                    style={{ width: `${allocation.gold}%` }} 
                    className="bg-amber-500 h-full flex items-center justify-center"
                  >
                    <span className="text-[8px] font-bold text-white">{allocation.gold}%</span>
                  </div>
                )}
                {allocation.liquid > 0 && (
                  <div 
                    style={{ width: `${allocation.liquid}%` }} 
                    className="bg-zinc-500 h-full flex items-center justify-center"
                  >
                    <span className="text-[8px] font-bold text-white">{allocation.liquid}%</span>
                  </div>
                )}
              </div>

              {/* Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Equity {allocation.equity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Debt {allocation.debt}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Gold {allocation.gold}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Liquid {allocation.liquid}%</span>
                </div>
              </div>

              <p className="text-xs text-zinc-500 italic">
                {allocation.note}
              </p>
            </div>
          )}
        </div>
      )}


      {!isOverInvesting && (
        <AIInsightSection 
          title={`${goalName} Vision`}
          description={`To achieve your goal of ${formatIndianRupees(targetAmount)} in ${years} years, you need a return rate of ${requiredReturn}% p.a.`}
          mainValue={requiredReturn}
          mainLabel="Required Return"
          secondaryValues={[
            { label: 'Target Amount', value: targetAmount },
            { label: 'Time Period', value: `${years} Years` },
            { label: 'Monthly SIP', value: monthlySIP },
            { label: 'Wealth Gain', value: totalEarnings }
          ]}
          category="grow"
          inputs={{ targetAmount, years, monthlySIP, requiredReturn, isOverInvesting }}
          onInsightGenerated={setAiInsight}
          customPrompt={`
            You are a smart, warm friend who is good with numbers. You are not a financial advisor. You are not telling anyone what to do. You are simply showing people what their own numbers mean — in plain, everyday language that anyone can understand.
            HARD RULES — these override everything:

            Never tell the user what to do
            Never use: should, consider, recommend, try, could, might want to
            Never mention specific financial products or investment instruments
            Never promise or imply a future outcome
            Every number you reference must come directly from the user's inputs and outputs — never invent figures
            Any external benchmark used must be clearly labelled as an approximate Indian average (e.g., 'The average Indian family spends about X on Y')

            LANGUAGE RULES:
            Use 'I' and 'You'
            Keep sentences short. No jargon.
            If a number is large, explain it (e.g., 'That's enough to buy 4 luxury cars' or 'That's 12 years of groceries')
            Be encouraging but strictly factual.

            FACTUAL RULES:
            If a number is bad (e.g., high interest), don't sugarcoat it. Just state the consequence (e.g., 'You will pay back double what you borrowed').
            If they are doing well, celebrate the math, not the person.

            MAKE IT HUMAN:
            Use approximate Indian benchmarks for context:
            - A mid-range SUV: ₹15-20 Lakhs
            - A premium 3BHK in a Tier-1 city: ₹2-3 Crores
            - A year of engineering college: ₹3-5 Lakhs
            - A grand wedding: ₹25-50 Lakhs
            - Monthly groceries for a family of 4: ₹15,000

            STRUCTURE:
            Paragraph 1: What the numbers show (The 'Mirror')
            Paragraph 2: What it means in real life (The 'Anchor')
            Paragraph 3: The one thing they did not know (The 'Insight' - e.g., the impact of inflation or the power of the last 5 years of compounding)

            EXAMPLES OF THE CORRECT TONE:
            'Your numbers show that in 20 years, you will have ₹1.2 Crores. To put that in perspective, that's roughly the cost of two premium apartments today. One thing the math reveals: nearly 60% of this final amount comes only in the last 5 years of your journey. Time is doing the heavy lifting here.'
            'At this interest rate, you are paying ₹40 Lakhs just for the privilege of borrowing ₹50 Lakhs. That interest alone could have funded a child's entire higher education. The math shows that for every ₹1 you borrowed, you are giving back ₹1.80.'

            AI insights must be strictly factual and number-based. They must never constitute financial advice, investment recommendations, or financial planning guidance.

            Analyze this goal plan for an Indian user. 
            Goal: ${goalName}, target amount ₹${targetAmount}, years ${years}, monthly SIP ₹${monthlySIP}, required return rate ${requiredReturn}% p.a.`}
        />
      )}

      {/* Investment Platforms */}
      <InvestmentBrokerSection />

      <ShareVision 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={`${goalName} Vision`}
        description={`To reach ${formatIndianRupees(targetAmount)} in ${years} years.`}
        mainValue={monthlySIP}
        mainLabel="Monthly SIP"
        secondaryValues={[
          { label: 'Monthly SIP', value: monthlySIP },
          { label: 'Required Return', value: `${requiredReturn}%` }
        ]}
        insight={aiInsight || (requiredReturn <= 12 ? "Achievable — This goal is well within historical market returns." : "Aggressive — Requires high equity exposure and risk tolerance.")}
        category="grow"
        inputs={{ targetAmount, years, monthlySIP, requiredReturn }}
        onSave={() => setIsShareOpen(false)}
      />
    </div>
  );
}
