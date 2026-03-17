import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatIndianRupees(amount: number) {
  const rounded = Math.round(amount);
  if (Math.abs(rounded) >= 10000000) {
    const value = rounded / 10000000;
    const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Crore`;
  }
  if (Math.abs(rounded) >= 100000) {
    const value = rounded / 100000;
    const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Lakhs`;
  }
  return `₹${rounded.toLocaleString('en-IN')}`;
}

export function formatIndianShort(amount: number) {
  const rounded = Math.round(amount);
  const abs = Math.abs(rounded);
  if (abs >= 10000000) {
    const val = (rounded / 10000000).toFixed(2).replace(/\.00$/, '');
    return `₹${val}Cr`;
  }
  if (abs >= 100000) {
    const val = (rounded / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹${val}L`;
  }
  return `₹${rounded.toLocaleString('en-IN')}`;
}

export function formatCompactNumber(number: number) {
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(number);
}
