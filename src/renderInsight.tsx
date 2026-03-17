import React from 'react';
import { cn } from './lib/utils';

export const renderInsight = (text: string) => {
  if (!text) return null;
  return text
    .split('\n')
    .map(line => line
      .replace(/^[\*\-•–—]\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^-\s*/, '')
      .trim()
    )
    .filter(line => line.length > 0)
    .map((line, i) => (
      <div key={i} className="flex gap-3 items-start mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
        <p className={cn(
          "leading-relaxed",
          i === 0 && "text-white text-[14px] font-normal",
          i === 1 && "text-zinc-300 text-[13px] font-normal",
          i === 2 && "text-emerald-400 text-[14px] font-bold"
        )}>
          {line}
        </p>
      </div>
    ));
};
