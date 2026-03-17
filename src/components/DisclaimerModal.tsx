import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DisclaimerModal({ isOpen, onClose }: DisclaimerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-card p-8 space-y-6 shadow-2xl border-white/10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Financial Disclaimer</h3>
              <p className="text-zinc-400 text-[13px] leading-[1.7]">
                <strong className="text-white block mb-3">Nothing on WhatIff should be construed as financial planning or perceived as financial advice.</strong>
                All calculations on WhatIff are based on the inputs you provide and standard financial formulas. 
                Results are hypothetical and illustrative in nature — they do not reflect actual investment returns, 
                guaranteed loan approvals, or assured financial outcomes. Market returns fluctuate, interest rates change, 
                and individual financial circumstances vary. Fees, taxes, inflation deviations, and other real-world factors 
                are not fully accounted for in these projections. WhatIff is a planning tool designed to help you think 
                clearly about your finances — not a substitute for professional financial advice. Your actual results 
                will depend on market conditions, lender policies, and your personal financial behaviour.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              Understood
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
