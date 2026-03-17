import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  BarChart3, 
  Trash2, 
  TrendingUp, 
  CreditCard, 
  Target, 
  Palmtree, 
  ShieldCheck,
  Info,
  ChevronLeft,
  Trophy,
  ArrowRight,
  Home,
  Sparkles
} from 'lucide-react';
import { GLOBAL_AI_INSTRUCTION } from '../aiInsightPrompt';
import { motion } from 'motion/react';
import { storage, SavedScenario } from '../lib/storage';
import { formatCurrency, cn, formatIndianRupees } from '../lib/utils';
import { calculateBuyVsRent } from '../lib/calculators';
import { 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer 
} from 'recharts';
import AIInsightSection from './AIInsightSection';
import { renderInsight } from '../renderInsight';

interface ComparisonViewProps {
  ids: string[];
  onBack: () => void;
}

const typeDisplayNames: Record<string, string> = {
  'basic_fd': 'Basic FD',
  'staggered_fd': 'Staggered FD',
  'buy_vs_rent': 'Buy vs Rent',
  'sip': 'SIP',
  'emi': 'EMI',
  'goal': 'Goal Planner',
  'retirement': 'Retirement',
  'affordability': 'Loan Affordability',
  'home_purchase': 'Home Purchase',
};

const typeIcons = {
  sip: TrendingUp,
  emi: CreditCard,
  goal: Target,
  retirement: Palmtree,
  affordability: ShieldCheck,
  home_purchase: Home,
  staggered_fd: TrendingUp,
  buy_vs_rent: Home,
};

const typeColors = {
  sip: 'text-teal-500',
  emi: 'text-blue-500',
  goal: 'text-purple-500',
  retirement: 'text-orange-500',
  affordability: 'text-emerald-500',
  home_purchase: 'text-blue-400',
  staggered_fd: 'text-emerald-500',
  buy_vs_rent: 'text-emerald-500',
};

function buildComparisonPrompt(scenarios: SavedScenario[], type: string, mostAchievableName: string) {
  const scenarioList = scenarios.map((s, i) => {
    const inputs = Object.entries(s.inputs).map(([k, v]) => `${k}: ${v}`).join(', ');
    const outputs = Object.entries(s.outputs).map(([k, v]) => `${k}: ${v}`).join(', ');
    return `Scenario ${i + 1} (${s.name}): Inputs [${inputs}], Outputs [${outputs}]`;
  }).join('\n');

  const bulletInstructions = "Bullet 1 must compare the primary output of all scenarios (e.g., total corpus or total interest) to show the gap between the best and worst case. Bullet 2 must identify the scenario with the most favorable ratio (e.g., highest real return or lowest interest-to-principal ratio). Bullet 3 must reveal a non-obvious consequence of choosing one scenario over another (e.g., how many extra years of work or months of salary are saved/spent).";

  return `${GLOBAL_AI_INSTRUCTION}

Data:
${scenarioList}
Type: ${type}
Most Achievable: ${mostAchievableName}

Bullet instructions:
${bulletInstructions}`;
}

