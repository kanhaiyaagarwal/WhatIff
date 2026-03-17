import React, { useState, useMemo, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Info, Share2, ChevronLeft, Download } from 'lucide-react';
import { calculateSIP } from '../../lib/calculators';
import { formatCurrency, formatCompactNumber, cn, formatIndianRupees } from '../../lib/utils';
import SaveScenarioButton from '../SaveScenarioButton';
import ShareVision from '../ShareVision';
import InvestmentBrokerSection from '../InvestmentBrokerSection';
import InfoBox, { RiskLevel } from '../InfoBox';
import { exportToExcel } from '../../lib/exportUtils';
import AIInsightSection from '../AIInsightSection';

import SliderWithInput from '../SliderWithInput';

interface SIPCalculatorProps {
  onBack: () => void;
}

export default function SIPCalculator({ onBack }: SIPCalculatorProps) {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [annualRate, setAnnualRate] = useState(12);
  const [years, setYears] = useState(10);
  const [stepUp, setStepUp] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const riskLevel = useMemo((): RiskLevel => {
    if (annualRate > 15) return 'high';
    if (annualRate > 10) return 'moderate';
    return 'safe';
  }, [annualRate]);

  const handleExport = () => {
    exportToExcel(
      "SIP Calculation",
      `SIP of ${formatCurrency(monthlyInvestment)} at ${annualRate}% for ${years} years`,
      { monthlyInvestment, annualRate, years, stepUp },
      "Future Value",
      result.futureValue,
      [
        { label: 'Total Invested', value: result.totalInvestment },
        { label: 'Est. Returns', value: result.totalEarnings }
      ],
      `At ${annualRate}% returns, your wealth compounds significantly.`
    );
  };

  const result = useMemo(() => {
    return calculateSIP(monthlyInvestment, annualRate, years, stepUp);
  }, [monthlyInvestment, annualRate, years, stepUp]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            SIP Calculator
          </h2>
          <p className="text-zinc-500 text-sm">Systematic Investment Plan growth projection.</p>
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
            type="sip" 
            inputs={{ monthlyInvestment, annualRate, years, stepUp }} 
            outputs={{ 
              ...result, 
              mainResult: isFinite(result.futureValue) ? result.futureValue : 0 
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
            label="Monthly Investment"
            value={monthlyInvestment}
            min={500}
            max={100000}
            step={500}
            onChange={setMonthlyInvestment}
            formatDisplay={(v) => formatCurrency(v)}
          />

          <SliderWithInput
            label="Expected Return Rate"
            value={annualRate}
            min={1}
            max={30}
            step={0.5}
            onChange={setAnnualRate}
            formatDisplay={(v) => `${v}%`}
          />

          <SliderWithInput
            label="Time Period"
            value={years}
            min={1}
            max={40}
            step={1}
            onChange={setYears}
            formatDisplay={(v) => `${v} Years`}
          />

          <SliderWithInput
            label="Annual Step-up"
            value={stepUp}
            min={0}
            max={50}
            step={1}
            onChange={setStepUp}
            formatDisplay={(v) => `${v}%`}
          />
        </div>

        {/* Results Section */}
        <div className="space-y-4 w-full h-full flex flex-col">
          {/* Nominal Results Card */}
          <div className="glass-card p-8 space-y-6 flex flex-col w-full relative">
            <div className="absolute top-4 right-6">
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">NOMINAL VALUE</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Invested Amount</p>
                <p className="text-xl font-bold text-white">{formatCurrency(result.totalInvestment)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Est. Returns</p>
                <p className="text-xl font-bold text-emerald-400">+{formatCurrency(result.totalEarnings)}</p>
              </div>
            </div>
            <div className="pt-6 border-t border-white/5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Total Value</p>
              <p className="text-4xl font-bold text-white">{formatCurrency(result.futureValue)}</p>
            </div>
          </div>

          {/* Real Results Card (Inflation Adjusted) */}
          <div className="p-8 space-y-6 flex flex-col w-full rounded-2xl bg-amber-400/[0.03] border border-amber-400/20 relative">
            <div className="absolute top-4 right-6">
              <p className="text-[10px] text-amber-400 uppercase font-bold tracking-widest">IN TODAY'S MONEY</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Purchasing Power Lost</p>
                <p className="text-xl font-bold text-amber-400">{formatCurrency(result.purchasingPowerLost)}</p>
                <p className="text-[10px] text-zinc-500">Eroded by 6% annual inflation</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Real Returns</p>
                <p className={cn("text-xl font-bold", result.realReturns >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {result.realReturns >= 0 ? '+' : ''}{formatCurrency(result.realReturns)}
                </p>
                <p className="text-[10px] text-zinc-500">Actual gain above inflation</p>
              </div>
            </div>
            <div className="pt-6 border-t border-amber-400/10">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Real Corpus</p>
              <p className="text-4xl font-bold text-emerald-400">{formatCurrency(result.realCorpus)}</p>
              <p className="text-[10px] text-zinc-500 mt-1">What {formatCurrency(result.futureValue)} will buy at today's prices</p>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed px-2">
            Nominal value is the raw rupee amount. Real value is what that amount can actually buy at today's prices. Assumes 6% annual inflation — India's 10-year CPI average.
          </p>
          
          <InfoBox 
            level={riskLevel}
            message="Based on historical data, a diversified equity portfolio often yields 12-15% over long periods (10+ years)."
            className="w-full mt-auto"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Growth Chart */}
        <div className="glass-card p-6 min-w-0">
          <h3 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-widest">Growth Projection</h3>
          <div className="h-[300px] w-full" style={{ minWidth: 0, minHeight: 300 }}>
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.yearlyData}>
                  <defs>
                    <linearGradient id="colorValueSIP" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(value: number, name: string) => {
                      const label = name === 'balance' ? 'Total Value' : 
                                  name === 'investment' ? 'Invested Amount' : 
                                  name === 'realBalance' ? "Real Value (Today's ₹)" : name;
                      return [formatCurrency(value), label];
                    }}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValueSIP)" 
                    name="balance"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="realBalance" 
                    stroke="#fbbf24" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="transparent"
                    name="realBalance"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="investment" 
                    stroke="#3f3f46" 
                    strokeWidth={2}
                    fill="transparent"
                    name="investment"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="glass-card p-6 min-w-0">
          <h3 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-widest">Wealth Breakdown</h3>
          <div className="h-[300px] w-full relative flex items-center justify-center" style={{ minWidth: 0, minHeight: 300 }}>
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Principal', value: result.totalInvestment },
                      { name: 'Real Gain', value: Math.max(0, result.realReturns) },
                      { name: 'Lost to Inflation', value: result.purchasingPowerLost }
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
                    <Cell fill="#fbbf24" />
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
              <p className="text-2xl font-bold text-white">
                {formatCurrency(result.futureValue)}
              </p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Total Value</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-600" />
              <span className="text-[11px] text-zinc-400">Principal: {formatCurrency(result.totalInvestment)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-zinc-400">Real Gain: {formatCurrency(result.realReturns)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-[11px] text-zinc-400">Lost to Inflation: {formatCurrency(result.purchasingPowerLost)}</span>
            </div>
          </div>
        </div>
      </div>

      <AIInsightSection 
        title="Wealth Growth Vision"
        description={`Your SIP of ${formatCurrency(monthlyInvestment)} could grow to ${formatCurrency(result.futureValue)} in ${years} years.`}
        mainValue={result.futureValue}
        mainLabel="Future Value"
        secondaryValues={[
          { label: 'Total Invested', value: result.totalInvestment },
          { label: 'Real Corpus', value: result.realCorpus },
          { label: 'Purchasing Power Lost', value: result.purchasingPowerLost },
          { label: 'Real Returns', value: result.realReturns }
        ]}
        category="grow"
        inputs={{ monthlyInvestment, annualRate, years, stepUp, realCorpus: result.realCorpus, purchasingPowerLost: result.purchasingPowerLost, realReturns: result.realReturns }}
        onInsightGenerated={setAiInsight}
        customPrompt={`
          Give the user 3 bullet points. Each bullet must be a fact derived directly from their numbers that they would be unlikely to have calculated themselves. Nothing else.
          Rules:

          Every bullet must use the exact numbers from the user's inputs and outputs
          Every bullet must reveal something non-obvious — a ratio, a crossover point, a compounding consequence, or a relationship between two numbers the user has not directly compared
          Never restate anything already visible on the results screen
          Never give advice, recommendations, or suggestions
          Never use: should, consider, recommend, try, could, might want to
          Never mention financial products or instruments
          No preamble, no opening line, no closing line — just three bullets
          Plain simple English — one idea per bullet, one sentence per bullet
          If a number is large write it in Indian format — L for lakhs, Cr for crores

          The standard for each bullet is: would the user have known this without a calculator? If yes, discard it and find something harder to see.
          Examples of wrong bullets:
          ❌ 'Your EMI is ₹45,000 per month' — visible on screen
          ❌ 'You should increase your SIP to build more wealth' — advice
          ❌ 'Inflation reduces your returns over time' — generic, not derived from their numbers
          Examples of correct bullets:
          ✅ 'Your total interest payment of ₹28.4L over 20 years is 2.3x the original loan amount of ₹12L'
          ✅ 'At your current return rate, the growth earned in the last 3 years exceeds the total growth earned in the first 7 years combined'
          ✅ 'Your post-tax real return of 0.47% means ₹1,00,000 today becomes ₹1,00,470 in real terms after 12 months — a gain of ₹470 on a locked deposit'
          ✅ 'At 6% inflation your EMI of ₹45,000 has the same purchasing power as ₹25,200 today by the time the loan ends in 20 years'
          Three bullets. Facts only. Nothing the user already knows.

          Analyze this SIP investment for an Indian investor.
          Monthly investment: ₹${monthlyInvestment}, Expected return: ${annualRate}%, Tenure: ${years} years, Annual Step-up: ${stepUp}%.
          
          Inflation Analysis (6% fixed):
          - Nominal Future Value: ₹${result.futureValue}
          - Real Corpus (Today's Money): ₹${result.realCorpus}
          - Purchasing Power Lost: ₹${result.purchasingPowerLost}
          - Real Returns (Gain above inflation): ₹${result.realReturns}
        `}
      />

      {/* Investment Platforms */}
      <InvestmentBrokerSection />

      <ShareVision 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Wealth Growth Vision"
        description={`Your SIP of ${formatCurrency(monthlyInvestment)} could grow to ${formatCurrency(result.futureValue)} in ${years} years.`}
        mainValue={result.futureValue}
        mainLabel="Future Value"
        secondaryValues={[
          { label: 'Total Invested', value: result.totalInvestment },
          { label: 'Real Corpus', value: result.realCorpus },
          { label: 'Power Lost', value: result.purchasingPowerLost },
          { label: 'Real Returns', value: result.realReturns }
        ]}
        insight={aiInsight || `At ${annualRate}% returns, your wealth compounds significantly. However, 6% inflation will erode ${formatCurrency(result.purchasingPowerLost)} of your purchasing power.`}
        category="grow"
        inputs={{ monthlyInvestment, annualRate, years, stepUp, realCorpus: result.realCorpus, purchasingPowerLost: result.purchasingPowerLost, realReturns: result.realReturns }}
        onSave={() => setIsShareOpen(false)}
      />
    </div>
  );
}
