import React, { useRef, useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  BarChart3,
  ArrowLeft,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatIndianRupees, cn, formatIndianShort } from '../lib/utils';
import { toPng } from 'html-to-image';

interface ShareVisionProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  mainValue: number;
  mainLabel: string;
  secondaryValues: { label: string; value: string | number }[];
  insight: string | React.ReactNode;
  category: 'grow' | 'buy' | 'borrow';
  inputs: any;
  onSave: () => void;
}

interface CardConfig {
  badge: string;
  emoji: string;
  headline: string | React.ReactNode;
  accentColor: string; // Hex code
  glowColor: string;   // Hex code
  mainValueColor: string; // Hex code
  footerPill: string | React.ReactNode;
  stat1Label: string;
  stat1Value: string;
  stat1Color: string; // Hex code
  stat2Label: string;
  stat2Value: string;
  stat2Color: string; // Hex code
  stat2Dot?: string;  // Hex code
  subline: string;
  mainValueSuffix?: string;
  customBottomLeft?: string;
  isBuyVsRent?: boolean;
}

import { renderInsight } from '../renderInsight';

export default function ShareVision({
  isOpen,
  onClose,
  title,
  mainValue,
  insight,
  category,
  inputs,
  secondaryValues,
}: ShareVisionProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const getCardConfig = (): CardConfig => {
    // GROW CATEGORY (SIP, Retirement, Goal)
    if (category === 'grow') {
      const monthlySIP = inputs.monthlyInvestment || inputs.monthlySIP || inputs.requiredSIP || 0;
      const years = inputs.years || (inputs.retirementAge - inputs.currentAge) || 0;

      // Goal Planner specific overrides (check for targetAmount input to distinguish from Retirement)
      if (inputs.targetAmount !== undefined) {
        const target = inputs.targetAmount || 0;
        const years = inputs.years || 0;
        const requiredReturn = inputs.requiredReturn || 0;
        
        // Determine color based on required return value (matching calculator logic)
        let returnColor = '#a1a1aa'; // zinc-400
        if (requiredReturn >= 15) returnColor = '#ef4444'; // red-500
        else if (requiredReturn >= 12) returnColor = '#f59e0b'; // amber-500
        else if (requiredReturn >= 9) returnColor = '#10b981'; // emerald-500
        else if (requiredReturn >= 7) returnColor = '#60a5fa'; // blue-400

        return {
          badge: 'GROW',
          emoji: '🎯',
          headline: 'My goal needs',
          accentColor: '#10b981',
          glowColor: '#10b981',
          mainValueColor: '#0ea5e9', // sky-500
          footerPill: "Know your numbers.",
          stat1Label: 'REQUIRED RETURN',
          stat1Value: `${requiredReturn}%`,
          stat1Color: returnColor,
          stat2Label: '',
          stat2Value: '',
          stat2Color: '#ffffff',
          subline: `To reach ${formatIndianRupees(target)} in ${years} years`,
          mainValueSuffix: ' per\u00A0month'
        };
      }

      // Retirement specific overrides
      if (title.includes('Retirement') || inputs.retirementAge !== undefined) {
        return {
          badge: 'GROW',
          emoji: '☀️',
          headline: 'I am building',
          accentColor: '#10b981', // emerald-500
          glowColor: '#10b981',
          mainValueColor: '#10b981',
          footerPill: "Know your numbers.",
          stat1Label: 'RETIREMENT AGE',
          stat1Value: `${inputs.retirementAge || 0} Years`,
          stat1Color: '#10b981',
          stat2Label: 'POST-RETIRE RETURN',
          stat2Value: `${inputs.returnPost || 0}%`,
          stat2Color: '#ffffff',
          subline: `To retire at ${inputs.retirementAge} with ${formatIndianRupees(inputs.monthlyExpense || 0)}/month today`
        };
      }

      // Basic FD specific overrides
      if (title.includes('Basic FD') || (inputs.fdRate !== undefined && inputs.numFDs === undefined)) {
        const principal = inputs.principal || 0;
        const realReturn = inputs.realReturn || 0;
        const grossInterest = inputs.grossInterest || 0;
        const fdRate = inputs.fdRate || 0;
        const realGain = inputs.realGain || 0;
        const realMaturityValue = inputs.realMaturityValue || 0;

        let headline: React.ReactNode;
        let subline: string;
        let mainValueColor = '#10b981'; // emerald-500

        if (realReturn > 1) {
          headline = (
            <>
              Your <span className="font-display font-bold">{formatIndianRupees(principal)}</span> FD earns <span className="font-display font-bold">{formatIndianRupees(grossInterest)}</span> — and holds its ground against inflation.
            </>
          );
          subline = `At ${fdRate}% your real return after 6% inflation is ${realReturn}%. Your money is working.`;
        } else if (realReturn >= 0) {
          headline = (
            <>
              Your <span className="font-display font-bold">{formatIndianRupees(principal)}</span> FD earns <span className="font-display font-bold">{formatIndianRupees(grossInterest)}</span> — but in real terms, just <span className="font-display font-bold">{formatIndianRupees(Math.round(realGain))}</span>.
            </>
          );
          subline = `At ${fdRate}% your real return after 6% inflation is just ${realReturn}%. Your money is working — but barely.`;
        } else {
          headline = (
            <>
              Your <span className="font-display font-bold">{formatIndianRupees(principal)}</span> FD earns <span className="font-display font-bold">{formatIndianRupees(grossInterest)}</span> — but you are losing money in real terms.
            </>
          );
          subline = `After 6% inflation your ${formatIndianRupees(principal)} is worth only ${formatIndianRupees(Math.round(realMaturityValue))} at maturity. Inflation erased ${formatIndianRupees(Math.round(Math.abs(realGain)))} of your purchasing power.`;
          mainValueColor = '#f87171'; // red-400
        }

        return {
          badge: 'GROW',
          emoji: '📈',
          headline,
          accentColor: '#10b981',
          glowColor: '#10b981',
          mainValueColor,
          footerPill: "Know your numbers.",
          stat1Label: 'TENURE',
          stat1Value: `${inputs.tenure || 0} Months`,
          stat1Color: '#10b981',
          stat2Label: 'FD INTEREST RATE',
          stat2Value: `${inputs.fdRate || 0}%`,
          stat2Color: '#ffffff',
          subline,
          mainValueSuffix: '%'
        };
      }

      // Staggered FD specific overrides
      if (title.includes('Staggered FD') || inputs.numFDs !== undefined) {
        const { 
          isReinvestOn, 
          isTaxExpanded, 
          taxRate, 
          numFDs, 
          interval, 
          longestTenure 
        } = inputs;

        let subline = "";
        if (!isReinvestOn && !isTaxExpanded) {
          subline = `Split into ${numFDs} FDs maturing every ${interval} months`;
        } else if (isReinvestOn && !isTaxExpanded) {
          subline = `Split into ${numFDs} FDs with reinvestment over ${longestTenure} months`;
        } else if (!isReinvestOn && isTaxExpanded) {
          subline = `Split into ${numFDs} FDs maturing every ${interval} months · After ${taxRate}% tax`;
        } else if (isReinvestOn && isTaxExpanded) {
          subline = `Split into ${numFDs} FDs with reinvestment · After ${taxRate}% tax`;
        }

        return {
          badge: 'GROW',
          emoji: '📈',
          headline: 'My emergency fund earns an extra of',
          accentColor: '#10b981',
          glowColor: '#10b981',
          mainValueColor: '#10b981',
          footerPill: "Know your numbers.",
          stat1Label: '',
          stat1Value: '',
          stat1Color: '#10b981',
          stat2Label: '',
          stat2Value: '',
          stat2Color: '#ffffff',
          subline: subline
        };
      }

      return {
        badge: 'GROW',
        emoji: title.includes('Goal') ? '🎯' : '🌱',
        headline: 'I am building',
        accentColor: '#10b981', // emerald-500
        glowColor: '#10b981',
        mainValueColor: '#10b981',
        footerPill: "Know your numbers.",
        stat1Label: 'MONTHLY SIP',
        stat1Value: formatIndianRupees(monthlySIP),
        stat1Color: '#10b981',
        stat2Label: 'TIME HORIZON',
        stat2Value: `${years} Years`,
        stat2Color: '#ffffff',
        subline: `With ${formatIndianRupees(monthlySIP)}/month for ${years} years`
      };
    }

    // BUY CATEGORY (Home Purchase)
    if (category === 'buy') {
      // Buy vs Rent specific
      if (title.includes('Buy vs Rent') || inputs.rentNetWorth !== undefined) {
        const { 
          propertyPrice, 
          tenureYears, 
          winner, 
          buyNetWorth, 
          rentNetWorth,
          loanRate,
          sipReturn,
          appreciationRate
        } = inputs;

        return {
          badge: 'BUY',
          emoji: '🏡',
          headline: (
            <div className="text-left w-full">
              <p className="text-[14px] font-serif italic font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">
                FOR A {formatIndianShort(propertyPrice)} HOME IN BENGALURU
              </p>
              <h2 className="text-[48px] md:text-[54px] font-serif font-bold text-white leading-[1] mb-2">
                {winner.includes('Rent') ? 'Renting beats' : 'Buying beats'}
              </h2>
              <h2 className="text-[48px] md:text-[54px] font-serif font-bold text-white leading-[1] mb-8">
                {winner.includes('Rent') ? 'buying by' : 'renting by'}
              </h2>
            </div>
          ),
          accentColor: '#10b981',
          glowColor: '#10b981',
          mainValueColor: '#10b981',
          footerPill: winner.includes('Rent') ? (
            <div className="flex flex-col items-center leading-tight">
              <span>RENT</span>
              <span>WINS</span>
            </div>
          ) : (
            <div className="flex flex-col items-center leading-tight">
              <span>BUY</span>
              <span>WINS</span>
            </div>
          ),
          stat1Label: 'BUY NET WORTH',
          stat1Value: formatIndianShort(buyNetWorth),
          stat1Color: winner.includes('Rent') ? '#ff6b6b' : '#00d278',
          stat2Label: 'RENT + INVEST',
          stat2Value: formatIndianShort(rentNetWorth),
          stat2Color: winner.includes('Rent') ? '#00d278' : '#ff6b6b',
          subline: `OVER ${tenureYears} YEARS`,
          mainValueSuffix: '',
          customBottomLeft: `${loanRate}% loan · ${sipReturn}% SIP · ${appreciationRate}% appreciation`,
          isBuyVsRent: true
        };
      }

      return {
        badge: 'BUY',
        emoji: '🏡',
        headline: 'My dream home needs a downpayment of',
        accentColor: '#22d3ee', // cyan-400
        glowColor: '#22d3ee',
        mainValueColor: '#22d3ee',
        footerPill: "Know your numbers.",
        stat1Label: '',
        stat1Value: '',
        stat1Color: '#22d3ee',
        stat2Label: '',
        stat2Value: '',
        stat2Color: '#ffffff',
        subline: `On a ${formatIndianRupees(inputs.propertyPrice || 0)} home in ${inputs.city || 'your city'}`
      };
    }

    // BORROW CATEGORY (EMI, Affordability)
    if (category === 'borrow') {
      // Affordability specific
      if (title.includes('Affordability') || title.includes('Power')) {
        return {
          badge: 'BORROW',
          emoji: '💳',
          headline: 'I can safely borrow',
          accentColor: '#a855f7', // purple-500
          glowColor: '#a855f7',
          mainValueColor: '#10b981',
          footerPill: "Know your numbers.",
          stat1Label: 'TENURE',
          stat1Value: `${inputs.tenure || 0} Years`,
          stat1Color: '#a855f7',
          stat2Label: 'INTEREST RATE',
          stat2Value: `${inputs.interestRate || 0}%`,
          stat2Color: '#ffffff',
          subline: `At a safe EMI of ${formatIndianRupees(inputs.availableEMI || 0)}/month`
        };
      }

      // Default Borrow (EMI)
      return {
        badge: 'BORROW',
        emoji: '🏠',
        headline: 'My monthly EMI is',
        accentColor: '#a855f7', // purple-500
        glowColor: '#a855f7',
        mainValueColor: '#ffffff',
        footerPill: "Know your numbers.",
        stat1Label: 'TOTAL INTEREST',
        stat1Value: formatIndianRupees(inputs.totalInterest || 0),
        stat1Color: '#a855f7',
        stat2Label: 'TOTAL PAYMENT',
        stat2Value: formatIndianRupees(inputs.totalPayment || 0),
        stat2Color: '#ffffff',
        subline: `On a ${formatIndianRupees(inputs.loanAmount || 0)} loan at ${inputs.interestRate}% for ${inputs.tenure} years`
      };
    }

    // Default fallback
    return {
      badge: 'VISION',
      emoji: '✨',
      headline: 'My financial vision',
      accentColor: '#10b981',
      glowColor: '#10b981',
      mainValueColor: '#10b981',
      footerPill: "Know your numbers.",
      stat1Label: 'VALUE',
      stat1Value: formatIndianRupees(mainValue),
      stat1Color: '#10b981',
      stat2Label: 'STATUS',
      stat2Value: 'Calculated',
      stat2Color: '#ffffff',
      subline: 'Your financial future, visualized.'
    };
  };

  const config = getCardConfig();
  const isAffordability = title.includes('Affordability') || title.includes('Power');
  const isBasicFD = title.includes('Basic FD') || (inputs.fdRate !== undefined && inputs.numFDs === undefined);

  const getFinalInsight = () => {
    // Basic FD specific fallback
    if (title.includes('Basic FD') || (inputs.fdRate !== undefined && inputs.numFDs === undefined)) {
      if (!insight) {
        const { 
          principal, 
          fdRate, 
          tenure, 
          grossInterest, 
          inflationErosion, 
          realGain, 
          sipCorpus, 
          opportunityCost,
          realMaturityValue,
          taxSlab,
          postTaxRealGain,
          isTaxExpanded
        } = inputs;

        const format = (val: number) => formatIndianRupees(Math.round(val));
        const colorClass = (val: number) => val > 500 ? 'text-emerald-400' : 'text-red-400';

        const realReturn = inputs.realReturn || 0;
        let text = "";
        let insightLine = "";

        if (realReturn > 1) {
          insightLine = "A healthy real return for a risk-free instrument. Your emergency fund is holding its value.";
          text = `Your ${format(principal)} FD earns <span class="text-white">${format(grossInterest)}</span> at ${fdRate}% over ${tenure} months. But inflation at 6% takes back <span class="text-amber-400">${format(inflationErosion)}</span> — your real gain is <span class="${colorClass(realGain)}">${format(realGain)}</span>. ${insightLine} The same ${format(principal)} invested in an equity mutual fund at a historical 12% would have grown to ${format(sipCorpus)} — that is <span class="text-emerald-400">${format(opportunityCost)}</span> more for taking on market risk.`;
        } else if (realReturn >= 0) {
          insightLine = "Inflation is quietly eating your savings. FD preserves wealth — it does not build it.";
          text = `Your ${format(principal)} FD earns <span class="text-white">${format(grossInterest)}</span> at ${fdRate}% over ${tenure} months. But inflation at 6% takes back <span class="text-amber-400">${format(inflationErosion)}</span> — your real gain is <span class="${colorClass(realGain)}">${format(realGain)}</span>. ${insightLine} The same ${format(principal)} invested in an equity mutual fund at a historical 12% would have grown to ${format(sipCorpus)} — that is <span class="text-emerald-400">${format(opportunityCost)}</span> more for taking on market risk.`;
        } else {
          insightLine = "Every year this money sits in an FD it buys less than it did before. This is the silent cost of playing it too safe.";
          text = `Your ${format(principal)} FD earns <span class="text-white">${format(grossInterest)}</span> at ${fdRate}% — but after 6% inflation your money is worth only ${format(realMaturityValue)} in today's purchasing power. You lost <span class="text-red-400">${format(Math.abs(realGain))}</span> in real terms. ${insightLine} The same amount in an equity mutual fund at 12% historical returns would have grown to ${format(sipCorpus)} over the same period.`;
        }

        if (isTaxExpanded && taxSlab > 0) {
          text += ` After ${taxSlab}% tax your real gain shrinks further to <span class="${postTaxRealGain > 0 ? 'text-emerald-400' : 'text-red-400'}">${format(postTaxRealGain)}</span>. That is the true cost of safe money at your income level.`;
        }

        return (
          <div className="space-y-3">
            <p dangerouslySetInnerHTML={{ __html: text }} />
            <p className="text-zinc-500 text-[11px] not-italic mt-2">
              Equity comparison assumes 12% annual returns — historical long term average of Indian large cap mutual funds. Equity carries market risk unlike FDs.
            </p>
          </div>
        );
      }
    }

    // Staggered FD specific fallback
    if (title.includes('Staggered FD') || inputs.numFDs !== undefined) {
      const { 
        isReinvestOn, 
        isTaxExpanded, 
        taxRate, 
        grossExtraEarned, 
        postTaxExtraEarned, 
        grossReinvestedInterest, 
        postTaxReinvestedInterest, 
        reinvestmentBonus, 
        postTaxReinvestmentBonus 
      } = inputs;

      const format = (val: number) => formatIndianRupees(Math.round(val));

      if (!isTaxExpanded && !isReinvestOn) {
        return `Staggering beats a savings account by ${format(grossExtraEarned)} — for zero extra effort.`;
      } else if (isTaxExpanded && !isReinvestOn) {
        return `After ${taxRate}% tax your staggered FD still beats savings by ${format(postTaxExtraEarned)}.`;
      } else if (!isTaxExpanded && isReinvestOn) {
        return `With reinvestment your emergency fund earns ${format(grossReinvestedInterest)} — ${format(reinvestmentBonus)} more than without reinvesting.`;
      } else if (isTaxExpanded && isReinvestOn) {
        return `After ${taxRate}% tax and reinvestment your emergency fund earns ${format(postTaxReinvestedInterest)} — ${format(postTaxReinvestmentBonus)} more than without reinvesting.`;
      }
    }

    if (React.isValidElement(insight) || Array.isArray(insight)) return insight;

    // Buy vs Rent specific fallback
    if (title.includes('Buy vs Rent') || inputs.rentNetWorth !== undefined) {
      const { delayCost } = inputs;
      const fallback = `Waiting just 1 year to start investing the difference costs you ${formatIndianShort(delayCost)} in final corpus — indecision is the most expensive choice.`;
      
      if (!insight) return fallback;
      
      // Combine with generated insight
      const generatedSentences = typeof insight === 'string' 
        ? insight.split('\n').filter(s => s.trim().length > 0).map(s => s.trim().replace(/^[•\-\d.]\s*/, ''))
        : [];
      const combined = [fallback, ...generatedSentences].slice(0, 3);
      return combined;
    }

    const genericInsights = [
      "Consistent investing is the key to long-term wealth creation.",
      "Achievable — This goal is well within historical market returns.",
      "Aggressive — Requires high equity exposure and risk tolerance.",
      "Your salary qualifies for this purchase.",
      "Consider a lower price point or higher down payment.",
      "Consider a shorter tenure to save on interest",
      "wealth compounds significantly",
      "start a SIP of",
      "well within safe borrowing limits",
      "debt levels are manageable",
      "approach with caution"
    ];

    // If insight is not generic, use it
    let resultInsight = insight;
    const normalizedInsight = typeof insight === 'string' ? insight.toLowerCase().trim() : "";
    
    if (typeof insight !== 'string' || !insight || genericInsights.some(g => normalizedInsight.includes(g.toLowerCase()))) {
      // Fallback for Grow category
      if (category === 'grow') {
        const target = inputs.targetAmount || inputs.corpusRequired || mainValue;
        const years = inputs.years || (inputs.retirementAge - inputs.currentAge) || 0;
        const rate = inputs.annualRate || inputs.rate || inputs.expectedReturn || inputs.requiredReturn || inputs.returnPre || 12;
        const currentSIP = inputs.monthlyInvestment || inputs.monthlySIP || inputs.requiredSIP || 0;

        if (years > 2 && target > 0 && rate > 0) {
          const r = rate / 12 / 100;
          const n = years * 12;
          const denominator = ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
          const calcCurrentSIP = target / denominator;

          if (title.includes('Retirement') || inputs.retirementAge !== undefined) {
            const nMinus2 = (years - 2) * 12;
            const denominatorMinus2 = ((Math.pow(1 + r, nMinus2) - 1) / r) * (1 + r);
            const requiredSIPLater = target / denominatorMinus2;
            const difference = Math.max(0, requiredSIPLater - calcCurrentSIP);
            resultInsight = `Waiting just 2 more years to start would cost you ${formatIndianRupees(Math.round(difference))}/month extra for the rest of your working life.`;
          } else if (title.includes('Goal') || inputs.targetAmount !== undefined) {
            const nMinus1 = (years - 1) * 12;
            const denominatorMinus1 = ((Math.pow(1 + r, nMinus1) - 1) / r) * (1 + r);
            const requiredSIPLater = target / denominatorMinus1;
            const difference = Math.max(0, requiredSIPLater - calcCurrentSIP);
            resultInsight = `Starting just 1 year later would cost you ${formatIndianRupees(Math.round(difference))}/month more to hit the same goal — time is your cheapest investment.`;
          } else {
            const nMinus1 = (years - 1) * 12;
            const denominatorMinus1 = ((Math.pow(1 + r, nMinus1) - 1) / r) * (1 + r);
            const requiredSIPLater = target / denominatorMinus1;
            const difference = Math.max(0, requiredSIPLater - calcCurrentSIP);
            resultInsight = `Starting just 1 year later would cost you ${formatIndianRupees(Math.round(difference))}/month more to hit the same goal — time is your cheapest investment`;
          }
        }
      }

      // Fallback for Borrow category (EMI)
      if (category === 'borrow') {
        if (title.includes('EMI') || title.includes('Borrow')) {
          const principal = inputs.loanAmount || 0;
          const annualRate = inputs.interestRate || 0;
          const years = inputs.tenure || 0;
          
          if (principal > 0 && annualRate > 0 && years > 0) {
            const r = annualRate / 12 / 100;
            const n = years * 12;
            const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            
            let balanceNormal = principal;
            let totalInterestNormal = 0;
            let balanceExtra = principal;
            let totalInterestExtra = 0;
            let monthsExtra = 0;
            
            for (let m = 1; m <= n; m++) {
              const interestN = balanceNormal * r;
              totalInterestNormal += interestN;
              balanceNormal -= (emi - interestN);
              
              if (balanceExtra > 0) {
                const interestE = balanceExtra * r;
                totalInterestExtra += interestE;
                let payment = emi;
                if (m % 12 === 0) payment += emi;
                balanceExtra -= (payment - interestE);
                monthsExtra = m;
                if (balanceExtra < 0) balanceExtra = 0;
              }
            }
            
            const saved = Math.round(totalInterestNormal - totalInterestExtra);
            const monthsSaved = n - monthsExtra;
            if (saved > 0) {
              resultInsight = `One extra EMI per year saves you ${formatIndianRupees(saved)} in interest and closes your loan ${monthsSaved} months early.`;
            }
          }
        }

        if (isAffordability) {
          const monthlyIncome = inputs.monthlyIncome || inputs.income || 0;
          const existingEMI = inputs.existingEMI || 0;
          const interestRate = inputs.interestRate || 0;
          const tenure = inputs.tenure || 0;

          if (monthlyIncome > 0 && interestRate > 0 && tenure > 0) {
            const currentMaxEMI = monthlyIncome * 0.4 - existingEMI;
            const futureMaxEMI = (monthlyIncome * 1.2) * 0.4 - existingEMI;
            const r = interestRate / 12 / 100;
            const n = tenure * 12;
            const currentLoan = currentMaxEMI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
            const futureLoan = futureMaxEMI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
            const extra = Math.round(futureLoan - currentLoan);

            if (extra > 0) {
              resultInsight = `A 20% income growth unlocks ${formatIndianRupees(extra)} more borrowing power — your loan eligibility grows faster than your salary.`;
            }
          }
        }
      }
      if (category === 'buy') {
        const propertyPrice = inputs.propertyPrice || 0;
        const emi = inputs.monthlyEMI || 0;

        if (propertyPrice > 0 && emi > 0) {
          const monthlyRent = Math.round((propertyPrice * 0.025) / 12);
          const difference = Math.round(emi - monthlyRent);
          resultInsight = `At current rental yields your ${formatIndianRupees(propertyPrice)} home would earn ${formatIndianRupees(monthlyRent)}/month as rent — your EMI is ${formatIndianRupees(Math.round(emi))} so you're paying ${formatIndianRupees(difference)} extra per month for the privilege of ownership.`;
        }
      }
    }

    return (isAffordability && typeof resultInsight === 'string') ? resultInsight.replace(/Lakhs/g, 'Lacs') : resultInsight;
  };

  const finalInsight = getFinalInsight();

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      const formatted = formatIndianRupees(val);
      return isAffordability ? formatted.replace('Lakhs', 'Lacs') : formatted;
    }
    if (typeof val === 'string' && isAffordability) {
      return val.replace('Lakhs', 'Lacs');
    }
    return val;
  };

  const handleDownload = async () => {
    if (cardRef.current) {
      try {
        setIsSaving(true);
        setError(null);
        
        // Small delay to ensure styles are applied
        await new Promise(resolve => setTimeout(resolve, 200));

        const dataUrl = await toPng(cardRef.current, {
          backgroundColor: '#09090b',
          quality: 1.0,
          pixelRatio: 3,
          skipAutoScale: true,
          style: {
            transform: 'none',
          }
        });

        const link = document.createElement('a');
        link.download = `whatiff-vision-${category}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Download failed:', err);
        setError('Failed to save image. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xl overflow-y-auto">
        {/* Sticky Header for Mobile */}
        <div className="sticky top-0 z-[110] w-full flex justify-between items-center p-4 bg-black/50 backdrop-blur-md md:bg-transparent">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md mx-auto flex flex-col items-center gap-8 py-8 px-4"
        >
          {/* The Vision Card */}
          <div 
            id="vision-card"
            ref={cardRef}
            className="w-full h-auto min-h-[800px] rounded-[40px] p-8 md:p-10 flex flex-col relative overflow-hidden shadow-2xl shrink-0 font-sans"
            style={{ 
              backgroundColor: '#09090b',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            {/* Background Glows */}
            <div 
              className="absolute top-0 right-0 w-80 h-80 blur-[120px] rounded-full" 
              style={{ 
                backgroundColor: config.glowColor,
                opacity: 0.2
              }}
            />
            <div 
              className="absolute bottom-0 left-0 w-80 h-80 blur-[120px] rounded-full" 
              style={{ 
                backgroundColor: config.glowColor,
                opacity: 0.1
              }}
            />

            {/* Header */}
            <div className="flex justify-between items-center mb-12 relative z-10">
              <div 
                className="px-4 py-1.5 rounded-full border flex items-center gap-2 shadow-lg"
                style={{ 
                  borderColor: `${config.accentColor}4d`, // 30% opacity
                  backgroundColor: `${config.accentColor}1a`, // 10% opacity
                  boxShadow: `0 10px 15px -3px ${config.accentColor}33` // 20% opacity
                }}
              >
                <span 
                  className="text-[11px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: config.accentColor }}
                >
                  {config.badge}
                </span>
                <div 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: config.accentColor }}
                />
              </div>
              <span className="text-3xl filter drop-shadow-lg">{config.emoji}</span>
            </div>

            {/* Headline Section */}
            <div className={cn("mb-10 relative z-10", config.isBuyVsRent ? "text-left" : "space-y-4 text-center")}>
              <h2 className={cn(
                "font-serif font-medium text-white leading-[1.1] tracking-tight",
                config.isBuyVsRent ? "text-[48px] md:text-[54px]" : "text-[36px] md:text-[42px]"
              )}>
                {config.headline}
              </h2>
              <div 
                className={cn(
                  "font-display font-black leading-[1] tracking-tighter whitespace-nowrap", 
                  config.isBuyVsRent ? "text-[64px] md:text-[74px] mb-4" : (
                    mainValue >= 10000000 ? "text-[42px] md:text-[52px]" : 
                    (title.includes('Affordability') || title.includes('Power')) ? "text-[48px] md:text-[58px]" : "text-[54px] md:text-[64px]"
                  )
                )}
                style={{ color: config.mainValueColor }}
              >
                {config.isBuyVsRent ? formatIndianShort(mainValue) : (isBasicFD ? (mainValue < 0 ? `−${Math.abs(mainValue)}` : mainValue) : (isAffordability ? formatIndianRupees(mainValue).replace('Lakhs', 'Lacs') : formatIndianRupees(mainValue)))}
                {config.mainValueSuffix && (
                  <span className="text-[18px] md:text-[22px] ml-2 font-display font-bold opacity-70 tracking-normal">
                    {config.mainValueSuffix}
                  </span>
                )}
              </div>
              <p 
                className={cn(
                  "font-medium opacity-80 tracking-tight",
                  config.isBuyVsRent ? "text-[14px] uppercase tracking-[0.2em] text-zinc-500" : "text-base md:text-lg text-zinc-400"
                )}
              >
                {formatValue(config.subline)}
              </p>
            </div>

            {/* Divider with Glow */}
            <div className="relative h-px w-full mb-10 z-10">
              <div 
                className="absolute inset-0" 
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              />
              <div 
                className="absolute inset-0 blur-[3px]" 
                style={{ 
                  backgroundColor: config.glowColor,
                  opacity: 0.6
                }}
              />
            </div>

            {/* Stats Grid */}
            {(secondaryValues && secondaryValues.length > 0 && (title.includes('Staggered FD') || inputs.numFDs !== undefined)) ? (
              <div className={cn(
                "grid gap-4 mb-8 relative z-10",
                secondaryValues.length > 2 ? "grid-cols-2" : (secondaryValues.length === 2 ? "grid-cols-2" : "grid-cols-1")
              )}>
                {secondaryValues.map((stat, idx) => (
                  <div 
                    key={idx}
                    className="rounded-2xl p-5 md:p-6 space-y-2"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <p 
                      className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: '#71717a' }} // zinc-500
                    >
                      {stat.label}
                    </p>
                    <p 
                      className="text-lg md:text-xl font-display font-bold"
                      style={{ color: idx === 0 ? config.stat1Color : (idx === 1 ? config.stat2Color : '#ffffff') }}
                    >
                      {formatValue(stat.value)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (config.isBuyVsRent) ? (
              <div className="grid grid-cols-2 gap-0 mb-12 relative z-10 border-y border-white/5 py-8">
                <div className="space-y-3 border-r border-white/5 pr-8">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{config.stat1Label}</p>
                  <p className="text-[28px] font-display font-bold" style={{ color: config.stat1Color }}>{config.stat1Value}</p>
                </div>
                <div className="space-y-3 pl-8">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{config.stat2Label}</p>
                  <p className="text-[28px] font-display font-bold" style={{ color: config.stat2Color }}>{config.stat2Value}</p>
                </div>
              </div>
            ) : (config.stat1Label || config.stat2Label) && (
              <div className={cn(
                "grid gap-4 mb-8 relative z-10",
                (config.stat1Label && config.stat2Label) ? "grid-cols-2" : "grid-cols-1"
              )}>
                {config.stat1Label && (
                  <div 
                    className={cn(
                      "rounded-2xl p-5 md:p-6 space-y-2",
                      (category === 'borrow' || (category === 'grow' && inputs.targetAmount !== undefined)) && "flex flex-col items-center text-center"
                    )}
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <p 
                      className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: '#71717a' }} // zinc-500
                    >
                      {config.stat1Label}
                    </p>
                    <p 
                      className="text-lg md:text-xl font-display font-bold"
                      style={{ color: config.stat1Color }}
                    >
                      {formatValue(config.stat1Value)}
                    </p>
                  </div>
                )}
                {config.stat2Label && (
                  <div 
                    className={cn(
                      "rounded-2xl p-5 md:p-6 space-y-2",
                      (category === 'borrow' || (category === 'grow' && inputs.targetAmount !== undefined)) && "flex flex-col items-center text-center"
                    )}
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <p 
                      className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: '#71717a' }} // zinc-500
                    >
                      {config.stat2Label}
                    </p>
                    <div className="flex items-center gap-2">
                      {config.stat2Dot && (
                        <div 
                          className="w-2.5 h-2.5 rounded-full shadow-sm" 
                          style={{ backgroundColor: config.stat2Dot }}
                        />
                      )}
                      <p 
                        className="text-lg md:text-xl font-display font-bold"
                        style={{ color: config.stat2Color }}
                      >
                        {formatValue(config.stat2Value)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Insight Card */}
            <div 
              className={cn(
                "border-l-[6px] p-6 md:p-8 rounded-r-3xl mb-12 relative z-10",
                config.isBuyVsRent ? "border-l-0 border-t border-white/5 bg-transparent p-0 pt-8" : ""
              )}
              style={{ 
                borderLeftColor: config.isBuyVsRent ? 'transparent' : config.accentColor,
                backgroundColor: config.isBuyVsRent ? 'transparent' : 'rgba(255, 255, 255, 0.03)'
              }}
            >
              {!config.isBuyVsRent && (
                <div 
                  className="text-[9px] font-bold tracking-[0.2em] uppercase mb-3"
                  style={{ color: config.accentColor }}
                >
                  ✦ WHATIFF AI
                </div>
              )}
              <div 
                className={cn(
                  "leading-relaxed italic font-medium",
                  config.isBuyVsRent ? "text-[14px] text-zinc-400 not-italic space-y-4" : "text-[13px] md:text-[14px] text-zinc-300"
                )}
              >
                {typeof finalInsight === 'string' ? renderInsight(finalInsight) : finalInsight}
              </div>
            </div>

            {/* Footer */}
            <div 
              className="flex items-center justify-between pt-8 relative z-10 w-full mt-auto"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
            >
              <div className="flex items-center gap-2.5">
                {config.isBuyVsRent ? (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-bold text-white tracking-tighter uppercase">WhatIff</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 font-medium tracking-tight">
                      {config.customBottomLeft}
                    </p>
                  </div>
                ) : (
                  <span className="text-xl md:text-2xl font-bold text-white tracking-tighter">WhatIff</span>
                )}
              </div>
              <div 
                className={cn(
                  "font-bold text-white shadow-xl whitespace-nowrap",
                  config.isBuyVsRent ? "px-8 py-6 rounded-[32px] text-[16px] uppercase tracking-widest" : "px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-[11px]"
                )} 
                style={{ 
                  backgroundColor: config.accentColor,
                  boxShadow: `0 20px 25px -5px ${config.accentColor}33` // 20% opacity
                }}
              >
                {config.footerPill}
              </div>
            </div>
          </div>

          {/* Download Action */}
          <div className="w-full flex flex-col items-center gap-3 z-[120] pb-12">
            <button 
              onClick={handleDownload}
              disabled={isSaving}
              className={cn(
                "w-full max-w-md py-4 bg-zinc-900 text-white border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
                isSaving && "animate-pulse"
              )}
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Vision
                </>
              )}
            </button>
            {error && (
              <div className="flex items-center gap-2 text-rose-500 text-xs font-medium">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <p className="text-zinc-500 text-[11px]">Save and share anywhere.</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
