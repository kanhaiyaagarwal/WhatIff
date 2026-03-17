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
import { GLOBAL_AI_INSTRUCTION } from '../../aiInsightPrompt';
import { calculateLoanAffordability } from '../../lib/calculators';
import { formatCurrency, cn, formatCompactNumber, formatIndianRupees } from '../../lib/utils';
import SaveScenarioButton from '../SaveScenarioButton';
import ShareVision from '../ShareVision';
import BrokerSection from '../BrokerSection';
import InfoBox, { RiskLevel } from '../InfoBox';
import { exportToExcel } from '../../lib/exportUtils';
import AIInsightSection from '../AIInsightSection';
import { renderInsight } from '../../renderInsight';

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

  const aiData = useMemo(() => {
    const totalPayment = result.availableEMI * tenure * 12;
    const totalInterest = totalPayment - result.maxLoan;
    const interestToPrincipalRatio = result.maxLoan > 0 ? totalInterest / result.maxLoan : 0;
    const monthlyInterestCost = (result.maxLoan * (interestRate / 100)) / 12;
    const totalCostOfAsset = result.maxLoan + totalInterest;
    
    const inflationAdjustedPrincipal = result.maxLoan * Math.pow(1.06, tenure);
    const purchasingPowerLoss = inflationAdjustedPrincipal - result.maxLoan;
    const realSurplus = totalPayment - inflationAdjustedPrincipal;

    return {
      monthlyIncome,
      existingEMI,
      interestRate,
      tenure,
      maxLoan: result.maxLoan,
      availableEMI: result.availableEMI,
      totalInterest,
      totalPayment,
      interestToPrincipalRatio,
      monthlyInterestCost,
      totalCostOfAsset,
      inflationAdjustedPrincipal,
      purchasingPowerLoss,
      realSurplus
    };
  }, [monthlyIncome, existingEMI, interestRate, tenure, result]);

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
        inputs={aiData}
        onInsightGenerated={setAiInsight}
        customPrompt={(() => {
          const bulletInstructions = "Bullet 1 must state the interestToPrincipalRatio showing how many rupees of interest are paid for every 1 rupee of principal borrowed. Bullet 2 must state the monthlyInterestCost and compare it to the availableEMI to show how much of the first month's payment is just interest. Bullet 3 must state the totalCostOfAsset (principal + totalInterest) and compare it to the original maxLoan to show the total multiplier effect.";
          return GLOBAL_AI_INSTRUCTION + "\n\nData:\n" + JSON.stringify(aiData) + "\n\nBullet instructions:\n" + bulletInstructions;
        })()}
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
        insight={renderInsight(aiInsight || (result.riskLevel === 'Safe' ? 'You are well within safe borrowing limits. Lenders will likely approve your application quickly.' : 'Your debt levels are manageable but approach with caution.'))}
        category="borrow"
        inputs={{ monthlyIncome, existingEMI, interestRate, tenure, availableEMI: result.availableEMI, riskLevel: result.riskLevel, income: monthlyIncome }}
        onSave={() => setIsShareOpen(false)}
      />
    </div>
  );
}
