import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Share2, Download, Info, ChevronDown, ShieldCheck, Star, ArrowRight } from 'lucide-react';
import { GLOBAL_AI_INSTRUCTION } from '../../aiInsightPrompt';
import { motion, AnimatePresence } from 'motion/react';
import { useRef } from 'react';
import { calculateStaggeredFD, INFLATION_RATE } from '../../lib/calculators';
import { formatCurrency, formatCompactNumber, cn, formatIndianRupees } from '../../lib/utils';
import SaveScenarioButton from '../SaveScenarioButton';
import ShareVision from '../ShareVision';
import InfoBox from '../InfoBox';
import { exportToExcel } from '../../lib/exportUtils';
import AIInsightSection from '../AIInsightSection';
import { renderInsight } from '../../renderInsight';

import SliderWithInput from '../SliderWithInput';

interface StaggeredFDPlannerProps {
  onBack: () => void;
  initialPrincipal?: number;
}

const TOP_BANKS = [
  { name: 'HDFC Bank', rate: 7.4, rating: 4.8, tags: ["PRIVATE", "MOST TRUSTED"], domain: 'www.hdfcbank.com', url: 'https://www.hdfc.bank.in/fixed-deposit?icid=website_organic_breadcrumb:link:fixeddeposit' },
  { name: 'ICICI Bank', rate: 7.4, rating: 4.7, tags: ["PRIVATE", "DIGITAL FIRST"], domain: 'www.icicibank.com', url: 'https://www.icicibank.com/personal-banking/deposits/fixed-deposit' },
  { name: 'Axis Bank', rate: 7.6, rating: 4.5, tags: ["PRIVATE", "QUICK PROCESS"], domain: 'www.axisbank.com', url: 'https://www.axisbank.com/retail/deposits/fixed-deposits' },
  { name: 'Ujjivan SFB', rate: 8.25, rating: 4.5, tags: ["SMALL FINANCE", "HIGH RATES"], domain: 'www.ujjivansfb.in', url: 'https://www.ujjivansfb.in/personal/deposits/regular-fixed-deposits' },
  { name: 'Jana SFB', rate: 8.5, rating: 4.3, tags: ["SMALL FINANCE", "HIGHEST RATES"], domain: 'www.janabank.com', url: 'https://www.jana.bank.in/deposits/' },
  { name: 'Suryoday SFB', rate: 8.6, rating: 4.2, tags: ["SMALL FINANCE", "HIGHEST RATES"], domain: 'www.suryodaybank.com', url: 'https://suryoday.bank.in/personal/deposits/fixed-deposits/' },
];

