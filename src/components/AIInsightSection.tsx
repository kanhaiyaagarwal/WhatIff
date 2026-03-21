import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { trackEvent } from '../lib/analytics';

interface AIInsightSectionProps {
  title: string;
  description: string;
  mainValue: number;
  mainLabel: string;
  secondaryValues: { label: string; value: string | number }[];
  category: 'grow' | 'buy' | 'borrow';
  inputs: any;
  customPrompt?: string;
  isComparison?: boolean;
  onInsightGenerated?: (insight: string) => void;
}

import { renderInsight } from '../renderInsight';
import InsightFeedback from './InsightFeedback';

export default function AIInsightSection({
  title,
  description,
  mainValue,
  mainLabel,
  secondaryValues,
  category,
  inputs,
  customPrompt,
  isComparison = false,
  onInsightGenerated
}: AIInsightSectionProps) {
  const [insight, setInsight] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const generateAIInsight = async () => {
    if (inputs?.isOverInvesting || cooldown > 0) return;
    setIsGenerating(true);
    try {
      const globalInstruction = `
      You are a smart, warm friend who is good with numbers. You are not a financial advisor. You are not telling anyone what to do. You are simply showing people what their own numbers mean — in plain, everyday language that anyone can understand.
      HARD RULES — these override everything:

      Never tell the user what to do
      Never use: should, consider, recommend, try, could, might want to
      Never mention specific financial products or investment instruments
      Never promise or imply a future outcome
      Every number you reference must come directly from the user's inputs and outputs — never invent figures
      Any external benchmark used must be clearly labelled as an approximate benchmark — never stated as a fact about the user personally
      Write like you are explaining something to a smart friend who has never studied finance — no jargon, no technical terms, no complex sentences
      If you must use a financial term explain it immediately in plain language in the same sentence

      LANGUAGE RULES:

      Use short sentences. One idea per sentence.
      Use everyday words. Not 'nominal value' — say 'raw rupee amount'. Not 'purchasing power erosion' — say 'what your money can actually buy'. Not 'corpus' — say 'total amount'. Not 'outflow' — say 'what you pay out'. Not 'DTI ratio' — say 'how much of your salary goes to loan repayments'.
      If a number is large, translate it — not just '₹24.3L' but '₹24.3L — that is roughly 24 lakh rupees'
      Avoid passive voice. Say 'inflation eats ₹3L of your returns' not '₹3L is eroded by inflation'

      FACTUAL RULES:

      Only state what the numbers show — nothing more
      Flag when a value exceeds or falls below a standard benchmark — clearly label it as a benchmark, not a rule
      Show the mathematical consequence of the inputs without telling the user how to respond to it

      MAKE IT HUMAN:
      Anchor numbers to real life so they feel tangible. Use these approximate Indian benchmarks — always label them as approximate:

      A child's 4-year private engineering degree costs roughly ₹15–25L today
      An entry-level car costs roughly ₹8–12L today
      An average urban Indian household earns roughly ₹3–5L per year
      A 1BHK in a metro costs roughly ₹20,000–30,000 per month in rent

      Always use the user's own numbers first before reaching for external benchmarks. If the user's income, principal, or tenure already tells the story — use that. Only bring in an external benchmark when it adds something the user's own numbers cannot show.
      When numbers are stark or surprising — let them land. Do not soften the truth. Do not cushion it. Just say it plainly.
      STRUCTURE — every insight must follow this exact arc in three short paragraphs:
      Paragraph 1 — What the numbers show:
      State the key output plainly using the user's own numbers. One or two sentences maximum. Simple language. No jargon.
      Paragraph 2 — What it means in real life:
      Take one number from the output and translate it into something a person can picture. Use the user's own data first. Use an external benchmark only if it adds something new. Keep it to two sentences maximum.
      Paragraph 3 — The one thing they did not know:
      This is the most important part. State one mathematical fact derived from the user's numbers that they would be unlikely to have calculated themselves. Something that makes them stop and think. It must be a fact — not a suggestion, not advice, not a recommendation. No action words. No instruments. If the first two paragraphs covered the obvious, go deeper — look at ratios, crossover points, compounding effects, or relationships between two output numbers the user has not directly compared. This paragraph must always be present. Never skip it.
      
      The insight must feel like a smart friend just explained your own numbers back to you in a way that finally made sense. Not a warning. Not a sales pitch. Just the truth, plainly told.
      
      AI insights must be strictly factual and number-based. They must never constitute financial advice, investment recommendations, or financial planning guidance.`;

      const promptMap = {
        grow: `${globalInstruction}
          Analyze these "grow" figures:
          - Main Value (${mainLabel}): ${mainValue}
          - Context: ${description}
          - Inputs: ${JSON.stringify(inputs)}`,
        buy: `${globalInstruction}
          Analyze these "buy" figures:
          - Main Value (${mainLabel}): ${mainValue}
          - Context: ${description}
          - Inputs: ${JSON.stringify(inputs)}`,
        borrow: `${globalInstruction}
          Analyze these "borrow" figures:
          - Main Value (${mainLabel}): ${mainValue}
          - Context: ${description}
          - Inputs: ${JSON.stringify(inputs)}`
      };

      const currencyFormattingInstruction = `
      
      IMPORTANT: Always format Indian currency figures in the Indian numbering system using lakhs (L) and crores (Cr) notation.
      - Values ≥ 1,00,00,000 → display as Cr (e.g., ₹1.82 Cr)
      - Values ≥ 1,00,000 and < 1,00,00,000 → display as L (e.g., ₹91.95 L)
      - Round to 2 decimal places.
      - Always prefix with ₹.
      - Never display raw whole numbers for currency.`;

      const finalPrompt = (customPrompt || promptMap[category]) + currencyFormattingInstruction;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gemini-2.0-flash",
          contents: [{ parts: [{ text: finalPrompt }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate insight');
      }

      const result = await response.json();
      const text = result.text || "Analysis complete. Review your financial plan for optimal results.";
      setInsight(text);
      setCooldown(30);
      trackEvent('AI Insight Generated', {
        'Category': category,
        'Title': title,
        'Is Comparison': isComparison
      });
      if (onInsightGenerated) onInsightGenerated(text);
    } catch (error) {
      console.error('AI Insight Error:', error);
      const errorMsg = "Unable to generate insight at this moment. Please try again later.";
      setInsight(errorMsg);
      if (onInsightGenerated) onInsightGenerated(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const sentences = insight.split('\n').filter(s => s.trim().length > 0);

  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className={cn(
          "p-6 rounded-2xl bg-zinc-900 border-l-4 transition-all duration-300",
          "border-emerald-500 shadow-xl",
          !insight && "border-l-emerald-500/20 bg-zinc-900/50"
        )}>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                WHATIFF AI
              </p>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {insight 
                  ? (isComparison ? "Comparison Analysis Ready" : title) 
                  : (isComparison ? "Get AI Comparison Insight" : "Generate AI Insights")
                }
                {!insight && <ArrowRight className="w-4 h-4 text-emerald-500" />}
              </h3>
            </div>
            
            <button
              onClick={generateAIInsight}
              disabled={isGenerating || cooldown > 0}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg",
                "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-emerald-500/20 hover:shadow-emerald-500/40"
              )}
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : cooldown > 0 ? (
                <span className="text-xs font-bold">{cooldown}s</span>
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {insight && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-4 border-t border-white/5">
                  {renderInsight(insight)}
                  <div className="pt-4 border-t border-white/5">
                    <InsightFeedback 
                      calculator={title} 
                      insight={insight} 
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
