import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SliderWithInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatDisplay: (value: number) => string;
  className?: string;
  accentColor?: 'emerald' | 'blue' | 'purple' | 'amber' | 'red';
  footerLabel?: string;
  tag?: string;
}

export default function SliderWithInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatDisplay,
  className,
  accentColor = 'emerald',
  footerLabel,
  tag
}: SliderWithInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const [shouldShake, setShouldShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accentClasses = {
    emerald: 'text-emerald-500 accent-emerald-500 border-emerald-500',
    blue: 'text-blue-500 accent-blue-500 border-blue-500',
    purple: 'text-purple-500 accent-purple-500 border-purple-500',
    amber: 'text-amber-500 accent-amber-500 border-amber-500',
    red: 'text-red-500 accent-red-500 border-red-500',
  };

  const currentAccent = accentClasses[accentColor];
  const accentText = currentAccent.split(' ')[0];
  const accentRange = currentAccent.split(' ')[1];
  const accentBorder = currentAccent.split(' ')[2];

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  const handleBlur = () => {
    let num = parseFloat(inputValue);
    if (isNaN(num)) {
      num = value;
    }

    let clamped = num;
    let shook = false;
    if (num < min) {
      clamped = min;
      shook = true;
    } else if (num > max) {
      clamped = max;
      shook = true;
    }

    if (shook) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
    }

    // Round to nearest step
    const stepped = Math.round(clamped / step) * step;
    onChange(stepped);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
      setIsEditing(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-zinc-400">{label}</label>
          {tag && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-500 uppercase tracking-wider">
              {tag}
            </span>
          )}
        </div>
        <div className="relative min-w-[120px] flex justify-end">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.input
                key="input"
                ref={inputRef}
                autoFocus
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: 1,
                  scale: 1,
                  x: shouldShake ? [-4, 4, -4, 4, 0] : 0 
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: shouldShake ? 0.4 : 0.2 }}
                className={cn(
                  "bg-zinc-900 font-bold text-right border-[1.5px] rounded-[6px] px-2 py-1 focus:outline-none w-full",
                  accentText,
                  accentBorder
                )}
              />
            ) : (
              <motion.span
                key="text"
                onClick={() => setIsEditing(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "font-bold cursor-pointer transition-all border-b border-transparent",
                  accentText
                )}
              >
                {formatDisplay(value)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("input-slider", accentRange)}
      />
      {footerLabel && (
        <p className="text-[11px] text-zinc-400">{footerLabel}</p>
      )}
    </div>
  );
}