export default function StaggeredFDPlanner({ onBack, initialPrincipal }: StaggeredFDPlannerProps) {
  const [totalAmount, setTotalAmount] = useState(initialPrincipal || 300000);
  const [numFDs, setNumFDs] = useState(6);
  const [fdRate, setFdRate] = useState(7);
  const [savingsRate, setSavingsRate] = useState(3.5);
  const [isReinvested, setIsReinvested] = useState(false);
  const [isTaxExpanded, setIsTaxExpanded] = useState(false);
  const [citizenType, setCitizenType] = useState<'Regular' | 'Senior'>('Regular');
  const [taxSlab, setTaxSlab] = useState(20);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const sliderRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => {
    return calculateStaggeredFD(totalAmount, numFDs, fdRate, savingsRate, isReinvested);
  }, [totalAmount, numFDs, fdRate, savingsRate, isReinvested]);

  const taxDetails = useMemo(() => {
    const threshold = citizenType === 'Senior' ? 50000 : 40000;
    const totalAnnualInterest = isReinvested ? result.totalInterestWithReinvestment : result.totalFDInterest;
    const tdsDeducted = totalAnnualInterest > threshold ? totalAnnualInterest * 0.1 : 0;
    const taxRate = taxSlab / 100;
    
    // Post-tax interest for the initial ladder
    const postTaxTotalInterest = result.totalFDInterest * (1 - taxRate);
    
    // Post-tax extra earned vs savings
    // Formula: sum of amountPerFD * (fdRate/100 - savingsRate/100) * (tenure/12) * (1 - taxRate/100)
    const postTaxExtraEarned = result.extraInterest * (1 - taxRate);

    // Post-tax reinvestment logic
    const postTaxTotalInterestWithReinvestment = isReinvested 
      ? result.totalInterestWithReinvestment * (1 - taxRate)
      : 0;

    const postTaxReinvestmentBonus = isReinvested 
      ? postTaxTotalInterestWithReinvestment - postTaxTotalInterest
      : 0;
    
    // Post-tax real return
    const postTaxFDRate = fdRate * (1 - taxRate);
    const postTaxRealReturn = ((1 + postTaxFDRate / 100) / (1 + INFLATION_RATE / 100) - 1) * 100;

    // Savings interest for fallback
    const postTaxSavingsInterest = (result.totalFDInterest - result.extraInterest) * (1 - taxRate);

    return {
      tdsDeducted: Math.round(tdsDeducted),
      postTaxTotalInterest: Math.round(postTaxTotalInterest),
      postTaxExtraEarned: Math.round(postTaxExtraEarned),
      postTaxTotalInterestWithReinvestment: Math.round(postTaxTotalInterestWithReinvestment),
      postTaxReinvestmentBonus: Math.round(postTaxReinvestmentBonus),
      postTaxRealReturn: Math.round(postTaxRealReturn * 100) / 100,
      postTaxSavingsInterest: Math.round(postTaxSavingsInterest),
      isTDSApplicable: totalAnnualInterest > threshold,
      totalAnnualInterest,
      threshold
    };
  }, [result, citizenType, taxSlab, isReinvested, fdRate]);

  const tdsThreshold = citizenType === 'Senior' ? 50000 : 40000;
  const formattedThreshold = citizenType === 'Senior' ? '₹50,000' : '₹40,000';
  const interestForTDS = isReinvested ? result.totalInterestWithReinvestment : result.totalFDInterest;

  const aiData = useMemo(() => {
    const maxTenure = 12; // Initial ladder is 12 months
    const totalInterest = isReinvested ? result.totalInterestWithReinvestment : result.totalFDInterest;
    const totalMaturity = totalAmount + totalInterest;
    const inflationAdjustedPrincipal = totalAmount * Math.pow(1 + INFLATION_RATE / 100, maxTenure / 12);
    const purchasingPowerLoss = inflationAdjustedPrincipal - totalAmount;
    const realSurplus = totalMaturity - inflationAdjustedPrincipal;
    const postTaxMaturity = totalAmount + (totalInterest * (1 - taxSlab / 100));
    const realReturnRate = (Math.pow(postTaxMaturity / totalAmount, 1 / (maxTenure / 12)) - 1) * 100;
    
    const realReturnRateAfterInflation = ((1 + realReturnRate / 100) / (1 + INFLATION_RATE / 100) - 1) * 100;

    return {
      totalAmount,
      numFDs,
      fdRate,
      savingsRate,
      isReinvested,
      totalInterest,
      totalMaturity,
      taxSlab,
      postTaxMaturity,
      realReturnRate,
      inflationAdjustedPrincipal,
      purchasingPowerLoss,
      realSurplus,
      tdsThreshold,
      isTDSApplicable: totalInterest > tdsThreshold
    };
  }, [totalAmount, numFDs, fdRate, savingsRate, isReinvested, result, taxSlab, tdsThreshold]);

  const handleExport = () => {
    exportToExcel(
      "Staggered FD Plan",
      `Emergency fund of ${formatCurrency(totalAmount)} split into ${numFDs} FDs`,
      { totalAmount, numFDs, fdRate, savingsRate, isReinvested },
      "Extra Interest",
      result.extraInterest,
      [
        { label: 'Amount per FD', value: result.amountPerFD },
        { label: 'Total FD Interest', value: result.totalFDInterest },
        { label: 'Total Interest (Reinvested)', value: result.totalInterestWithReinvestment },
        { label: 'Reinvestment Bonus', value: result.reinvestmentBonus }
      ],
      `One FD matures every ${result.interval} months — you're never more than ${result.interval} months away from liquidity.`
    );
  };

  const extraEarned = result.extraInterest;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            Staggered FD Planner
          </h2>
          <p className="text-zinc-500 text-sm">Optimize your emergency fund for liquidity and returns.</p>
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
            type="staggered_fd" 
            inputs={{ totalAmount, numFDs, fdRate, savingsRate, isReinvested }} 
            outputs={{ 
              ...result, 
              mainResult: isFinite(result.totalFDInterest) ? result.totalFDInterest : 0 
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
        <div className="space-y-6 w-full" ref={sliderRef}>
          <SliderWithInput
            label="Total Emergency Fund"
            value={totalAmount}
            min={50000}
            max={5000000}
            step={10000}
            onChange={setTotalAmount}
            formatDisplay={(v) => formatCurrency(v)}
          />

          <SliderWithInput
            label="Number of FDs to split"
            value={numFDs}
            min={2}
            max={12}
            step={1}
            onChange={setNumFDs}
            formatDisplay={(v) => `${v} FDs`}
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
            label="Savings Account Rate"
            value={savingsRate}
            min={2.5}
            max={7}
            step={0.25}
            onChange={setSavingsRate}
            formatDisplay={(v) => `${v}%`}
            footerLabel="Most major banks offer 2.5–4% · Some offer up to 7%"
          />

          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-white">Reinvest matured FDs</label>
                <p className="text-[11px] text-zinc-400">When an FD matures and no emergency occurs, reinvest it for 18 months at the same FD rate.</p>
              </div>
              <button
                onClick={() => setIsReinvested(!isReinvested)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative flex items-center px-1",
                  isReinvested ? "bg-emerald-500" : "bg-zinc-700"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full bg-white transition-transform",
                  isReinvested ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-6">
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

              <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={() => setIsTaxExpanded(!isTaxExpanded)}
                  className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors text-[13px] font-medium"
                >
                  Tax Settings
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
                        <div className="space-y-4">
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {savingsRate > fdRate && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-200/80 leading-relaxed">
                Your savings account rate is higher than your FD rate — increase your FD rate to benefit from this strategy.
              </p>
            </div>
          )}
        </div>

        {/* Results Card */}
        <div className="glass-card p-8 space-y-8 flex flex-col w-full h-full">
          {isReinvested ? (
            <div className="p-4 bg-zinc-800/50 border border-zinc-700 border-l-4 border-l-emerald-500 rounded-xl flex gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-[13px] text-zinc-300 leading-relaxed">
                {isTaxExpanded && taxSlab > 0 ? (
                  <>After {taxSlab}% tax reinvestment turns {formatCurrency(taxDetails.postTaxTotalInterest)} into {formatCurrency(taxDetails.postTaxTotalInterestWithReinvestment)} — {(taxDetails.postTaxTotalInterestWithReinvestment / taxDetails.postTaxTotalInterest).toFixed(1)}x more.</>
                ) : (
                  <>Reinvestment turns {formatCurrency(result.totalFDInterest)} into {formatCurrency(result.totalInterestWithReinvestment)} — {(result.totalInterestWithReinvestment / result.totalFDInterest).toFixed(1)}x more.</>
                )} Each matured FD is reinvested for 18 more months, extending your longest FD to {result.fdData[result.fdData.length - 1].tenureMonths + 18} months. Compound interest does the rest.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl flex gap-3">
              <Info className="w-5 h-5 text-zinc-400 shrink-0" />
              <p className="text-[13px] text-zinc-400 leading-relaxed">
                Toggle reinvestment ON to see how much more your emergency fund can earn when matured FDs are automatically rolled over.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Amount per FD</p>
              <p className="text-xl font-bold text-white">{formatCurrency(result.amountPerFD)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{isReinvested ? "TOTAL INTEREST (WITH REINVESTMENT)" : "TOTAL FD INTEREST"}</p>
              <div className="flex flex-wrap items-baseline gap-2">
                <p className={cn("font-bold", isTaxExpanded ? "text-sm text-zinc-500 line-through" : "text-xl text-emerald-400")}>
                  {formatCurrency(isReinvested ? result.totalInterestWithReinvestment : result.totalFDInterest)}
                </p>
                {isTaxExpanded && (
                  <p className="text-xl font-bold text-emerald-400">
                    {formatCurrency(isReinvested ? taxDetails.postTaxTotalInterestWithReinvestment : taxDetails.postTaxTotalInterest)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {isReinvested && (
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Reinvestment Bonus</p>
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className={cn("font-bold", isTaxExpanded ? "text-sm text-zinc-500 line-through" : "text-xl text-emerald-400")}>
                    +{formatCurrency(result.reinvestmentBonus)}
                  </p>
                  {isTaxExpanded && (
                    <p className="text-xl font-bold text-emerald-400">+{formatCurrency(taxDetails.postTaxReinvestmentBonus)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-white/5 space-y-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Extra earned vs savings account</p>
            <div className="flex flex-wrap items-baseline gap-3">
              <p className={cn(
                "font-bold",
                isTaxExpanded ? "text-2xl text-zinc-500 line-through" : "text-4xl " + (extraEarned > 0 ? "text-emerald-400" : extraEarned < 0 ? "text-red-400" : "text-zinc-400")
              )}>
                {extraEarned > 0 ? `+${formatCurrency(extraEarned)}` : extraEarned < 0 ? `-${formatCurrency(Math.abs(extraEarned))}` : `₹0`}
              </p>
              {isTaxExpanded && (
                <p className={cn(
                  "text-4xl font-bold",
                  taxDetails.postTaxExtraEarned > 0 ? "text-emerald-400" : taxDetails.postTaxExtraEarned < 0 ? "text-red-400" : "text-zinc-400"
                )}>
                  {taxDetails.postTaxExtraEarned > 0 ? `+${formatCurrency(taxDetails.postTaxExtraEarned)}` : taxDetails.postTaxExtraEarned < 0 ? `-${formatCurrency(Math.abs(taxDetails.postTaxExtraEarned))}` : `₹0`}
                </p>
              )}
            </div>
            {extraEarned === 0 && !isReinvested && (
              <p className="text-[11px] text-zinc-400">Your FD rate equals your savings rate — no extra benefit from going staggered.</p>
            )}
            <p className="text-[11px] text-zinc-400">Extra earned by choosing FD over savings account for the same amount and tenure.</p>
          </div>

          {isTaxExpanded && (
            <div className="pt-6 border-t border-white/5">
              <p className={cn(
                "text-sm font-bold",
                taxDetails.postTaxRealReturn < 0 ? "text-red-400" : taxDetails.postTaxRealReturn < 2 ? "text-amber-400" : "text-emerald-400"
              )}>
                Post-tax real return: {taxDetails.postTaxRealReturn}% after {INFLATION_RATE}% inflation
              </p>
            </div>
          )}
          
          <p className="text-[11px] text-zinc-500 leading-relaxed px-2 mt-4">
            Assumes {INFLATION_RATE}% annual inflation — India's 10-year CPI average.
          </p>

          <InfoBox 
            level="safe"
            message={`One FD matures every ${result.interval} months — you're never more than ${result.interval} months away from liquidity without breaking anything.`}
            className="w-full mt-auto"
          />
        </div>
      </div>

      {/* FD Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">FD Ladder Breakdown</h3>
          
          <div className="flex-1 md:max-w-md">
            {interestForTDS > tdsThreshold ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-2 items-start">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Your total interest of {formatCurrency(interestForTDS)} exceeds the {formattedThreshold} TDS threshold for {citizenType === 'Senior' ? 'Senior Citizen' : 'Regular Citizen'} — your bank will deduct TDS at 10%.
                  {isTaxExpanded && taxSlab > 0 && (
                    <> TDS is deducted on gross interest before your income tax calculation. Your post-tax interest after your {taxSlab}% slab is {formatCurrency(isReinvested ? taxDetails.postTaxTotalInterestWithReinvestment : taxDetails.postTaxTotalInterest)}.</>
                  )}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-500">
                <ShieldCheck className="w-4 h-4" />
                <p className="text-[11px] font-medium">
                  Your total interest of {formatCurrency(interestForTDS)} is below the {formattedThreshold} TDS threshold for {citizenType === 'Senior' ? 'Senior Citizen' : 'Regular Citizen'} — no TDS will be deducted by your bank.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900/50">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">FD #</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tenure (Months)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Maturity Value</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Interest Earned</th>
                {isTaxExpanded && (
                  <>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Income Tax</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Post-Tax Interest</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {result.fdData.map((fd, index) => (
                <tr key={fd.id} className={cn(index % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800")}>
                  <td className="px-6 py-4 text-sm font-medium text-white">{fd.id}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{formatCurrency(fd.amount)}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{fd.tenureMonths}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">{formatCurrency(fd.maturityValue)}</td>
                  <td className="px-6 py-4 text-sm text-emerald-400 font-medium">{formatCurrency(fd.interestEarned)}</td>
                  {isTaxExpanded && (
                    <>
                      <td className="px-6 py-4 text-sm text-red-400 font-medium">{formatCurrency(fd.interestEarned * (taxSlab / 100))}</td>
                      <td className="px-6 py-4 text-sm text-emerald-400 font-bold">{formatCurrency(fd.interestEarned * (1 - taxSlab / 100))}</td>
                    </>
                  )}
                </tr>
              ))}
              <tr className="bg-zinc-800/80 border-t-2 border-white/10">
                <td className="px-6 py-4 text-xs font-bold text-white uppercase tracking-widest">TOTAL</td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 text-sm text-emerald-400 font-bold">{formatCurrency(result.totalFDInterest)}</td>
                {isTaxExpanded && (
                  <>
                    <td className="px-6 py-4 text-sm text-red-400 font-bold">{formatCurrency(result.totalFDInterest * (taxSlab / 100))}</td>
                    <td className="px-6 py-4 text-sm text-emerald-400 font-bold">{formatCurrency(taxDetails.postTaxTotalInterest)}</td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart */}
        <div className="p-6 min-w-0 border border-white/10 rounded-2xl">
          <h3 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-widest">FD Maturity Values</h3>
          <div className="h-[300px] w-full" style={{ minWidth: 0, minHeight: 300 }}>
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.fdData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="id" 
                    stroke="#52525b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    label={{ value: 'FD Number', position: 'insideBottom', offset: -5, fill: '#52525b', fontSize: 10 }}
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
                    formatter={(value: number) => [formatCurrency(value), 'Maturity Value']}
                    labelFormatter={(label) => `FD #${label}`}
                  />
                  <Bar 
                    dataKey="maturityValue" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="p-6 min-w-0 border border-white/10 rounded-2xl">
          <h3 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-widest">Interest Earned</h3>
          <div className="h-[300px] w-full relative flex items-center justify-center" style={{ minWidth: 0, minHeight: 300 }}>
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Principal', value: totalAmount },
                      { name: 'Total Interest', value: isReinvested ? result.totalInterestWithReinvestment : result.totalFDInterest }
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
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl md:text-3xl font-bold text-emerald-400">
                {formatCurrency(isReinvested ? result.totalInterestWithReinvestment : result.totalFDInterest)}
              </p>
              <p className="text-[11px] text-zinc-400 uppercase font-bold tracking-widest">of corpus</p>
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
          </div>
        </div>

        {/* Comparison Bar Chart */}
        <div className="p-6 min-w-0 border border-white/10 rounded-2xl">
          <h3 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-widest">
            {isTaxExpanded && taxSlab > 0 ? "FD VS SAVINGS (POST-TAX)" : "FD VS SAVINGS"}
          </h3>
          <div className="h-[300px] w-full relative" style={{ minWidth: 0, minHeight: 300 }}>
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={(() => {
                    const factor = (isTaxExpanded && taxSlab > 0) ? (1 - taxSlab / 100) : 1;
                    if (isReinvested) {
                      return [
                        { name: 'FD Basic', value: Math.round(result.totalFDInterest * factor), fill: '#52525b' },
                        { name: 'FD Reinvest', value: Math.round(result.totalInterestWithReinvestment * factor), fill: '#10b981' },
                        { name: 'Savings', value: Math.round((result.totalInterestWithReinvestment - result.extraInterest) * factor), fill: '#3f3f46' }
                      ];
                    } else {
                      return [
                        { name: 'Staggered FD', value: Math.round(result.totalFDInterest * factor), fill: '#10b981' },
                        { name: 'Savings A/c', value: Math.round((result.totalFDInterest - result.extraInterest) * factor), fill: '#52525b' }
                      ];
                    }
                  })()}
                  margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#52525b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
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
                    formatter={(value: number) => [formatCurrency(value), 'Interest']}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    barSize={isReinvested ? 30 : 40}
                  >
                    {(() => {
                      const factor = (isTaxExpanded && taxSlab > 0) ? (1 - taxSlab / 100) : 1;
                      const data = isReinvested ? [
                        { name: 'FD Basic', value: Math.round(result.totalFDInterest * factor), fill: '#52525b' },
                        { name: 'FD Reinvest', value: Math.round(result.totalInterestWithReinvestment * factor), fill: '#10b981' },
                        { name: 'Savings', value: Math.round((result.totalInterestWithReinvestment - result.extraInterest) * factor), fill: '#3f3f46' }
                      ] : [
                        { name: 'Staggered FD', value: Math.round(result.totalFDInterest * factor), fill: '#10b981' },
                        { name: 'Savings A/c', value: Math.round((result.totalFDInterest - result.extraInterest) * factor), fill: '#52525b' }
                      ];
                      return data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ));
                    })()}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
              <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {formatCurrency(isTaxExpanded && taxSlab > 0 ? taxDetails.postTaxExtraEarned : extraEarned)} more
              </p>
            </div>
          </div>
        </div>
      </div>

      <AIInsightSection 
        title="Staggered FD Vision"
        description={`Your emergency fund of ${formatCurrency(totalAmount)} split into ${numFDs} FDs could earn ${formatCurrency(extraEarned)} extra.`}
        mainValue={extraEarned}
        mainLabel="Extra Earned"
        secondaryValues={[
          { label: 'Total Fund', value: totalAmount },
          { label: 'Interval', value: `${result.interval} Months` },
          { label: 'Real Return Rate', value: `${taxDetails.postTaxRealReturn}%` }
        ]}
        category="grow"
        inputs={aiData}
        onInsightGenerated={setAiInsight}
        customPrompt={(() => {
          const bulletInstructions = `Bullet 1 must state the inflationAdjustedPrincipal and compare it to the totalAmount to show how much is needed just to maintain purchasing power at ${INFLATION_RATE}% inflation. Bullet 2 must state the realSurplus (totalMaturity - inflationAdjustedPrincipal) to show the true wealth gain after inflation. Bullet 3 must state the realReturnRate and compare it to the nominal fdRate to show the impact of taxes and inflation combined.`;
          return GLOBAL_AI_INSTRUCTION + "\n\nData:\n" + JSON.stringify(aiData) + "\n\nBullet instructions:\n" + bulletInstructions;
        })()}
      />

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
        title="Staggered FD Vision"
        description={`Your emergency fund of ${formatCurrency(totalAmount)} split into ${numFDs} FDs could earn ${formatCurrency(extraEarned)} extra.`}
        mainValue={isTaxExpanded && taxSlab > 0 ? taxDetails.postTaxExtraEarned : extraEarned}
        mainLabel="Extra Earned"
        secondaryValues={(() => {
          const stats = [
            { label: 'TOTAL FUND', value: totalAmount },
            { label: 'FD RATE', value: `${fdRate}%` }
          ];
          if (isReinvested) {
            stats.push({ 
              label: 'REINVEST BONUS', 
              value: isTaxExpanded && taxSlab > 0 ? taxDetails.postTaxReinvestmentBonus : result.reinvestmentBonus 
            });
          }
          if (isTaxExpanded && taxSlab > 0) {
            stats.push({ label: 'TAX RATE', value: `${taxSlab}%` });
          }
          return stats;
        })()}
        insight={renderInsight(aiInsight || (isTaxExpanded && taxSlab > 0
          ? `After ${taxSlab}% tax your staggered FD earns ₹${formatCurrency(isReinvested ? taxDetails.postTaxTotalInterestWithReinvestment : taxDetails.postTaxTotalInterest)} — a post-tax real return of ${taxDetails.postTaxRealReturn}% after ${INFLATION_RATE}% inflation. Keeping the same amount in a savings account would earn ₹${formatCurrency(taxDetails.postTaxSavingsInterest)} after tax — the staggered strategy puts ₹${formatCurrency(taxDetails.postTaxExtraEarned)} more in your pocket for zero additional risk.`
          : (isReinvested 
            ? `Reinvesting each matured FD earns you ${formatCurrency(result.reinvestmentBonus)} extra over the cycle — your emergency fund is now actively compounding while staying liquid every ${result.interval} months.`
            : `Keeping ${formatCurrency(totalAmount)} in a savings account for the same tenure earns ${formatCurrency(result.totalFDInterest - result.extraInterest)}. Your staggered FD strategy earns ${formatCurrency(result.totalFDInterest)} — that's ${formatCurrency(result.extraInterest)} more for doing nothing differently except where you park it.`
          )
        ))}
        category="grow"
        inputs={{ 
          totalAmount, 
          numFDs, 
          fdRate, 
          savingsRate, 
          amountPerFD: result.amountPerFD, 
          interval: result.interval, 
          extraInterest: extraEarned, 
          isReinvested,
          grossExtraEarned: extraEarned,
          postTaxExtraEarned: taxDetails.postTaxExtraEarned,
          taxRate: taxSlab,
          isTaxExpanded: isTaxExpanded && taxSlab > 0,
          isReinvestOn: isReinvested,
          grossReinvestedInterest: result.totalInterestWithReinvestment,
          postTaxReinvestedInterest: taxDetails.postTaxTotalInterestWithReinvestment,
          reinvestmentBonus: result.reinvestmentBonus,
          postTaxReinvestmentBonus: taxDetails.postTaxReinvestmentBonus,
          longestTenure: result.fdData[result.fdData.length - 1].tenureMonths + 18,
          totalFDInterest: result.totalFDInterest,
          postTaxFDInterest: taxDetails.postTaxTotalInterest
        }}
        onSave={() => setIsShareOpen(false)}
      />
    </div>
  );
}