export default function ComparisonView({ ids, onBack }: ComparisonViewProps) {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const all = storage.getScenarios();
    setScenarios(all.filter(s => ids.includes(s.id)));
    
    const timer = setTimeout(() => setChartReady(true), 50);
    return () => {
      clearTimeout(timer);
    };
  }, [ids]);

  const groupedScenarios = useMemo(() => {
    const groups: Record<string, SavedScenario[]> = {};
    scenarios.forEach(s => {
      if (!groups[s.type]) groups[s.type] = [];
      groups[s.type].push(s);
    });
    return groups;
  }, [scenarios]);

  if (scenarios.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-zinc-500">No scenarios selected for comparison.</p>
        <button onClick={onBack} className="text-teal-500 font-medium hover:underline">Go Back</button>
      </div>
    );
  }

  const getScenarioData = (s: SavedScenario) => {
    switch (s.type) {
      case 'retirement':
        return {
          key: s.outputs.corpusRequired || 0,
          label: 'Corpus Required',
          sec1: { label: 'Monthly SIP', value: formatIndianRupees(s.outputs.requiredSIP || 0), color: 'emerald' },
          sec2: { label: 'Monthly Exp.', value: formatIndianRupees(s.outputs.futureMonthlyExpense || 0), color: 'white' },
          isBest: (others: SavedScenario[]) => {
            const minCorpus = Math.min(...others.map(o => o.outputs.corpusRequired || 0));
            return s.outputs.corpusRequired === minCorpus;
          }
        };
      case 'sip':
        return {
          key: s.outputs.futureValue || 0,
          label: 'Future Value',
          sec1: { label: 'Total Invested', value: formatIndianRupees(s.outputs.totalInvestment || 0), color: 'emerald' },
          sec2: { label: 'Est. Returns', value: formatIndianRupees(s.outputs.totalEarnings || 0), color: 'white' },
          isBest: (others: SavedScenario[]) => {
            const maxVal = Math.max(...others.map(o => o.outputs.futureValue || 0));
            return s.outputs.futureValue === maxVal;
          }
        };
      case 'goal':
        return {
          key: s.inputs.monthlySIP || 0,
          label: 'Monthly SIP',
          sec1: { label: 'Target Amount', value: formatIndianRupees(s.inputs.targetAmount || 0), color: 'emerald' },
          sec2: { label: 'Tenure', value: `${s.inputs.years || 0} Yrs`, color: 'white' },
          isBest: (others: SavedScenario[]) => {
            const minSIP = Math.min(...others.map(o => o.inputs.monthlySIP || 0));
            return s.inputs.monthlySIP === minSIP;
          }
        };
      case 'emi':
        return {
          key: s.outputs.monthlyEMI || 0,
          label: 'Monthly EMI',
          sec1: { label: 'Total Interest', value: formatIndianRupees(s.outputs.totalInterest || 0), color: 'emerald' },
          sec2: { label: 'Total Payment', value: formatIndianRupees(s.outputs.totalPayment || 0), color: 'white' },
          isBest: (others: SavedScenario[]) => {
            const minEMI = Math.min(...others.map(o => o.outputs.monthlyEMI || 0));
            return s.outputs.monthlyEMI === minEMI;
          }
        };
      case 'affordability':
        return {
          key: s.outputs.maxLoan || 0,
          label: 'Max Loan',
          sec1: { label: 'Safe EMI', value: formatIndianRupees(s.outputs.availableEMI || 0), color: 'emerald' },
          sec2: { label: 'Risk Level', value: s.outputs.riskLevel || 'N/A', color: 'white' },
          isBest: (others: SavedScenario[]) => {
            const maxLoan = Math.max(...others.map(o => o.outputs.maxLoan || 0));
            return s.outputs.maxLoan === maxLoan;
          }
        };
      case 'home_purchase':
        return {
          key: s.outputs.monthlyEMI || 0,
          label: 'EMI Amount',
          sec1: { label: 'Down Payment', value: formatIndianRupees(s.outputs.downPayment || 0), color: 'emerald' },
          sec2: { label: 'Min Salary', value: formatIndianRupees(s.outputs.minSalary || 0), color: 'white' },
          isBest: (others: SavedScenario[]) => {
            const minEMI = Math.min(...others.map(o => o.outputs.monthlyEMI || 0));
            return s.outputs.monthlyEMI === minEMI;
          }
        };
      case 'staggered_fd':
        return {
          key: s.outputs.extraInterest || 0,
          label: 'Extra Earned',
          sec1: { label: 'Total Fund', value: formatIndianRupees(s.inputs.totalAmount || 0), color: 'emerald' },
          sec2: { label: 'FDs', value: `${s.inputs.numFDs || 0} FDs`, color: 'white' },
          isBest: (others: SavedScenario[]) => {
            const maxExtra = Math.max(...others.map(o => o.outputs.extraInterest || 0));
            return s.outputs.extraInterest === maxExtra;
          }
        };
      case 'basic_fd':
        return {
          key: s.outputs.postTaxInterest || 0,
          label: 'Post-Tax Interest',
          sec1: { label: 'Gross Int.', value: formatIndianRupees(s.outputs.grossInterest || 0), color: 'emerald' },
          sec2: { label: 'Maturity', value: formatIndianRupees(s.outputs.maturityAmount || 0), color: 'white' },
          isBest: (others: SavedScenario[]) => {
            const maxInt = Math.max(...others.map(o => o.outputs.postTaxInterest || 0));
            return s.outputs.postTaxInterest === maxInt;
          }
        };
      case 'buy_vs_rent':
        // Bug 1: Ensure we have all data. If missing, re-calculate from inputs.
        let outputs = { ...s.outputs };
        if (!outputs.buyNetWorth || outputs.buyNetWorth === 0) {
          const calc = calculateBuyVsRent(
            s.inputs.propertyPrice || 0,
            s.inputs.downPaymentPercent || 0,
            s.inputs.loanRate || 0,
            s.inputs.tenureYears || 0,
            s.inputs.maintenance || 0,
            s.inputs.currentRent || 0,
            s.inputs.rentIncrease || 0,
            s.inputs.sipReturn || 0,
            s.inputs.appreciationRate || 0
          );
          outputs = {
            ...outputs,
            buyNetWorth: calc.netWorthBuy,
            rentNetWorth: calc.netWorthRent,
            winnerMargin: Math.abs(calc.netWorthRent - calc.netWorthBuy),
            winner: calc.netWorthRent > calc.netWorthBuy ? 'rent' : 'buy',
            breakEvenYear: calc.breakEvenYear,
            propertyPrice: s.inputs.propertyPrice,
            buyEMI: calc.emi,
            rentMonthlySIP: calc.monthlyInvestable
          };
          // Update the scenario object in memory for this render
          s.outputs = outputs;
        }

        const winner = outputs.winner || (outputs.rentNetWorth > outputs.buyNetWorth ? 'rent' : 'buy');
        const margin = outputs.winnerMargin || Math.abs((outputs.rentNetWorth || 0) - (outputs.buyNetWorth || 0));

        return {
          key: margin || 0,
          label: margin > 1000 ? `${winner === 'rent' ? 'Rent' : 'Buy'} Wins By` : "Calculating...",
          sec1: { label: 'Buy NW', value: formatIndianRupees(outputs.buyNetWorth || 0), color: 'red' },
          sec2: { label: 'Rent NW', value: formatIndianRupees(outputs.rentNetWorth || 0), color: 'emerald' },
          isBest: (others: SavedScenario[]) => {
            const maxMargin = Math.max(...others.map(o => o.outputs.winnerMargin || 0));
            return outputs.winnerMargin === maxMargin;
          }
        };
      default:
        return { key: 0, label: 'Value', sec1: { label: '', value: '', color: '' }, sec2: { label: '', value: '', color: '' }, isBest: () => false };
    }
  };

  const renderComparisonForType = (type: string, typeScenarios: SavedScenario[]) => {
    const Icon = typeIcons[type as keyof typeof typeIcons] || BarChart3;
    const colorClass = typeColors[type as keyof typeof typeColors] || 'text-white';

    const maxKeyValue = Math.max(...typeScenarios.map(s => getScenarioData(s).key));
    
    // Dynamic Insight Bar data
    const sorted = [...typeScenarios].sort((a, b) => {
      const dataA = getScenarioData(a);
      const dataB = getScenarioData(b);
      return dataA.key - dataB.key;
    });
    
    const best = type === 'sip' || type === 'affordability' || type === 'staggered_fd' ? sorted[sorted.length - 1] : sorted[0];
    const worst = type === 'sip' || type === 'affordability' || type === 'staggered_fd' ? sorted[0] : sorted[sorted.length - 1];
    const bestData = getScenarioData(best);
    const worstData = getScenarioData(worst);
    const diff = Math.abs(bestData.key - worstData.key);
    
    // Find the most achievable scenario name for the AI prompt
    const winnerScenario = typeScenarios.find(s => getScenarioData(s).isBest(typeScenarios)) || best;
    const mostAchievableName = winnerScenario.name;

    if (type === 'basic_fd' && typeScenarios.length >= 2) {
      console.log('Basic FD comparison data:', typeScenarios[0].outputs, typeScenarios[1].outputs);
    }

    let dynamicInsightText = "";
    const diffText = formatIndianRupees(diff);

    if (type === 'retirement') {
      const expDiff = Math.abs((best.outputs.futureMonthlyExpense || 0) - (worst.outputs.futureMonthlyExpense || 0));
      const ageDiff = Math.abs((best.inputs.retirementAge || 0) - (worst.inputs.retirementAge || 0));
      const inflDiff = Math.abs((best.inputs.inflation || 0) - (worst.inputs.inflation || 0));
      
      let reason = "";
      if (expDiff > 0) reason = `${formatIndianRupees(expDiff)} lower monthly expenses in retirement`;
      else if (ageDiff > 0) reason = `a ${ageDiff} year later retirement age`;
      else if (inflDiff > 0) reason = `a ${inflDiff}% lower inflation assumption`;
      else reason = "different retirement assumptions";
      
      dynamicInsightText = `${best.name} requires ${diffText} less corpus than ${worst.name} — driven by ${reason}.`;
    } else if (type === 'sip') {
      const invDiff = Math.abs((best.inputs.monthlyInvestment || 0) - (worst.inputs.monthlyInvestment || 0));
      const durDiff = Math.abs((best.inputs.years || 0) - (worst.inputs.years || 0));
      const rateDiff = Math.abs((best.inputs.annualRate || 0) - (worst.inputs.annualRate || 0));
      
      let reason = "";
      if (invDiff > 0) reason = `${formatIndianRupees(invDiff)} higher monthly investment`;
      else if (durDiff > 0) reason = `a ${durDiff} year longer duration`;
      else if (rateDiff > 0) reason = `a ${rateDiff}% higher return rate`;
      else reason = "different investment terms";

      dynamicInsightText = `${best.name} builds ${diffText} more future value than ${worst.name} — driven by ${reason}.`;
    } else if (type === 'goal') {
      const targetDiff = Math.abs((best.inputs.targetAmount || 0) - (worst.inputs.targetAmount || 0));
      const sipDiff = Math.abs((best.inputs.monthlySIP || 0) - (worst.inputs.monthlySIP || 0));
      const yearsDiff = Math.abs((best.inputs.years || 0) - (worst.inputs.years || 0));
      
      let reason = "";
      if (targetDiff > 0) reason = `a ${formatIndianRupees(targetDiff)} lower target amount`;
      else if (yearsDiff > 0) reason = `${yearsDiff} more years to invest`;
      else if (sipDiff > 0) reason = `${formatIndianRupees(sipDiff)} higher monthly SIP`;
      else reason = "different investment terms";

      dynamicInsightText = `${best.name} needs ${diffText} less monthly SIP than ${worst.name} — driven by ${reason}.`;
    } else if (type === 'emi') {
      const loanDiff = Math.abs((best.inputs.loanAmount || 0) - (worst.inputs.loanAmount || 0));
      const rateDiff = Math.abs((best.inputs.interestRate || 0) - (worst.inputs.interestRate || 0));
      const tenureDiff = Math.abs((best.inputs.tenure || 0) - (worst.inputs.tenure || 0));
      
      let reason = "";
      if (loanDiff > 0) reason = `a ${formatIndianRupees(loanDiff)} lower loan amount`;
      else if (rateDiff > 0) reason = `a ${rateDiff}% lower interest rate`;
      else if (tenureDiff > 0) reason = `a ${tenureDiff} year longer tenure`;
      else reason = "different loan terms";

      dynamicInsightText = `${best.name} has ${diffText} lower monthly EMI than ${worst.name} — driven by ${reason}.`;
    } else if (type === 'affordability') {
      const incomeDiff = Math.abs((best.inputs.income || 0) - (worst.inputs.income || 0));
      const emiDiff = Math.abs((best.inputs.existingEMIs || 0) - (worst.inputs.existingEMIs || 0));
      const rateDiff = Math.abs((best.inputs.interestRate || 0) - (worst.inputs.interestRate || 0));
      
      let reason = "";
      if (incomeDiff > 0) reason = `a ${formatIndianRupees(incomeDiff)} higher monthly income`;
      else if (emiDiff > 0) reason = `${formatIndianRupees(emiDiff)} lower existing EMIs`;
      else if (rateDiff > 0) reason = `a ${rateDiff}% lower interest rate`;
      else reason = "different loan terms";

      dynamicInsightText = `${best.name} qualifies for ${diffText} more loan than ${worst.name} — driven by ${reason}.`;
    } else if (type === 'home_purchase') {
      const priceDiff = Math.abs((best.inputs.propertyPrice || 0) - (worst.inputs.propertyPrice || 0));
      const downDiff = Math.abs((best.inputs.downPayment || 0) - (worst.inputs.downPayment || 0));
      const loanDiff = Math.abs((best.inputs.loanAmount || 0) - (worst.inputs.loanAmount || 0));
      const rateDiff = Math.abs((best.inputs.interestRate || 0) - (worst.inputs.interestRate || 0));
      
      let reason = "";
      if (priceDiff > 0) reason = `a ${formatIndianRupees(priceDiff)} lower property price`;
      else if (downDiff > 0) reason = `a larger down payment of ${formatIndianRupees(downDiff)}`;
      else if (loanDiff > 0) reason = `a ${formatIndianRupees(loanDiff)} lower loan amount`;
      else if (rateDiff > 0) reason = `a ${rateDiff}% lower interest rate`;
      else reason = "different loan terms";

      dynamicInsightText = `${best.name} has ${diffText} lower monthly EMI than ${worst.name} — driven by ${reason}.`;
    } else if (type === 'staggered_fd') {
      const fundDiff = Math.abs((best.inputs.totalAmount || 0) - (worst.inputs.totalAmount || 0));
      const rateDiff = Math.abs((best.inputs.fdRate || 0) - (worst.inputs.fdRate || 0));
      
      let reason = "";
      if (fundDiff > 0) reason = `a ${formatIndianRupees(fundDiff)} larger emergency fund`;
      else if (rateDiff > 0) reason = `a ${rateDiff}% higher FD interest rate`;
      else reason = "different FD terms";

      dynamicInsightText = `${best.name} earns ${diffText} more extra interest than ${worst.name} — driven by ${reason}.`;
    } else if (type === 'basic_fd') {
      const winnerDiff = Math.abs((best.outputs.postTaxInterest || 0) - (worst.outputs.postTaxInterest || 0));
      if (winnerDiff > 100) {
        dynamicInsightText = `${best.name} offers a higher post-tax return than ${worst.name}.`;
      } else {
        dynamicInsightText = "Both scenarios offer similar post-tax returns.";
      }
    } else if (type === 'buy_vs_rent') {
      const winnerDiff = Math.abs((best.outputs.winnerMargin || 0) - (worst.outputs.winnerMargin || 0));
      const breakEvenDiff = Math.abs((best.outputs.breakEvenYear || 0) - (worst.outputs.breakEvenYear || 0));
      
      let reason = "";
      if (winnerDiff > 0) reason = `a ${formatIndianRupees(winnerDiff)} larger winning margin`;
      else if (breakEvenDiff > 0) reason = `a ${breakEvenDiff} year difference in break-even point`;
      else reason = "different market assumptions";

      dynamicInsightText = `${best.name} shows a ${formatIndianRupees(winnerDiff)} stronger financial outcome than ${worst.name} — driven by ${reason}.`;
    }

    return (
      <div key={type} className="space-y-8 pt-12 border-t border-white/5 first:border-t-0 first:pt-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg bg-white/5", colorClass)}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold capitalize">{typeDisplayNames[type] || type.replace('_', ' ')} Comparison</h3>
          </div>

          {/* Dynamic Insight Bar */}
          <div className="border-l-4 border-emerald-500 bg-emerald-500/5 p-4 rounded-r-xl space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
              WHATIFF AI
            </div>
            <p className="text-[15px] text-white leading-relaxed">
              {dynamicInsightText}
            </p>
          </div>
        </div>

        {/* Scenario Cards Row */}
        <div className={cn(
          "grid gap-6",
          typeScenarios.length === 2 ? "grid-cols-1 md:grid-cols-2" :
          typeScenarios.length === 3 ? "grid-cols-1 md:grid-cols-3" :
          "grid-cols-1 md:grid-cols-2"
        )}>
          {typeScenarios.map((s, i) => {
            const data = getScenarioData(s);
            const isWinner = data.isBest(typeScenarios);
            const outputs = s.outputs;
            
            if (type === 'buy_vs_rent') {
              const winnerMargin = outputs.winnerMargin || 0;
              const winner = outputs.winner || (outputs.rentNetWorth > outputs.buyNetWorth ? 'rent' : 'buy');
              const showBanner = winnerMargin > 1000;

              return (
                <motion.div 
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "glass-card p-6 space-y-6 relative overflow-hidden transition-all duration-300",
                    "border-white/5 hover:border-emerald-500/30",
                    isWinner && "shadow-[0_0_20px_rgba(16,185,129,0.1)] border-emerald-500/20"
                  )}
                >
                  <div className="space-y-1">
                    <h4 className="text-[16px] font-bold text-white">
                      {formatIndianRupees(outputs.propertyPrice || 0)} Property
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      {s.name} • {new Date(s.timestamp).toLocaleDateString()}
                    </p>
                  </div>

                  {showBanner && (
                    <div className={cn(
                      "p-[12px] px-[16px] rounded-[10px] border border-emerald-500/20 bg-emerald-500/10",
                      winner === 'buy' ? "text-white" : "text-emerald-400"
                    )}>
                      <p className="text-[18px] font-bold">
                        {winner === 'buy' ? '🏠 Buying' : '📈 Renting + Investing'} wins by {formatIndianRupees(winnerMargin)}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">BUY NET WORTH</p>
                      <p className="text-[15px] font-bold text-zinc-200">{formatIndianRupees(outputs.buyNetWorth || 0)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">RENT NET WORTH</p>
                      <p className="text-[15px] font-bold text-zinc-200">{formatIndianRupees(outputs.rentNetWorth || 0)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">BREAK-EVEN</p>
                      <p className={cn(
                        "text-[15px] font-bold",
                        outputs.breakEvenYear ? "text-emerald-500" : "text-zinc-500"
                      )}>
                        {outputs.breakEvenYear ? `Year ${outputs.breakEvenYear}` : 'Never'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">TENURE</p>
                      <p className="text-[15px] font-bold text-zinc-200">{s.inputs.tenureYears || 0} years</p>
                    </div>
                  </div>
                </motion.div>
              );
            }

            if (type === 'basic_fd') {
              const formatVal = (v: any) => (v === 0 || v === undefined || isNaN(v)) ? '—' : formatIndianRupees(v);
              const formatPct = (v: any) => (v === 0 || v === undefined || isNaN(v)) ? '—' : `${v}%`;

              return (
                <motion.div 
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "glass-card p-6 space-y-6 relative overflow-hidden transition-all duration-300",
                    "border-white/5 hover:border-emerald-500/30",
                    isWinner && "shadow-[0_0_20px_rgba(16,185,129,0.1)] border-emerald-500/20"
                  )}
                >
                  <div className="space-y-1">
                    <h4 className="text-[16px] font-bold text-white">
                      {formatVal(outputs.principal)} FD at {formatPct(outputs.fdRate)}
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      {s.name} • {new Date(s.timestamp).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">GROSS INTEREST</p>
                      <p className="text-[15px] font-bold text-zinc-200">{formatVal(outputs.grossInterest)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">POST-TAX INTEREST</p>
                      <p className="text-[15px] font-bold text-emerald-500">{formatVal(outputs.postTaxInterest)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">MATURITY AMOUNT</p>
                      <p className="text-[15px] font-bold text-zinc-200">{formatVal(outputs.maturityAmount)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">REAL RETURN</p>
                      <p className="text-[15px] font-bold text-zinc-200">{formatPct(outputs.realReturn)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">TAX RATE</p>
                      <p className="text-[15px] font-bold text-zinc-200">{formatPct(outputs.effectiveTaxRate)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">TENURE</p>
                      <p className="text-[15px] font-bold text-zinc-200">{outputs.tenure ? `${outputs.tenure} months` : '—'}</p>
                    </div>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div 
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "glass-card p-6 space-y-6 relative overflow-hidden transition-all duration-300",
                  "border-white/5 hover:border-emerald-500/30",
                  isWinner && "shadow-[0_0_20px_rgba(16,185,129,0.1)] border-emerald-500/20"
                )}
              >
                {isWinner && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-emerald-500 text-zinc-950 text-[9px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 uppercase tracking-widest">
                      <Trophy className="w-3 h-3" />
                      Most Achievable
                    </div>
                  </div>
                )}

                <h4 className="text-lg font-bold text-white truncate pr-16">{s.name}</h4>

                {/* Arc Chart */}
                <div className="space-y-4">
                  <div className="h-24 w-full relative" style={{ minWidth: 0, minHeight: 96 }}>
                    {chartReady && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { value: data.key },
                              { value: Math.max(0, maxKeyValue - data.key) }
                            ]}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#27272a" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-[28px] font-bold text-white leading-none mb-1">
                      {formatIndianRupees(data.key)}
                    </p>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-[0.1em] font-bold">
                      {data.label}
                    </p>
                  </div>
                </div>

                {/* Stat Pills */}
                <div className="flex gap-2">
                  <div className={cn(
                    "flex-1 rounded-lg p-2 text-center",
                    data.sec1.color === 'red' ? "bg-red-500/10 border border-red-500/20" : "bg-emerald-500/10 border border-emerald-500/20"
                  )}>
                    <p className={cn(
                      "text-[8px] uppercase tracking-widest font-bold mb-0.5",
                      data.sec1.color === 'red' ? "text-red-500" : "text-emerald-500"
                    )}>{data.sec1.label}</p>
                    <p className={cn(
                      "text-xs font-bold",
                      data.sec1.color === 'red' ? "text-red-400" : "text-emerald-400"
                    )}>{data.sec1.value}</p>
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                    <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">{data.sec2.label}</p>
                    <p className="text-xs font-bold text-white">{data.sec2.value}</p>
                  </div>
                </div>

                {s.type === 'buy_vs_rent' && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="space-y-1">
                      <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Break-even</p>
                      <p className="text-sm font-bold text-white">Year {s.outputs.breakEvenYear || 'Never'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Property Price</p>
                      <p className="text-sm font-bold text-white">{formatIndianRupees(s.outputs.propertyPrice || 0)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Monthly EMI</p>
                      <p className="text-sm font-bold text-white">{formatIndianRupees(s.outputs.buyEMI || 0)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Monthly SIP</p>
                      <p className="text-sm font-bold text-white">{formatIndianRupees(s.outputs.rentMonthlySIP || 0)}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Winner Banner for Basic FD */}
        {type === 'basic_fd' && typeScenarios.length >= 2 && (
          (() => {
            const winnerDiff = Math.abs((best.outputs.postTaxInterest || 0) - (worst.outputs.postTaxInterest || 0));
            if (winnerDiff > 100 && (best.outputs.postTaxInterest || 0) > 0 && (worst.outputs.postTaxInterest || 0) > 0) {
              return (
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-center">
                  <p className="text-lg font-bold">
                    Scenario {best.name} earns {formatIndianRupees(winnerDiff)} more after tax
                  </p>
                </div>
              );
            }
            return null;
          })()
        )}

        {/* AI Insight Section */}
        {type === 'buy_vs_rent' ? (
          typeScenarios.every(s => (s.outputs.buyNetWorth || 0) > 0 && (s.outputs.rentNetWorth || 0) > 0) ? (
            <AIInsightSection 
              title="AI Comparison Analysis"
              description={dynamicInsightText}
              mainValue={diff}
              mainLabel="Variance"
              secondaryValues={typeScenarios.map(s => ({ label: s.name, value: formatIndianRupees(getScenarioData(s).key) }))}
              category="buy"
              inputs={typeScenarios}
              customPrompt={buildComparisonPrompt(typeScenarios, type, mostAchievableName)}
              isComparison={true}
            />
          ) : (
            <div className="glass-card p-8 text-center border-dashed border-white/10">
              <p className="text-zinc-500">Save two Buy vs Rent scenarios to compare which property decision makes more financial sense.</p>
            </div>
          )
        ) : type === 'basic_fd' ? (
          typeScenarios.every(s => (s.outputs.grossInterest || 0) > 0) ? (
            <AIInsightSection 
              title="AI Comparison Analysis"
              description={dynamicInsightText}
              mainValue={diff}
              mainLabel="Variance"
              secondaryValues={typeScenarios.map(s => ({ label: s.name, value: formatIndianRupees(getScenarioData(s).key) }))}
              category="grow"
              inputs={typeScenarios}
              customPrompt={buildComparisonPrompt(typeScenarios, type, mostAchievableName)}
              isComparison={true}
            />
          ) : (
            <div className="glass-card p-8 text-center border-dashed border-white/10">
              <p className="text-zinc-500">Save two Basic FD scenarios to generate an AI comparison insight.</p>
            </div>
          )
        ) : (
          <AIInsightSection 
            title="AI Comparison Analysis"
            description={dynamicInsightText}
            mainValue={diff}
            mainLabel="Variance"
            secondaryValues={typeScenarios.map(s => ({ label: s.name, value: formatIndianRupees(getScenarioData(s).key) }))}
            category={type === 'retirement' || type === 'sip' || type === 'goal' ? 'grow' : type === 'home_purchase' ? 'buy' : 'borrow'}
            inputs={typeScenarios}
            customPrompt={buildComparisonPrompt(typeScenarios, type, mostAchievableName)}
            isComparison={true}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-500" />
            Scenario Comparison
          </h2>
          <p className="text-zinc-500 text-sm">Side-by-side analysis of your saved financial plans.</p>
        </div>
      </div>

      <div className="space-y-16">
        {Object.entries(groupedScenarios).map(([type, scenarios]) => renderComparisonForType(type, scenarios))}
      </div>
    </div>
  );
}
