import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TrendingUp, Share2, Download, ChevronDown, ArrowRight, Star } from 'lucide-react';
import { GLOBAL_AI_INSTRUCTION } from '../../aiInsightPrompt';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart, 
  Bar,
  LabelList
} from 'recharts';
import { calculateBasicFD, INFLATION_RATE } from '../../lib/calculators';
import { formatCurrency, formatIndianRupees, cn } from '../../lib/utils';
import SaveScenarioButton from '../SaveScenarioButton';
import ShareVision from '../ShareVision';
import InfoBox from '../InfoBox';
import { exportToExcel } from '../../lib/exportUtils';
import AIInsightSection from '../AIInsightSection';
import { renderInsight } from '../../renderInsight';
import SliderWithInput from '../SliderWithInput';
import { Screen } from '../../App';

interface BasicFDCalculatorProps {
  onBack: () => void;
  onNavigate: (screen: Screen, state?: any) => void;
}

const TOP_BANKS = [
  { name: 'HDFC Bank', rate: 7.4, rating: 4.8, tags: ["PRIVATE", "MOST TRUSTED"], domain: 'www.hdfcbank.com', url: 'https://www.hdfc.bank.in/fixed-deposit?icid=website_organic_breadcrumb:link:fixeddeposit' },
  { name: 'ICICI Bank', rate: 7.4, rating: 4.7, tags: ["PRIVATE", "DIGITAL FIRST"], domain: 'www.icicibank.com', url: 'https://www.icicibank.com/personal-banking/deposits/fixed-deposit' },
  { name: 'Axis Bank', rate: 7.6, rating: 4.5, tags: ["PRIVATE", "QUICK PROCESS"], domain: 'www.axisbank.com', url: 'https://www.axisbank.com/retail/deposits/fixed-deposits' },
  { name: 'Ujjivan SFB', rate: 8.25, rating: 4.5, tags: ["SMALL FINANCE", "HIGH RATES"], domain: 'www.ujjivansfb.in', url: 'https://www.ujjivansfb.in/personal/deposits/regular-fixed-deposits' },
  { name: 'Jana SFB', rate: 8.5, rating: 4.3, tags: ["SMALL FINANCE", "HIGHEST RATES"], domain: 'www.janabank.com', url: 'https://www.jana.bank.in/deposits/' },
  { name: 'Suryoday SFB', rate: 8.6, rating: 4.2, tags: ["SMALL FINANCE", "HIGHEST RATES"], domain: 'www.suryodaybank.com', url: 'https://suryoday.bank.in/personal/deposits/fixed-deposits/' },
];

