import React from 'react';
import { Info, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export type RiskLevel = 'safe' | 'moderate' | 'high';

interface InfoBoxProps {
  level: RiskLevel;
  message: string;
  className?: string;
}

export default function InfoBox({ level, message, className }: InfoBoxProps) {
  const configs = {
    safe: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-200/70',
      icon: ShieldCheck,
      iconColor: 'text-emerald-500'
    },
    moderate: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-200/70',
      icon: AlertTriangle,
      iconColor: 'text-yellow-500'
    },
    high: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-200/70',
      icon: AlertCircle,
      iconColor: 'text-red-500'
    }
  };

  const config = configs[level];
  const Icon = config.icon;

  return (
    <div className={cn("p-4 rounded-xl flex gap-3 items-start border", config.bg, config.border, className)}>
      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", config.iconColor)} />
      <p className={cn("text-xs leading-relaxed", config.text)}>
        {message}
      </p>
    </div>
  );
}
