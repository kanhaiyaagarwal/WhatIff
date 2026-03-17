import * as XLSX from 'xlsx';
import { formatCurrency } from './utils';

export const exportToExcel = (title: string, description: string, inputs: any, mainLabel: string, mainValue: number, secondaryValues: { label: string; value: string | number }[], insight: string) => {
  const data = [
    ['WhatIff Calculation Report'],
    ['Title', title],
    ['Description', description],
    [''],
    ['Inputs'],
    ...Object.entries(inputs).map(([k, v]) => [k, v]),
    [''],
    ['Results'],
    [mainLabel, mainValue],
    ...secondaryValues.map(sv => [sv.label, sv.value]),
    [''],
    ['Expert Insight'],
    [insight]
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Calculation');
  XLSX.writeFile(wb, `WhatIff_${title.replace(/\s+/g, '_')}.xlsx`);
};
