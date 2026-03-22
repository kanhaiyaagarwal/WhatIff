import React from 'react';
import { cn } from './lib/utils';

export const renderInsight = (text: string) => {
  if (!text) return null;
  
  // Split by newline and filter out empty lines
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return lines.map((line, i) => {
    // Clean up various bullet point formats: *, -, •, 1., 1), etc.
    const cleanedLine = line
      .replace(/^[\*\-•–—]\s*/, '') // Symbols
      .replace(/^\d+[\.\)]\s*/, '') // Numbered: 1. or 1)
      .replace(/\*\*/g, '')         // Bold markdown
      .replace(/\*/g, '');          // Italic markdown

    return (
      <div key={i} className="flex gap-3 items-start mb-3 last:mb-0">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
        <p className={cn(
          "leading-relaxed text-[14px]",
          i === 0 && "text-white font-normal",
          i === 1 && "text-zinc-300 font-normal",
          i === 2 && "text-emerald-400 font-bold",
          i > 2 && "text-zinc-400 font-normal"
        )}>
          {cleanedLine}
        </p>
      </div>
    );
  });
};