export default function BasicFDCalculator({ onBack, onNavigate }: BasicFDCalculatorProps) {
  const [principal, setPrincipal] = useState(100000);
  const [fdRate, setFdRate] = useState(6.5);
  const [tenure, setTenure] = useState(12);
  const [isTaxExpanded, setIsTaxExpanded] = useState(false);
  const [citizenType, setCitizenType] = useState<'Regular' | 'Senior'>('Regular');
  const [taxSlab, setTaxSlab] = useState(20);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [barPositions, setBarPositions] = useState<{ x: number; width: number; label: string; index: number }[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => {
    return calculateBasicFD(principal, fdRate, tenure);
  }, [principal, fdRate, tenure]);

  const realMaturityValue = useMemo(() => {
    return result.maturityAmount / Math.pow(1 + INFLATION_RATE / 100, tenure / 12);
  }, [result.maturityAmount, tenure]);

  const realGain = useMemo(() => {
    return realMaturityValue - principal;
  }, [realMaturityValue, principal]);

  const sipCorpus = useMemo(() => {
    const r = 0.12 / 12;
    const n = tenure;
    const p = principal;
    return p * Math.pow(1 + r, n);
  }, [principal, tenure]);

  const taxDetails = useMemo(() => {
    const threshold = citizenType === 'Senior' ? 100000 : 50000;
    const annualInterest = result.grossInterest * (12 / tenure);
    const tdsDeducted = annualInterest > threshold ? result.grossInterest * 0.1 : 0;
    const totalTax = result.grossInterest * (taxSlab / 100);
    const taxPayable = Math.max(0, totalTax - tdsDeducted);
    const postTaxInterest = result.grossInterest - totalTax;
    const postTaxRate = (postTaxInterest / principal) * (12 / tenure) * 100;
    const postTaxRealReturn = ((1 + postTaxRate / 100) / (1 + INFLATION_RATE / 100) - 1) * 100;

    return {
      tdsDeducted: Math.round(tdsDeducted),
      taxPayable: Math.round(taxPayable),
      postTaxInterest: Math.round(postTaxInterest),
      postTaxMaturityAmount: Math.round(result.maturityAmount - totalTax),
      postTaxRate: Math.round(postTaxRate * 100) / 100,
      postTaxRealReturn: Math.round(postTaxRealReturn * 100) / 100,
      isTDSApplicable: annualInterest > threshold
    };
  }, [result.grossInterest, tenure, citizenType, taxSlab, principal]);

  const aiData = useMemo(() => {
    const tenureYears = tenure / 12;
    const inflationAdjustedPrincipal = principal * Math.pow(1 + INFLATION_RATE / 100, tenureYears);
    const purchasingPowerLoss = inflationAdjustedPrincipal - principal;
    const realSurplus = result.maturityAmount - inflationAdjustedPrincipal;
    const postTaxMaturity = principal + (result.grossInterest * (1 - taxSlab / 100));
    const realReturnRate = tenureYears > 0 ? (Math.pow(postTaxMaturity / principal, 1 / tenureYears) - 1) * 100 : 0;

    return {
      principal,
      fdRate,
      tenureMonths: tenure,
      maturityAmount: result.maturityAmount,
      grossInterest: result.grossInterest,
      taxSlab,
      postTaxMaturity,
      realReturnRate,
      inflationAdjustedPrincipal,
      purchasingPowerLoss,
      realSurplus
    };
  }, [principal, fdRate, tenure, result, taxSlab]);

  const handleExport = () => {
    exportToExcel(
      "Basic FD Calculation",
      `FD of ${formatCurrency(principal)} at ${fdRate}% for ${tenure} months`,
      { principal, fdRate, tenure, citizenType, taxSlab },
      "Maturity Amount",
      result.maturityAmount,
      [
        { label: 'Gross Interest', value: result.grossInterest },
        { label: 'Real Return', value: `${result.realReturn}%` },
        { label: 'Post-Tax Interest', value: taxDetails.postTaxInterest }
      ],
      `Your FD effectively earns ${taxDetails.postTaxRate}% post-tax at your slab.`
    );
  };

  const lineChartData = useMemo(() => {
    const data = [];
    const r = fdRate / 100;
    const n = 4; // Quarterly compounding
    const inflationRate = INFLATION_RATE / 100;
    
    for (let m = 0; m <= tenure; m++) {
      const t = m / 12;
      const nominalValue = Math.round(principal * Math.pow(1 + r/n, n * t));
      const realValue = Math.round(nominalValue / Math.pow(1 + inflationRate, t));
      
      const item: any = {
        month: m,
        nominal: nominalValue,
        real: realValue,
      };
      
      if (isTaxExpanded && taxSlab > 0) {
        const interest = nominalValue - principal;
        const postTaxInterest = interest * (1 - taxSlab / 100);
        const postTaxValue = principal + postTaxInterest;
        item.postTaxReal = Math.round(postTaxValue / Math.pow(1 + inflationRate, t));
      }
      
      data.push(item);
    }
    return data;
  }, [principal, fdRate, tenure, isTaxExpanded, taxSlab]);

  const donutData = useMemo(() => {
    const base = [
      { name: 'Principal', value: principal, color: '#52525b' }, // zinc-600
    ];
    
    if (isTaxExpanded && taxSlab > 0) {
      const taxAmount = result.grossInterest * (taxSlab / 100);
      const postTaxInterest = result.grossInterest - taxAmount;
      base.push({ name: 'Interest', value: postTaxInterest, color: '#10b981' }); // emerald-500
      base.push({ name: 'Tax', value: taxAmount, color: '#f87171' }); // red-400
    } else {
      base.push({ name: 'Interest', value: result.grossInterest, color: '#10b981' });
    }
    return base;
  }, [principal, result.grossInterest, isTaxExpanded, taxSlab]);

  const waterfallData = useMemo(() => {
    const tenureYears = tenure / 12;
    const inflationRate = INFLATION_RATE / 100;
    const maturityAmount = result.maturityAmount;
    const realMaturityValue = maturityAmount / Math.pow(1 + inflationRate, tenureYears);
    const inflationErosion = maturityAmount - realMaturityValue;
    const grossInterest = result.grossInterest;
    
    const data = [
      { name: 'Principal', value: principal, fill: '#52525b', label: 'Principal' }, // zinc-600
      { name: 'Interest Earned', value: grossInterest, fill: '#10b981', label: 'Interest Earned' }, // emerald-500
      { name: 'Lost to Inflation', value: Math.round(inflationErosion), fill: '#f87171', label: 'Lost to Inflation' }, // red-400
    ];

    let finalRealValue = realMaturityValue;

    if (isTaxExpanded && taxSlab > 0) {
      const taxAmount = grossInterest * (taxSlab / 100);
      data.push({ name: 'Tax Payable', value: Math.round(taxAmount), fill: '#fbbf24', label: 'Tax Payable' }); // amber-400
      finalRealValue = (maturityAmount - taxAmount) / Math.pow(1 + inflationRate, tenureYears);
    }

    const isNegativeReturn = inflationErosion > grossInterest;
    data.push({ 
      name: 'Real Value at Maturity', 
      value: Math.round(finalRealValue), 
      fill: isNegativeReturn ? '#f87171' : '#10b981',
      label: 'Real Value at Maturity'
    });

    return data;
  }, [principal, result.grossInterest, result.maturityAmount, tenure, isTaxExpanded, taxSlab]);

  const effectivePostTaxRate = (fdRate * (1 - taxSlab / 100)).toFixed(2);

  const CustomBar = (props: any) => {
    const { x, width, payload, fill, y, height, index } = props;
    
    useEffect(() => {
      setBarPositions(prev => {
        const existing = prev.find(p => p.index === index);
        if (existing && existing.x === x && existing.width === width) return prev;
        const updated = [...prev.filter(p => p.index !== index), { x, width, label: payload.label, index }].sort((a, b) => a.index - b.index);
        return updated;
      });
    }, [x, width, index, payload.label]);

    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />;
  };

  const fallbackInsightData = useMemo(() => {
    const tenureYears = tenure / 12;
    const realMaturityValue = result.maturityAmount / Math.pow(1.06, tenureYears);
    const inflationErosion = result.maturityAmount - realMaturityValue;
    const realGain = realMaturityValue - principal;
    
    // SIP comparison (Equity 12%)
    const monthlyRate = 0.12 / 12;
    const sipCorpus = principal * Math.pow(1 + monthlyRate, tenure);
    const sipGain = sipCorpus - principal;
    const opportunityCost = sipGain - result.grossInterest;

    const postTaxRealGain = taxDetails.postTaxInterest / Math.pow(1.06, tenureYears) - principal;

    return {
      realMaturityValue,
      inflationErosion,
      realGain,
      sipCorpus,
      sipGain,
      opportunityCost,
      postTaxRealGain
    };
  }, [principal, tenure, result.maturityAmount, result.grossInterest, taxDetails.postTaxInterest]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            Basic FD Calculator
          </h2>
          <p className="text-zinc-500 text-sm">Calculate your fixed deposit returns and tax impact.</p>
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
            type="basic_fd" 
            defaultName={`FD — ₹${formatIndianRupees(principal)} at ${fdRate}%`}
            inputs={{ principal, fdRate, tenure, citizenType, taxSlab }} 
            outputs={{ 
              mainResult: taxDetails.postTaxInterest ?? result.grossInterest ?? 0,
              principal: principal ?? 0,
              fdRate: fdRate ?? 0,
              tenure: tenure ?? 0,
              grossInterest: result.grossInterest ?? 0,
              maturityAmount: result.maturityAmount ?? 0,
              realMaturityValue: fallbackInsightData.realMaturityValue ?? 0,
              realReturn: result.realReturn ?? 0,
              realGain: fallbackInsightData.realGain ?? 0,
              inflationErosion: fallbackInsightData.inflationErosion ?? 0,
              tdsDeducted: taxDetails.tdsDeducted ?? 0,
              taxPayable: taxDetails.taxPayable ?? 0,
              postTaxInterest: taxDetails.postTaxInterest ?? result.grossInterest ?? 0,
              postTaxMaturityAmount: taxDetails.postTaxMaturityAmount ?? result.maturityAmount ?? 0,
              postTaxRealReturn: taxDetails.postTaxRealReturn ?? result.realReturn ?? 0,
              effectiveTaxRate: taxSlab ?? 0,
              citizenType: citizenType ?? 'Regular',
              isTaxExpanded: isTaxExpanded ?? false,
              sipCorpus: fallbackInsightData.sipCorpus ?? 0,
              opportunityCost: fallbackInsightData.opportunityCost ?? 0,
            }} 
            onBeforeSave={(outputs) => console.log('Saving Basic FD scenario:', outputs)}
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
        <div className="space-y-6 w-full" ref={sliderRef}>
          <SliderWithInput
            label="Principal Amount"
            value={principal}
            min={10000}
            max={5000000}
            step={10000}
            onChange={setPrincipal}
            formatDisplay={(v) => formatCurrency(v)}
          />

          <SliderWithInput
            label="FD Interest Rate"
            value={fdRate}
            min={2.5}
            max={9.5}
            step={0.25}
            onChange={setFdRate}
            formatDisplay={(v) => `${v}%`}
            footerLabel="Public sector banks: 2.5–7% · Small finance banks: up to 9.5%"
          />

          <SliderWithInput
            label="Tenure"
            value={tenure}
            min={3}
            max={60}
            step={3}
            onChange={setTenure}
            formatDisplay={(v) => `${v} Months`}
            footerLabel="Best rates typically between 12–36 months"
          />

          {/* Tax Personalization Section */}
          <div className="pt-4 border-t border-white/5">
            <button 
              onClick={() => setIsTaxExpanded(!isTaxExpanded)}
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors text-[13px] font-medium"
            >
              Personalise for my tax situation
              <ChevronDown className={cn("w-4 h-4 transition-transform", isTaxExpanded && "rotate-180")} />
            </button>
            
            <AnimatePresence>
              {isTaxExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Citizen Type</label>
                      <div className="flex gap-2">
                        {['Regular', 'Senior'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setCitizenType(type as any)}
                            className={cn(
                              "flex-1 py-2 px-4 rounded-xl text-xs font-bold border transition-all",
                              citizenType === type 
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                            )}
                          >
                            {type === 'Senior' ? 'Senior Citizen 60+' : 'Regular'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <SliderWithInput
                      label="Effective Tax Rate"
                      value={taxSlab}
                      min={0}
                      max={30}
                      step={1}
                      onChange={setTaxSlab}
                      formatDisplay={(v) => `${v}%`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results Card */}
        <div className="glass-card p-8 space-y-8 flex flex-col w-full h-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Gross Interest</p>
              <p className="text-xl font-bold text-white">{formatCurrency(result.grossInterest)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Real Return</p>
              <p className="text-xl font-bold text-white">{result.realReturn}%</p>
              <p className="text-[10px] text-zinc-500">
                In today's money your {formatIndianRupees(result.maturityAmount)} will be worth {formatIndianRupees(realMaturityValue)}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Maturity Amount</p>
            <p className="text-4xl font-bold text-white">{formatCurrency(result.maturityAmount)}</p>
          </div>

          <AnimatePresence>
            {isTaxExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-6 border-t border-white/5 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">TDS Deducted</p>
                    <p className="text-lg font-bold text-red-400">{formatCurrency(taxDetails.tdsDeducted)}</p>
                    <p className="text-[10px] text-zinc-500">
                      {taxDetails.isTDSApplicable 
                        ? "Submit Form 15G/15H if total income is below taxable limit" 
                        : "Below TDS threshold — no TDS deducted"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Tax Payable at Slab</p>
                    <p className="text-lg font-bold text-red-400">{formatCurrency(taxDetails.taxPayable)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Post-Tax Interest</p>
                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(taxDetails.postTaxInterest)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Post-Tax Real Return</p>
                    <p className="text-lg font-bold text-white">{taxDetails.postTaxRealReturn}%</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <p className="text-[11px] text-zinc-500 leading-relaxed px-2 mt-4">
            Assumes 6% annual inflation — India's 10-year CPI average.
          </p>
          
          <InfoBox 
            level={result.realReturn > 1 ? 'safe' : (result.realReturn >= 0 ? 'moderate' : 'high')}
            message={
              result.realReturn > 1 
                ? "A healthy real return for a risk-free instrument. Your emergency fund is holding its value." 
                : result.realReturn >= 0 
                  ? "Inflation is quietly eating your savings. FD preserves wealth — it does not build it." 
                  : "Every year this money sits in an FD it buys less than it did before. This is the silent cost of playing it too safe."
            }
            className="w-full mt-auto"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[35fr_65fr] gap-8 my-12">
        {/* Chart 1: Donut */}
        <div className="glass-card p-6 min-w-0">
          <h3 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-widest">YOUR MONEY SPLIT</h3>
          <div className="h-[300px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  cursor={false}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [formatIndianRupees(value), '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xl md:text-2xl font-bold text-white text-center px-4">
                {formatIndianRupees(isTaxExpanded && taxSlab > 0 ? taxDetails.postTaxMaturityAmount : result.maturityAmount)}
              </p>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-600" />
              <span className="text-xs text-zinc-400">Principal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-400">Interest</span>
            </div>
            {isTaxExpanded && taxSlab > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-xs text-zinc-400">Tax</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Waterfall */}
        <div className="glass-card p-6 min-w-0">
          <h3 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-widest">WHERE YOUR MONEY GOES</h3>
          <div className="h-[300px] w-full relative flex flex-col">
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={waterfallData} 
                  margin={{ top: 30, right: 20, bottom: 10, left: 20 }}
                  barSize={48}
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `₹${(val/100000).toFixed(2)}L`}
                  />
                  <RechartsTooltip 
                    cursor={false}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [formatIndianRupees(value), '']}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    shape={<CustomBar />}
                  >
                    {waterfallData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList 
                      dataKey="value" 
                      position="top"
                      offset={8}
                      formatter={(val: number) => `₹${(val / 100000).toFixed(2)}L`}
                      fill="#a1a1aa"
                      fontSize={10}
                      fontWeight="bold"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Absolutely Positioned Labels Row */}
              <div className="absolute bottom-0 left-0 w-full pointer-events-none h-0">
                {barPositions.map((pos, idx) => {
                  let labelContent;
                  if (pos.label === 'Principal' || pos.label === 'Interest Earned') {
                    labelContent = <span className="whitespace-nowrap">{pos.label}</span>;
                  } else if (pos.label === 'Lost to Inflation') {
                    labelContent = (
                      <>
                        <span className="block">Lost to</span>
                        <span className="block">Inflation</span>
                      </>
                    );
                  } else if (pos.label === 'Real Value at Maturity') {
                    labelContent = (
                      <>
                        <span className="block">Real Value</span>
                        <span className="block">at Maturity</span>
                      </>
                    );
                  } else {
                    labelContent = <span className="block">{pos.label}</span>;
                  }

                  return (
                    <div 
                      key={idx} 
                      className="absolute flex flex-col items-center min-w-[100px]"
                      style={{ 
                        left: pos.x + pos.width / 2, 
                        transform: 'translateX(-50%)',
                        top: '8px'
                      }}
                    >
                      <span className="text-[10px] text-zinc-500 text-center leading-tight">
                        {labelContent}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AIInsightSection 
        title="FD Strategy Vision"
        description={`Your FD of ${formatCurrency(principal)} at ${fdRate}% will grow to ${formatCurrency(result.maturityAmount)}.`}
        mainValue={result.maturityAmount}
        mainLabel="Maturity Amount"
        secondaryValues={[
          { label: 'Gross Interest', value: result.grossInterest },
          { label: 'Post-Tax Maturity', value: taxDetails.postTaxMaturityAmount },
          { label: 'Real Return Rate', value: `${taxDetails.postTaxRealReturn}%` }
        ]}
        category="grow"
        inputs={aiData}
        onInsightGenerated={setAiInsight}
        customPrompt={(() => {
          const bulletInstructions = "Bullet 1 must state the inflationAdjustedPrincipal and compare it to the principal to show how much is needed just to maintain purchasing power. Bullet 2 must state the realSurplus (maturityAmount - inflationAdjustedPrincipal) to show the true wealth gain after inflation. Bullet 3 must state the realReturnRate and compare it to the nominal fdRate to show the impact of taxes and inflation combined.";
          return GLOBAL_AI_INSTRUCTION + "\n\nData:\n" + JSON.stringify(aiData) + "\n\nBullet instructions:\n" + bulletInstructions;
        })()}
      />

      {/* Nudge Card */}
      <div className="glass-card p-6 border-l-4 border-emerald-500 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-white font-medium">
            💡 What if you staggered this FD?
          </p>
          <p className="text-sm text-zinc-400 max-w-xl">
            Splitting {formatCurrency(principal)} into multiple FDs maturing every few months gives you liquidity without sacrificing returns.
          </p>
        </div>
        <button 
          onClick={() => onNavigate('staggered_fd', { principal })}
          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold text-sm transition-colors whitespace-nowrap"
        >
          See Staggered FD <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top Banks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Top Banks</h3>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
          {TOP_BANKS.map((bank) => (
            <div 
              key={bank.name} 
              className="flex-shrink-0 w-[160px] glass-card p-4 space-y-4 border border-zinc-700 bg-zinc-800 rounded-[12px] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all group relative"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-white p-1.5 flex items-center justify-center overflow-hidden">
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${bank.domain}&sz=64`} 
                    alt={bank.name} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-400 font-bold text-xl">${bank.name[0]}</div>`;
                    }}
                  />
                </div>
                <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  {bank.rating}
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm truncate">{bank.name}</h4>
                <p className="text-xs text-zinc-400">Up to <span className="text-white font-bold">{bank.rate}%</span></p>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {bank.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-bold text-zinc-400 bg-zinc-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
              
              <button 
                onClick={() => {
                  setFdRate(bank.rate);
                  sliderRef.current?.scrollIntoView({ behavior: 'smooth' });
                  window.open(bank.url, '_blank');
                }}
                className="w-full py-2 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/5 transition-all"
              >
                Use this rate <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-zinc-500">
          Rates are indicative for general public, tenure 1–3 years. Verify current rates on the bank's official website.
        </p>
      </div>

      <ShareVision 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Basic FD Strategy Vision"
        description={`Your FD of ${formatCurrency(principal)} at ${fdRate}% will grow to ${formatCurrency(result.maturityAmount)}.`}
        mainValue={result.realReturn}
        mainLabel="Real Return"
        secondaryValues={[
          { label: 'Gross Interest', value: result.grossInterest },
          { label: 'Real Return', value: `${result.realReturn}%` },
          { label: 'Tenure', value: `${tenure} Months` },
          { label: 'Post-Tax Interest', value: taxDetails.postTaxInterest }
        ]}
        insight={renderInsight(aiInsight || (isTaxExpanded && taxSlab > 0
          ? `After ${taxSlab}% tax your FD earns ₹${taxDetails.postTaxInterest} — a post-tax real return of ${taxDetails.postTaxRealReturn}% after ${INFLATION_RATE}% inflation. The same amount in an equity mutual fund at 12% historical returns would have grown to ${formatCurrency(sipCorpus)} over the same period.`
          : `Your ${formatCurrency(principal)} FD earns ${formatCurrency(result.grossInterest)} at ${fdRate}% — but after ${INFLATION_RATE}% inflation your money is worth only ${formatCurrency(realMaturityValue)} in today's purchasing power. You lost ${formatCurrency(Math.abs(realGain))} in real terms.`))}
        category="grow"
        inputs={{ 
          principal, 
          fdRate, 
          tenure, 
          citizenType, 
          taxSlab, 
          grossInterest: result.grossInterest,
          realReturn: result.realReturn,
          isTaxExpanded,
          ...fallbackInsightData
        }}
        onSave={() => setIsShareOpen(false)}
      />
    </div>
  );
}
