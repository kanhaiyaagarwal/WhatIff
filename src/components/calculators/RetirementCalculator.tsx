import React, { useState, useMemo, useEffect } from 'react';
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
  Area,
  ReferenceLine
} from 'recharts';
import { Palmtree, Info, Share2, AlertTriangle, ChevronLeft, Download } from 'lucide-react';
import { calculateRetirement } from '../../lib/calculators';
import { formatCurrency, formatCompactNumber, formatIndianRupees } from '../../lib/utils';
import SaveScenarioButton from '../SaveScenarioButton';
import ShareVision from '../ShareVision';
import InvestmentBrokerSection from '../InvestmentBrokerSection';
import InfoBox, { RiskLevel } from '../InfoBox';
import { exportToExcel } from '../../lib/exportUtils';
import AIInsightSection from '../AIInsightSection';

import SliderWithInput from '../SliderWithInput';

interface RetirementCalculatorProps {
  onBack: () => void;
}

export default function RetirementCalculator({ onBack }: RetirementCalculatorProps) {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyExpense, setMonthlyExpense] = useState(50000);
  const [inflation, setInflation] = useState(6);
  const [returnPre, setReturnPre] = useState(12);
  const [returnPost, setReturnPost] = useState(8);
  const [currentSIP, setCurrentSIP] = useState(10000);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const result = useMemo(() => {
    return calculateRetirement(
      currentAge, 
      retirementAge, 
      monthlyExpense, 
      inflation, 
      returnPre, 
      returnPost
    );
  }, [currentAge, retirementAge, monthlyExpense, inflation, returnPre, returnPost]);

  // Calculate required SIP to reach corpus
  const requiredSIP = useMemo(() => {
    const r = returnPre / 12 / 100;
    const n = (retirementAge - currentAge) * 12;
    if (n <= 0) return 0;
    const sip = result.corpusRequired / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    return Math.round(sip);
  }, [result.corpusRequired, returnPre, retirementAge, currentAge]);

  const riskLevel = useMemo((): RiskLevel => {
    if (requiredSIP < 10000) return 'safe';
    if (requiredSIP < 30000) return 'moderate';
    return 'high';
  }, [requiredSIP]);

  const projectedCorpus = useMemo(() => {
    const r = returnPre / 12 / 100;
    const n = (retirementAge - currentAge) * 12;
    if (n <= 0) return 0;
    const fv = currentSIP * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    return Math.round(fv);
  }, [currentSIP, returnPre, retirementAge, currentAge]);

  const accumulationData = useMemo(() => {
    const data = [];
    const r = returnPre / 12 / 100;
    const n = (retirementAge - currentAge) * 12;
    let balance = 0;
    let investment = 0;

    for (let m = 1; m <= n; m++) {
      balance = (balance + currentSIP) * (1 + r);
      investment += currentSIP;

      if (m % 12 === 0) {
        data.push({
          age: currentAge + (m / 12),
          balance: Math.round(balance),
          investment: Math.round(investment),
        });
      }
    }
    return data;
  }, [currentAge, retirementAge, currentSIP, returnPre]);

  const handleExport = () => {
    exportToExcel(
      "Retirement Plan",
      `Corpus of ${formatCurrency(result.corpusRequired)} for ${result.yearsInRetirement} years`,
      { currentAge, retirementAge, monthlyExpense, inflation, returnPre, returnPost },
      "Target Corpus",
      result.corpusRequired,
      [
        { label: 'Required Monthly SIP', value: requiredSIP },
        { label: 'Future Monthly Expense', value: result.futureMonthlyExpense }
      ],
      `You need a corpus of ${formatCurrency(result.corpusRequired)} to sustain your lifestyle.`
    );
  };

  const handleSave = () => {
    setIsShareOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palmtree className="w-6 h-6 text-emerald-500" />
            Retirement Planning
          </h2>
          <p className="text-zinc-500 text-sm">Plan your financial freedom.</p>
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
            type="retirement" 
            inputs={{ currentAge, retirementAge, monthlyExpense, inflation, returnPre, returnPost }} 
            outputs={{ 
              ...result, 
              requiredSIP, 
              mainResult: isFinite(result.corpusRequired) ? result.corpusRequired : 0 
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
            label="Current Age"
            value={currentAge}
            min={18}
            max={retirementAge - 1}
            step={1}
            onChange={setCurrentAge}
            formatDisplay={(v) => `${v}`}
          />
          <SliderWithInput
            label="Retire Age"
            value={retirementAge}
            min={currentAge + 1}
            max={80}
            step={1}
            onChange={setRetirementAge}
            formatDisplay={(v) => `${v}`}
          />

          <SliderWithInput
            label="Monthly Expense"
            value={monthlyExpense}
            min={10000}
            max={500000}
            step={5000}
            onChange={setMonthlyExpense}
            formatDisplay={(v) => formatCurrency(v)}
          />

          <SliderWithInput
            label="Inflation (%)"
            value={inflation}
            min={1}
            max={15}
            step={0.5}
            onChange={setInflation}
            formatDisplay={(v) => `${v}%`}
          />

          <SliderWithInput
            label="Pre-Retire Return"
            value={returnPre}
            min={1}
            max={30}
            step={0.5}
            onChange={setReturnPre}
            formatDisplay={(v) => `${v}%`}
          />
          <SliderWithInput
            label="Post-Retire Return"
            value={returnPost}
            min={1}
            max={20}
            step={0.5}
            onChange={setReturnPost}
            formatDisplay={(v) => `${v}%`}
          />

          <SliderWithInput
            label="Current Monthly SIP"
            value={currentSIP}
            min={0}
            max={200000}
            step={1000}
            onChange={setCurrentSIP}
            formatDisplay={(v) => formatCurrency(v)}
          />
        </div>

        {/* Results Card */}
        <div className="glass-card p-8 space-y-8 flex flex-col w-full h-full">
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Corpus Required</p>
            <p className="text-4xl font-bold text-white">{formatCurrency(result.corpusRequired)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Future Monthly Exp.</p>
              <p className="text-lg font-bold text-white">{formatCurrency(result.futureMonthlyExpense)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Required Monthly SIP</p>
              <p className="text-lg font-bold text-emerald-400">{formatCurrency(requiredSIP)}</p>
            </div>
          </div>
          
          <div className="pt-2">
            <InfoBox 
              level={riskLevel}
              message={`Assuming a life expectancy of 85 years, you will spend ${result.yearsInRetirement} years in retirement.`}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accumulation Chart */}
        <div className="glass-card p-6 min-w-0">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Corpus Accumulation</h3>
          <div className="h-[300px] w-full" style={{ minWidth: 0, minHeight: 300 }}>
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accumulationData}>
                  <defs>
                    <linearGradient id="colorValueRetire" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="age" 
                    stroke="#52525b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    label={{ value: 'Age', position: 'insideBottom', offset: -5, fill: '#52525b', fontSize: 10 }}
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
                    formatter={(value: number) => [formatCurrency(value), 'Value']}
                    labelFormatter={(label) => `Age ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValueRetire)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="glass-card p-6 min-w-0">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Corpus Comparison</h3>
          <div className="h-[300px] w-full" style={{ minWidth: 0, minHeight: 300 }}>
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Required', value: result.corpusRequired },
                    { name: 'Projected', value: projectedCorpus }
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
                  <ReferenceLine y={result.corpusRequired} stroke="#ef4444" strokeDasharray="3 3" />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                    <Cell fill="#52525b" />
                    <Cell fill={projectedCorpus >= result.corpusRequired ? '#10b981' : '#ef4444'} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-emerald-500">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-bold">Important Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Years to Retirement</p>
            <p className="text-xl font-bold text-white">{result.yearsToRetirement} Years</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Years in Retirement</p>
            <p className="text-xl font-bold text-white">{result.yearsInRetirement} Years</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Months to Sustain</p>
            <p className="text-xl font-bold text-white">{result.yearsInRetirement * 12} Months</p>
          </div>
        </div>
      </div>

      <AIInsightSection 
        title="Retirement Vision"
        description={`You need a corpus of ${formatCurrency(result.corpusRequired)} to sustain your lifestyle for ${result.yearsInRetirement} years in retirement.`}
        mainValue={result.corpusRequired}
        mainLabel="Target Corpus"
        secondaryValues={[
          { label: 'Monthly SIP', value: requiredSIP },
          { label: 'Future Expense', value: result.futureMonthlyExpense },
          { label: 'Years to Retire', value: result.yearsToRetirement },
          { label: 'Retire Age', value: retirementAge }
        ]}
        category="grow"
        inputs={{ currentAge, retirementAge, monthlyExpense, inflation, returnPre, returnPost }}
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

          Analyze this retirement plan for an Indian user. 
          Current age ${currentAge}, retirement age ${retirementAge}, monthly expense ₹${monthlyExpense}, inflation ${inflation}%, pre-retirement return ${returnPre}%, post-retirement return ${returnPost}%, required corpus ₹${result.corpusRequired}, future monthly expense ₹${result.futureMonthlyExpense}, required monthly SIP ₹${requiredSIP}.`}
      />

      <InvestmentBrokerSection />

      <ShareVision 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Retirement Vision"
        description={`To retire at ${retirementAge} with ${formatCurrency(monthlyExpense)}/month in today's money.`}
        mainValue={result.corpusRequired}
        mainLabel="Target Corpus"
        secondaryValues={[
          { label: 'Monthly SIP', value: requiredSIP },
          { label: 'Future Expense', value: result.futureMonthlyExpense },
          { label: 'Years to Retire', value: result.yearsToRetirement },
          { label: 'Retire Age', value: retirementAge }
        ]}
        insight={aiInsight || `To reach your goal, start a SIP of ${formatIndianRupees(requiredSIP)} today. Every year you delay increases this requirement by ~15%.`}
        category="grow"
        inputs={{ 
          currentAge, 
          retirementAge, 
          monthlyExpense, 
          inflation, 
          returnPre, 
          returnPost, 
          requiredSIP,
          corpusRequired: result.corpusRequired
        }}
        onSave={handleSave}
      />
    </div>
  );
}
