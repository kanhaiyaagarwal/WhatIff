import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Label
} from 'recharts';
import { Home, Share2, Download, Info, ArrowRight, BarChart3 } from 'lucide-react';
import { GLOBAL_AI_INSTRUCTION } from '../../aiInsightPrompt';
import { calculateBuyVsRent, calculateRentInvestCorpus } from '../../lib/calculators';
import { formatCurrency, formatCompactNumber, cn, formatIndianShort, formatIndianRupees } from '../../lib/utils';
import SaveScenarioButton from '../SaveScenarioButton';
import ShareVision from '../ShareVision';
import { exportToExcel } from '../../lib/exportUtils';
import AIInsightSection from '../AIInsightSection';
import { renderInsight } from '../../renderInsight';
import SliderWithInput from '../SliderWithInput';
import { Screen } from '../../App';

interface BuyVsRentCalculatorProps {
  onBack: () => void;
  initialData?: {
    propertyPrice?: number;
    downPaymentPercent?: number;
    loanRate?: number;
    tenureYears?: number;
  };
}

export default function BuyVsRentCalculator({ onBack, initialData }: BuyVsRentCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState(initialData?.propertyPrice || 6000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(initialData?.downPaymentPercent || 20);
  const [loanRate, setLoanRate] = useState(initialData?.loanRate || 8.5);
  const [tenureYears, setTenureYears] = useState(initialData?.tenureYears || 20);
  const [maintenance, setMaintenance] = useState(3000);

  const [currentRent, setCurrentRent] = useState(20000);
  const [rentIncrease, setRentIncrease] = useState(5);
  const [sipReturn, setSipReturn] = useState(12);
  const [appreciationRate, setAppreciationRate] = useState(7);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const result = useMemo(() => {
    return calculateBuyVsRent(
      propertyPrice,
      downPaymentPercent,
      loanRate,
      tenureYears,
      maintenance,
      currentRent,
      rentIncrease,
      sipReturn,
      appreciationRate
    );
  }, [propertyPrice, downPaymentPercent, loanRate, tenureYears, maintenance, currentRent, rentIncrease, sipReturn, appreciationRate]);

  const delayCost = useMemo(() => {
    const corpusNow = result.sipCorpus;
    const corpusLater = calculateRentInvestCorpus(
      propertyPrice,
      downPaymentPercent,
      loanRate,
      tenureYears - 1,
      maintenance,
      currentRent * (1 + rentIncrease / 100),
      rentIncrease,
      sipReturn
    );
    return Math.max(0, corpusNow - corpusLater);
  }, [result.sipCorpus, propertyPrice, downPaymentPercent, loanRate, tenureYears, maintenance, currentRent, rentIncrease, sipReturn]);

  const handleExport = () => {
    exportToExcel(
      "Buy vs Rent Analysis",
      `Comparison for ₹${formatCompactNumber(propertyPrice)} property over ${tenureYears} years`,
      { propertyPrice, downPaymentPercent, loanRate, tenureYears, maintenance, currentRent, rentIncrease, sipReturn, appreciationRate },
      "Net Worth Difference",
      difference,
      [
        { label: 'Buy Net Worth', value: result.netWorthBuy },
        { label: 'Rent Net Worth', value: result.netWorthRent },
        { label: 'Difference', value: Math.abs(result.netWorthRent - result.netWorthBuy) }
      ],
      `The two scenarios break even at year ${result.breakEvenYear || 'N/A'}.`
    );
  };

  const rentalYield = ((currentRent * 12) / propertyPrice) * 100;
  const winner = result.netWorthRent > result.netWorthBuy ? 'Renting + Investing' : 'Buying';
  const difference = Math.abs(result.netWorthRent - result.netWorthBuy);

  const aiData = useMemo(() => {
    return {
      propertyPrice,
      downPaymentPercent,
      loanRate,
      tenureYears,
      maintenance,
      currentRent,
      rentIncrease,
      sipReturn,
      appreciationRate,
      emi: result.emi,
      totalMonthlyBuy: result.emi + maintenance + (propertyPrice * 0.0003),
      monthlyInvestable: result.monthlyInvestable,
      totalPaidBuy: result.totalPaidBuy,
      totalRentPaid: result.totalRentPaid,
      netWorthBuy: result.netWorthBuy,
      netWorthRent: result.netWorthRent,
      breakEvenYear: result.breakEvenYear,
      rentalYield
    };
  }, [propertyPrice, downPaymentPercent, loanRate, tenureYears, maintenance, currentRent, rentIncrease, sipReturn, appreciationRate, result, rentalYield]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            Buy vs Rent Calculator
          </h2>
          <p className="text-zinc-500 text-sm">Is buying actually better than renting and investing the difference?</p>
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
            type="buy_vs_rent" 
            defaultName={`Buy vs Rent — ${formatIndianShort(propertyPrice)} property`}
            inputs={{ 
              propertyPrice, 
              downPaymentPercent, 
              loanRate, 
              tenureYears, 
              maintenance, 
              currentRent, 
              rentIncrease, 
              sipReturn, 
              appreciationRate 
            }} 
            outputs={{ 
              mainResult: result.netWorthRent - result.netWorthBuy,
              buyEMI: result.emi,
              buyMonthlyTotal: result.emi + maintenance,
              buyPropertyValue: result.propertyValueAtEnd,
              buyTotalPaid: result.totalPaidBuy,
              buyNetWorth: result.netWorthBuy,
              rentMonthlySIP: result.monthlyInvestable,
              rentTotalPaid: result.totalRentPaid,
              rentCorpus: result.sipCorpus,
              rentNetWorth: result.netWorthRent,
              breakEvenYear: result.breakEvenYear,
              winner: result.netWorthRent > result.netWorthBuy ? 'rent' : 'buy',
              winnerMargin: Math.abs(result.netWorthRent - result.netWorthBuy),
              propertyPrice: propertyPrice,
              downPayment: propertyPrice * (downPaymentPercent / 100),
              loanRate: loanRate,
              tenure: tenureYears,
              monthlyRent: currentRent,
              sipReturn: sipReturn,
              appreciationRate: appreciationRate
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
        <div className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2">Property & Loan</h3>
            
            <SliderWithInput
              label="Property Price"
              value={propertyPrice}
              min={1000000}
              max={50000000}
              step={100000}
              onChange={setPropertyPrice}
              formatDisplay={(v) => formatCurrency(v)}
              tag={initialData?.propertyPrice ? "From Home Purchase" : undefined}
            />

            <SliderWithInput
              label="Down Payment %"
              value={downPaymentPercent}
              min={10}
              max={50}
              step={5}
              onChange={setDownPaymentPercent}
              formatDisplay={(v) => `${v}%`}
              tag={initialData?.downPaymentPercent ? "From Home Purchase" : undefined}
            />

            <SliderWithInput
              label="Home Loan Rate"
              value={loanRate}
              min={6}
              max={15}
              step={0.25}
              onChange={setLoanRate}
              formatDisplay={(v) => `${v}%`}
              tag={initialData?.loanRate ? "From Home Purchase" : undefined}
            />

            <SliderWithInput
              label="Loan Tenure"
              value={tenureYears}
              min={5}
              max={30}
              step={1}
              onChange={setTenureYears}
              formatDisplay={(v) => `${v} Years`}
              tag={initialData?.tenureYears ? "From Home Purchase" : undefined}
            />

            <SliderWithInput
              label="Monthly Maintenance"
              value={maintenance}
              min={0}
              max={20000}
              step={500}
              onChange={setMaintenance}
              formatDisplay={(v) => formatCurrency(v)}
              footerLabel="Maintenance, society charges, property tax averaged monthly"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2">Rent & Investment</h3>
            
            <SliderWithInput
              label="Current Monthly Rent"
              value={currentRent}
              min={5000}
              max={200000}
              step={1000}
              onChange={setCurrentRent}
              formatDisplay={(v) => formatCurrency(v)}
              footerLabel="Rent for a similar home in the same area"
            />

            <SliderWithInput
              label="Annual Rent Increase"
              value={rentIncrease}
              min={0}
              max={15}
              step={0.5}
              onChange={setRentIncrease}
              formatDisplay={(v) => `${v}%`}
            />

            <SliderWithInput
              label="Expected SIP Return"
              value={sipReturn}
              min={6}
              max={18}
              step={0.5}
              onChange={setSipReturn}
              formatDisplay={(v) => `${v}%`}
            />

            <SliderWithInput
              label="Property Appreciation"
              value={appreciationRate}
              min={3}
              max={15}
              step={0.5}
              onChange={setAppreciationRate}
              formatDisplay={(v) => `${v}%`}
            />
          </div>
        </div>

        {/* Results Card */}
        <div className="space-y-6 flex flex-col">
          <div className="glass-card p-8 space-y-8 flex flex-col w-full h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Buy Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">BUY</h4>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Monthly Cost</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(result.totalMonthlyBuy)}</p>
                  <p className="text-[10px] text-zinc-500">EMI + Maintenance</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Property Value at end</p>
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(result.propertyValueAtEnd)}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Paid</p>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(result.totalPaidBuy)}</p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Net Worth</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(result.netWorthBuy)}</p>
                </div>
              </div>

              {/* Rent Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-zinc-500" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">RENT + INVEST</h4>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Monthly Cost</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(currentRent)}</p>
                  <p className="text-[10px] text-zinc-500">increases {rentIncrease}% yearly</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Monthly SIP</p>
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(Math.max(0, result.monthlyInvestable))}</p>
                  {result.monthlyInvestable < 0 && (
                    <p className="text-[10px] text-amber-500 leading-tight">Your rent exceeds your EMI + maintenance. Buying may be the more economical choice on a monthly basis.</p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">SIP Corpus at end</p>
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(result.sipCorpus)}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Rent Paid</p>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(result.totalRentPaid)}</p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Net Worth</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(result.netWorthRent)}</p>
                </div>
              </div>
            </div>

            {/* Verdict */}
            <div className="pt-8 border-t border-white/5 text-center space-y-2">
              <h3 className={cn(
                "text-2xl md:text-3xl font-bold",
                result.netWorthRent > result.netWorthBuy ? "text-emerald-400" : "text-white"
              )}>
                {winner} wins by {formatCurrency(difference)} after {tenureYears} years
              </h3>
              <p className="text-zinc-400 text-sm">
                Buying gives you a home you own. Renting gives you flexibility and liquidity. The right choice depends on more than just numbers.
              </p>
              <p className="text-zinc-300 text-sm font-medium pt-2">
                {result.breakEvenYear 
                  ? (result.breakEvenYear === 1 
                      ? "Renting + Investing is ahead from the very first year" 
                      : `Rent + Invest overtakes Buying at year ${result.breakEvenYear}`)
                  : `Buying stays ahead for the full ${tenureYears} year period at these rates.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-8">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8">Net Worth Trajectory</h3>
        <div className="h-[400px] w-full" style={{ minWidth: 0, minHeight: 400 }}>
          {chartReady && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  stroke="#52525b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  label={{ value: 'Years', position: 'insideBottom', offset: -10, fill: '#52525b', fontSize: 12 }}
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
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="buyNetWorth" 
                  name="Buying"
                  stroke={result.netWorthBuy >= result.netWorthRent ? "#10b981" : "#52525b"} 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rentNetWorth" 
                  name="Renting"
                  stroke={result.netWorthRent > result.netWorthBuy ? "#10b981" : "#52525b"} 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                {result.breakEvenYear && (
                  <ReferenceLine x={result.breakEvenYear} stroke="#71717a" strokeDasharray="5 5">
                    <Label value="Break-even" position="top" fill="#71717a" fontSize={10} />
                  </ReferenceLine>
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <AIInsightSection 
        title="Buy vs Rent Vision"
        description={`${winner} is the mathematically superior choice for this property over ${tenureYears} years.`}
        mainValue={difference}
        mainLabel="Net Worth Difference"
        secondaryValues={[
          { label: 'Rental Yield', value: `${rentalYield.toFixed(2)}%` },
          { label: 'Break-even', value: result.breakEvenYear ? `Year ${result.breakEvenYear}` : 'Never' },
          { label: 'Monthly SIP', value: result.monthlyInvestable }
        ]}
        category="grow"
        inputs={aiData}
        onInsightGenerated={setAiInsight}
        customPrompt={(() => {
          const bulletInstructions = "Bullet 1 must state the totalPaidBuy (loan + maintenance + tax) and compare it to the original propertyPrice to show the true cost of ownership. Bullet 2 must state the totalRentPaid over the tenure and compare it to the totalPaidBuy. Bullet 3 must state the breakEvenYear and explain what happens to the net worth gap after that year.";
          return GLOBAL_AI_INSTRUCTION + "\n\nData:\n" + JSON.stringify(aiData) + "\n\nBullet instructions:\n" + bulletInstructions;
        })()}
      />

      <ShareVision 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Buy vs Rent Vision"
        description={`${winner} wins by ${formatCurrency(difference)} after ${tenureYears} years.`}
        mainValue={difference}
        mainLabel="Net Worth Difference"
        secondaryValues={[
          { label: 'Buy NW', value: result.netWorthBuy },
          { label: 'Rent NW', value: result.netWorthRent },
          { label: 'Break-even', value: result.breakEvenYear ? `Year ${result.breakEvenYear}` : 'Never' },
          { label: 'Rental Yield', value: `${rentalYield.toFixed(2)}%` }
        ]}
        insight={renderInsight(aiInsight || `At current rental yields your ${formatIndianRupees(propertyPrice)} home would earn ${formatIndianRupees(Math.round((propertyPrice * 0.025) / 12))}/month as rent — your EMI is ${formatIndianRupees(Math.round(result.emi))} so you're paying ${formatIndianRupees(Math.round(result.emi - (propertyPrice * 0.025) / 12))} extra per month for the privilege of ownership.`)}
        category="buy"
        inputs={{ 
          propertyPrice, 
          downPaymentPercent, 
          loanRate, 
          tenureYears,
          sipReturn,
          appreciationRate,
          buyNetWorth: result.netWorthBuy,
          rentNetWorth: result.netWorthRent,
          difference,
          winner,
          delayCost
        }}
        onSave={() => setIsShareOpen(false)}
      />
    </div>
  );
}
