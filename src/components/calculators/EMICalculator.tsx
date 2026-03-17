import React, { useState, useMemo, useEffect } from 'react';
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
import { CreditCard, Info, Share2, ChevronLeft, Download } from 'lucide-react';
import { GLOBAL_AI_INSTRUCTION } from '../../aiInsightPrompt';
import { calculateEMI } from '../../lib/calculators';
import { formatCurrency, formatCompactNumber, formatIndianRupees } from '../../lib/utils';
import SaveScenarioButton from '../SaveScenarioButton';
import ShareVision from '../ShareVision';
import BrokerSection from '../BrokerSection';
import InfoBox, { RiskLevel } from '../InfoBox';
import { exportToExcel } from '../../lib/exportUtils';
import AIInsightSection from '../AIInsightSection';
import { renderInsight } from '../../renderInsight';

import SliderWithInput from '../SliderWithInput';

interface EMICalculatorProps {
  onBack: () => void;
}

export default function EMICalculator({ onBack }: EMICalculatorProps) {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(10);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const result = useMemo(() => {
    return calculateEMI(loanAmount, interestRate, tenure);
  }, [loanAmount, interestRate, tenure]);

  const riskLevel = useMemo((): RiskLevel => {
    if (result.monthlyEMI < 15000) return 'safe';
    if (result.monthlyEMI < 25000) return 'moderate';
    return 'high';
  }, [result.monthlyEMI]);

  const chartData = [
    { name: 'Principal', value: loanAmount, color: '#10b981' },
    { name: 'Interest', value: result.totalInterest, color: '#f87171' },
  ];

  const amortizationData = useMemo(() => {
    const data = [];
    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    let balance = loanAmount;

    for (let m = 0; m <= n; m++) {
      if (m % 12 === 0 || m === n) {
        data.push({
          year: m / 12,
          balance: Math.max(0, Math.round(balance)),
        });
      }
      const interest = balance * r;
      const principalPaid = result.monthlyEMI - interest;
      balance -= principalPaid;
    }
    return data;
  }, [loanAmount, interestRate, tenure, result.monthlyEMI]);

  const aiData = useMemo(() => {
    const interestToPrincipalRatio = result.totalInterest / loanAmount;
    const monthlyInterestCost = (loanAmount * (interestRate / 100)) / 12;
    const totalCostOfAsset = loanAmount + result.totalInterest;
    
    const inflationAdjustedPrincipal = loanAmount * Math.pow(1.06, tenure);
    const purchasingPowerLoss = inflationAdjustedPrincipal - loanAmount;
    const realSurplus = result.totalPayment - inflationAdjustedPrincipal;

    return {
      loanAmount,
      interestRate,
      tenure,
      monthlyEMI: result.monthlyEMI,
      totalInterest: result.totalInterest,
      totalPayment: result.totalPayment,
      interestToPrincipalRatio,
      monthlyInterestCost,
      totalCostOfAsset,
      inflationAdjustedPrincipal,
      purchasingPowerLoss,
      realSurplus
    };
  }, [loanAmount, interestRate, tenure, result]);

  const handleExport = () => {
    exportToExcel(
      "EMI Calculation",
      `Loan of ${formatCurrency(loanAmount)} at ${interestRate}% for ${tenure} years`,
      { loanAmount, interestRate, tenure },
      "Monthly EMI",
      result.monthlyEMI,
      [
        { label: 'Total Interest', value: result.totalInterest },
        { label: 'Total Payment', value: result.totalPayment }
      ],
      `Your total interest cost is ${formatCurrency(result.totalInterest)}.`
    );
  };

  return (
    <div className="space-y-8 w-full">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-500" />
            EMI Calculator
          </h2>
          <p className="text-zinc-500 text-sm">Calculate your monthly loan installments.</p>
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
            type="emi" 
            inputs={{ loanAmount, interestRate, tenure }} 
            outputs={{ 
              ...result, 
              mainResult: isFinite(result.monthlyEMI) ? result.monthlyEMI : 0 
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-stretch">
        {/* Controls */}
        <div className="space-y-6 w-full">
          <SliderWithInput
            label="Loan Amount"
            value={loanAmount}
            min={100000}
            max={10000000}
            step={50000}
            onChange={setLoanAmount}
            formatDisplay={(v) => formatCurrency(v)}
          />

          <SliderWithInput
            label="Interest Rate (p.a)"
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
        <div className="glass-card p-6 space-y-6 flex flex-col w-full h-full">
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Monthly EMI</p>
            <p className="text-4xl font-bold text-white">{formatCurrency(result.monthlyEMI)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Principal</p>
              <p className="text-lg font-bold text-white">{formatCurrency(loanAmount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Interest</p>
              <p className="text-lg font-bold text-red-400">{formatCurrency(result.totalInterest)}</p>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Total Payment</p>
            <p className="text-xl font-bold text-white">{formatCurrency(result.totalPayment)}</p>
          </div>

          <div className="mt-auto pt-2">
            <InfoBox 
              level={riskLevel}
              message="A healthy EMI should not exceed 30-40% of your monthly income. The EMI is calculated based on reducing balance method."
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donut Chart */}
        <div className="glass-card p-6 min-w-0">
          <h3 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-widest">Breakdown</h3>
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
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-bold text-white">
                {Math.round((loanAmount / result.totalPayment) * 100)}%
              </p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Principal</p>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-400">Principal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-xs text-zinc-400">Interest</span>
            </div>
          </div>
        </div>

        {/* Balance Chart */}
        <div className="glass-card p-6 min-w-0">
          <h3 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-widest">Loan Balance Projection</h3>
          <div className="h-[300px] w-full" style={{ minWidth: 0, minHeight: 300 }}>
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={amortizationData}>
                  <defs>
                    <linearGradient id="colorValueEMI" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(value: number) => [formatCurrency(value), 'Balance']}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValueEMI)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <AIInsightSection 
        title="Smart Borrowing Vision"
        description={`Your monthly EMI for a loan of ${formatCurrency(loanAmount)} at ${interestRate}% for ${tenure} years is ${formatCurrency(result.monthlyEMI)}.`}
        mainValue={result.monthlyEMI}
        mainLabel="Monthly EMI"
        secondaryValues={[
          { label: 'Total Interest', value: result.totalInterest },
          { label: 'Total Payment', value: result.totalPayment },
          { label: 'Loan Amount', value: loanAmount },
          { label: 'Tenure', value: `${tenure} Years` }
        ]}
        category="borrow"
        inputs={aiData}
        onInsightGenerated={setAiInsight}
        customPrompt={(() => {
          const bulletInstructions = "Bullet 1 must state the interestToPrincipalRatio showing how many rupees of interest are paid for every 1 rupee of principal borrowed. Bullet 2 must state the monthlyInterestCost and compare it to the monthlyEMI to show how much of the first month's payment is just interest. Bullet 3 must state the totalCostOfAsset (principal + totalInterest) and compare it to the original loanAmount to show the total multiplier effect.";
          return GLOBAL_AI_INSTRUCTION + "\n\nData:\n" + JSON.stringify(aiData) + "\n\nBullet instructions:\n" + bulletInstructions;
        })()}
      />

      <BrokerSection />

      <ShareVision 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Smart Borrowing Vision"
        description={`Your monthly EMI for a loan of ${formatCurrency(loanAmount)} at ${interestRate}% for ${tenure} years is ${formatCurrency(result.monthlyEMI)}.`}
        mainValue={result.monthlyEMI}
        mainLabel="Monthly EMI"
        secondaryValues={[
          { label: 'Total Interest', value: result.totalInterest },
          { label: 'Total Payment', value: result.totalPayment },
          { label: 'Loan Amount', value: loanAmount },
          { label: 'Tenure', value: `${tenure} Years` }
        ]}
        insight={renderInsight(aiInsight || `Your total interest cost is ${formatIndianRupees(result.totalInterest)}. Consider a shorter tenure to save on interest if your budget allows.`)}
        category="borrow"
        inputs={{ loanAmount, interestRate, tenure, totalInterest: result.totalInterest, totalPayment: result.totalPayment }}
        onSave={() => setIsShareOpen(false)}
      />
    </div>
  );
}
