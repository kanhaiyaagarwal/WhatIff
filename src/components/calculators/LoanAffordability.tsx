import React, { useState, useMemo, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { ShieldCheck, Info, Share2, AlertCircle, CheckCircle2, AlertTriangle, ChevronLeft, Download } from 'lucide-react';
import { calculateLoanAffordability } from '../../lib/calculators';
import { formatCurrency, cn, formatCompactNumber, formatIndianRupees } from '../../lib/utils';
import SaveScenarioButton from '../SaveScenarioButton';
import ShareVision from '../ShareVision';
import BrokerSection from '../BrokerSection';
import InfoBox, { RiskLevel } from '../InfoBox';
import { exportToExcel } from '../../lib/exportUtils';
import AIInsightSection from '../AIInsightSection';

import SliderWithInput from '../SliderWithInput';

interface LoanAffordabilityProps {
  onBack: () => void;
}

export default function LoanAffordability({ onBack }: LoanAffordabilityProps) {
  const [monthlyIncome, setMonthlyIncome] = useState(100000);
  const [existingEMI, setExistingEMI] = useState(0);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [aiInsight, setAiInsight] = useState<string>('');
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const result = useMemo(() => {
    return calculateLoanAffordability(monthlyIncome, existingEMI, interestRate, tenure);
  }, [monthlyIncome, existingEMI, interestRate, tenure]);

  const riskLevel = useMemo((): RiskLevel => {
    const totalEMI = existingEMI + result.availableEMI;
    const ratio = totalEMI / monthlyIncome;
    
    if (ratio > 0.5) return 'high';
    if (ratio >= 0.3) return 'moderate';
    return 'safe';
  }, [existingEMI, result.availableEMI, monthlyIncome]);

  const chartData = useMemo(() => {
    const totalEMI = existingEMI + result.availableEMI;
    const buffer = Math.max(0, monthlyIncome - totalEMI);
    
    return [
      { name: 'Existing EMIs', value: existingEMI },
      { name: 'New EMI Capacity', value: result.availableEMI },
      { name: 'Remaining Income', value: buffer }
    ];
  }, [existingEMI, result.availableEMI, monthlyIncome]);

  const safeBorrowingPct = Math.round(((existingEMI + result.availableEMI) / monthlyIncome) * 100);

  const handleExport = () => {
    exportToExcel(
      "Loan Affordability Analysis",
      `Max loan eligibility for income of ${formatCurrency(monthlyIncome)}`,
      { monthlyIncome, existingEMI, interestRate, tenure },
      "Max Loan Eligibility",
      result.maxLoan,
      [
        { label: 'Safe Monthly EMI', value: result.availableEMI },
        { label: 'Risk Level', value: result.riskLevel }
      ],
      `Based on your income, you can safely afford a loan of up to ${formatCurrency(result.maxLoan)}.`
    );
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Safe': return 'text-emerald-500';
      case 'Moderate': return 'text-yellow-500';
      case 'High': return 'text-red-500';
      default: return 'text-zinc-500';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Safe': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'Moderate': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'High': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const customPrompt = useMemo(() => {
    const isZeroEligibility = result.maxLoan === 0;
    const safeEMILimit = monthlyIncome * 0.4;
    const reductionNeeded = existingEMI - safeEMILimit;

    const globalInstruction = `
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

      AI insights must be strictly factual and number-based. They must never constitute financial advice, investment recommendations, or financial planning guidance.`;

    if (isZeroEligibility) {
      return `${globalInstruction}
        Analyze these "borrow" figures:
        - Main Value (Max Loan Eligibility): 0
        - Context: Current existing EMIs (${formatIndianRupees(existingEMI)}) exceed the safe 40% threshold of income (${formatIndianRupees(monthlyIncome)}).
        - Inputs: ${JSON.stringify({ monthlyIncome, existingEMI, interestRate, tenure })}
        
        Focus on the mathematical consequence of current debt levels.
        The last bullet must state the specific reduction in monthly EMI obligations (₹${formatIndianRupees(reductionNeeded)}) required to reach the 40% benchmark, without prescribing it as an action.`;
    }

    return `${globalInstruction}
      Analyze these "borrow" figures:
      - Main Value (Max Loan Eligibility): ${result.maxLoan}
      - Context: Based on income of ${formatIndianRupees(monthlyIncome)}, the user is eligible for a loan.
      - Inputs: ${JSON.stringify({ monthlyIncome, existingEMI, interestRate, tenure })}
      
      Focus on total interest consequences and mathematical observations of the loan structure.`;
  }, [result.maxLoan, monthlyIncome, existingEMI, interestRate, tenure]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-500" />
            Loan Affordability
          </h2>
          <p className="text-zinc-500 text-sm">Check if you can safely afford a new loan.</p>
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
            type="affordability" 
            inputs={{ monthlyIncome, existingEMI, interestRate, tenure }} 
            outputs={{ 
              ...result, 
              mainResult: isFinite(result.maxLoan) ? result.maxLoan : 0 
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
          <SliderWithInput
            label="Monthly Income"
            value={monthlyIncome}
            min={20000}
            max={1000000}
            step={5000}
            onChange={setMonthlyIncome}
            formatDisplay={(v) => formatCurrency(v)}
          />

          <SliderWithInput
            label="Existing EMIs"
            value={existingEMI}
            min={0}
            max={500000}
            step={1000}
            onChange={setExistingEMI}
            formatDisplay={(v) => formatCurrency(v)}
          />

          <SliderWithInput
            label="Interest Rate"
            value={interestRate}
            min={5}
            max={25}
            step={0.1}
            onChange={setInterestRate}
            formatDisplay={(v) => `${v}%`}
          />
          <SliderWithInput
            label="Tenure"
            value={tenure}
            min={1}
            max={30}
            step={1}
            onChange={setTenure}
            formatDisplay={(v) => `${v} Years`}
          />
        </div>

        {/* Results Card */}
        <div className="glass-card p-8 space-y-8 flex flex-col w-full h-full">
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Max Loan Eligibility</p>
            <p className="text-4xl font-bold text-white">{formatCurrency(result.maxLoan)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Safe Monthly EMI</p>
              <p className="text-lg font-bold text-white">{formatCurrency(result.availableEMI)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Risk Level</p>
              <div className="flex items-center gap-2">
                {getRiskIcon(result.riskLevel)}
                <p className={cn("text-lg font-bold", getRiskColor(result.riskLevel))}>{result.riskLevel}</p>
              </div>
            </div>
          </div>
          
          <InfoBox 
            level={riskLevel}
            message="Based on the 40% debt-to-income ratio rule. Lenders typically prefer total EMIs to be within 40-50% of your net income."
            className="w-full mt-auto"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donut Chart */}
        <div className="glass-card p-6 min-w-0">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Income Allocation</h3>
          <div className="h-[300px] w-full relative flex items-center justify-center" style={{ minWidth: 0, minHeight: 300 }}>
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                    <Cell fill="#52525b" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-bold text-emerald-400">
                {safeBorrowingPct}%
              </p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Total Debt Ratio</p>
            </div>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Existing EMIs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">New Capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-600" />
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Remaining</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-card p-6 min-w-0">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">EMI Obligations</h3>
          <div className="h-[300px] w-full" style={{ minWidth: 0, minHeight: 300 }}>
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Current EMIs', value: existingEMI, color: '#f59e0b' },
                    { name: 'Max Safe EMI', value: monthlyIncome * 0.4, color: '#10b981' }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: 'transparent' }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-purple-500">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-bold">Affordability Analysis</h3>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {result.riskLevel === 'Safe' ? 'You are well within safe borrowing limits. Lenders will likely approve your application quickly.' : 
           result.riskLevel === 'Moderate' ? 'Your debt levels are manageable but approach with caution. Consider a longer tenure.' : 
           'High debt-to-income ratio. Banks may reject your application or charge higher interest rates.'}
        </p>
      </div>

      <AIInsightSection 
        title="Borrowing Power Vision"
        description={`Based on your income of ${formatIndianRupees(monthlyIncome)}, you can safely afford a loan of up to ${formatIndianRupees(result.maxLoan)}.`}
        mainValue={result.maxLoan}
        mainLabel="Max Loan Eligibility"
        secondaryValues={[
          { label: 'Safe Monthly EMI', value: result.availableEMI },
          { label: 'Risk Level', value: result.riskLevel },
          { label: 'Monthly Income', value: monthlyIncome },
          { label: 'Existing EMIs', value: existingEMI }
        ]}
        category="borrow"
        inputs={{ monthlyIncome, existingEMI, interestRate, tenure }}
        customPrompt={customPrompt}
        onInsightGenerated={setAiInsight}
      />

      <BrokerSection />

      <ShareVision 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Borrowing Power Vision"
        description={`Based on your income of ${formatIndianRupees(monthlyIncome)}, you can safely afford a loan of up to ${formatIndianRupees(result.maxLoan)}.`}
        mainValue={result.maxLoan}
        mainLabel="Max Loan Eligibility"
        secondaryValues={[
          { label: 'Safe Monthly EMI', value: result.availableEMI },
          { label: 'Risk Level', value: result.riskLevel },
          { label: 'Monthly Income', value: monthlyIncome },
          { label: 'Existing EMIs', value: existingEMI }
        ]}
        insight={aiInsight || (result.riskLevel === 'Safe' ? 'You are well within safe borrowing limits. Lenders will likely approve your application quickly.' : 'Your debt levels are manageable but approach with caution.')}
        category="borrow"
        inputs={{ monthlyIncome, existingEMI, interestRate, tenure, availableEMI: result.availableEMI, riskLevel: result.riskLevel, income: monthlyIncome }}
        onSave={() => setIsShareOpen(false)}
      />
    </div>
  );
}
