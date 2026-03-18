export const INFLATION_RATE = 6;

export interface SIPResult {
  futureValue: number;
  totalInvestment: number;
  totalEarnings: number;
  realCorpus: number;
  realReturns: number;
  purchasingPowerLost: number;
  yearlyData: { year: number; balance: number; investment: number; realBalance: number }[];
}

export function calculateSIP(
  monthlyInvestment: number,
  annualRate: number,
  years: number,
  stepUpPercentage: number = 0
): SIPResult {
  const monthlyRate = annualRate / 12 / 100;
  const realReturnRate = ((1 + annualRate / 100) / (1 + INFLATION_RATE / 100) - 1) * 100;
  const monthlyRealRate = realReturnRate / 12 / 100;
  
  const months = years * 12;
  let futureValue = 0;
  let realCorpus = 0;
  let totalInvestment = 0;
  const yearlyData = [];

  let currentMonthlyInvestment = monthlyInvestment;

  for (let m = 1; m <= months; m++) {
    futureValue = (futureValue + currentMonthlyInvestment) * (1 + monthlyRate);
    realCorpus = (realCorpus + currentMonthlyInvestment) * (1 + monthlyRealRate);
    totalInvestment += currentMonthlyInvestment;

    if (m % 12 === 0) {
      yearlyData.push({
        year: m / 12,
        balance: Math.round(futureValue),
        investment: Math.round(totalInvestment),
        realBalance: Math.round(realCorpus),
      });
      currentMonthlyInvestment *= (1 + stepUpPercentage / 100);
    }
  }

  return {
    futureValue: Math.round(futureValue),
    totalInvestment: Math.round(totalInvestment),
    totalEarnings: Math.round(futureValue - totalInvestment),
    realCorpus: Math.round(realCorpus),
    realReturns: Math.round(realCorpus - totalInvestment),
    purchasingPowerLost: Math.round(futureValue - realCorpus),
    yearlyData,
  };
}

export interface EMIResult {
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  amortization: { month: number; principal: number; interest: number; balance: number }[];
}

export function calculateEMI(
  principal: number,
  annualRate: number,
  years: number
): EMIResult {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  
  let emi;
  if (monthlyRate === 0) {
    emi = principal / months;
  } else {
    emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
          (Math.pow(1 + monthlyRate, months) - 1);
  }
  
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  
  const amortization = [];
  let balance = principal;
  
  for (let m = 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    balance -= principalPaid;
    
    if (m % 12 === 0 || m === months) {
      amortization.push({
        month: m,
        principal: Math.round(principalPaid),
        interest: Math.round(interest),
        balance: Math.max(0, Math.round(balance)),
      });
    }
  }

  return {
    monthlyEMI: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    amortization,
  };
}

export function calculateRetirement(
  currentAge: number,
  retirementAge: number,
  monthlyExpense: number,
  inflationRate: number,
  expectedReturnPre: number,
  expectedReturnPost: number,
  lifeExpectancy: number = 85
) {
  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;
  
  // Future monthly expense at retirement
  const futureMonthlyExpense = monthlyExpense * Math.pow(1 + inflationRate / 100, yearsToRetirement);
  
  // Real rate of return post retirement
  const realRate = ((1 + expectedReturnPost / 100) / (1 + inflationRate / 100)) - 1;
  const monthlyRealRate = realRate / 12;
  const totalMonthsPost = yearsInRetirement * 12;
  
  // Corpus required (Present Value of Annuity)
  let corpusRequired;
  if (Math.abs(monthlyRealRate) < 0.000001) {
    corpusRequired = futureMonthlyExpense * totalMonthsPost;
  } else {
    corpusRequired = futureMonthlyExpense * 
      ((1 - Math.pow(1 + monthlyRealRate, -totalMonthsPost)) / monthlyRealRate);
  }
    
  return {
    futureMonthlyExpense: Math.round(futureMonthlyExpense),
    corpusRequired: Math.round(corpusRequired),
    yearsToRetirement,
    yearsInRetirement
  };
}

export function calculateLoanAffordability(
  monthlyIncome: number,
  existingEMI: number,
  interestRate: number,
  tenureYears: number
) {
  const maxEMIAllowed = monthlyIncome * 0.4; // 40% rule
  const availableEMI = Math.max(0, maxEMIAllowed - existingEMI);
  
  const r = interestRate / 12 / 100;
  const n = tenureYears * 12;
  
  let maxLoan;
  if (r === 0) {
    maxLoan = availableEMI * n;
  } else {
    maxLoan = availableEMI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  }
  
  let riskLevel: 'Safe' | 'Moderate' | 'High' = 'Safe';
  const emiToIncomeRatio = (existingEMI + availableEMI) / monthlyIncome;
  
  if (emiToIncomeRatio > 0.45) riskLevel = 'High';
  else if (emiToIncomeRatio > 0.35) riskLevel = 'Moderate';
  
  return {
    maxLoan: Math.round(maxLoan),
    availableEMI: Math.round(availableEMI),
    riskLevel,
    ratio: Math.round(emiToIncomeRatio * 100)
  };
}

export interface FDItem {
  id: number;
  amount: number;
  tenureMonths: number;
  maturityValue: number;
  interestEarned: number;
}

export interface StaggeredFDResult {
  amountPerFD: number;
  fdData: FDItem[];
  totalFDInterest: number;
  extraInterest: number;
  interval: number;
  reinvestedInterest: number;
  reinvestmentBonus: number;
  totalInterestWithReinvestment: number;
}

export function calculateStaggeredFD(
  totalAmount: number,
  numFDs: number,
  fdRate: number,
  savingsRate: number,
  isReinvested: boolean = false
): StaggeredFDResult {
  const amountPerFD = totalAmount / numFDs;
  // Fixed 3-month interval as per user's verification example (3, 6, 9... months)
  const interval = 3;
  const fdData: FDItem[] = [];
  let totalFDInterest = 0;
  let totalExtraEarned = 0;
  let totalReinvestedInterest = 0;
  let totalSavingsInterestWithReinvestment = 0;

  for (let i = 1; i <= numFDs; i++) {
    const tenureMonths = i * interval;
    
    // Without Reinvestment (Simple Interest)
    const fdInterest = amountPerFD * (fdRate / 100) * (tenureMonths / 12);
    const extraPerFD = amountPerFD * (fdRate / 100 - savingsRate / 100) * (tenureMonths / 12);
    
    totalFDInterest += fdInterest;
    totalExtraEarned += extraPerFD;

    // With Reinvestment (Compound Interest)
    // totalTenure = originalTenure + 18 months
    const totalTenure = tenureMonths + 18;
    const reinvestedMaturity = amountPerFD * Math.pow(1 + (fdRate / 100 / 12), totalTenure);
    const reinvestedInterest = reinvestedMaturity - amountPerFD;
    const savingsInterestWithReinvestment = amountPerFD * (savingsRate / 100) * (totalTenure / 12);
    
    totalReinvestedInterest += reinvestedInterest;
    totalSavingsInterestWithReinvestment += savingsInterestWithReinvestment;
    
    fdData.push({
      id: i,
      amount: Math.round(amountPerFD),
      tenureMonths: Math.round(tenureMonths * 10) / 10,
      maturityValue: Math.round(amountPerFD + fdInterest),
      interestEarned: Math.round(fdInterest)
    });
  }

  const reinvestmentBonus = totalReinvestedInterest - totalFDInterest;
  const extraEarnedWithReinvestment = totalReinvestedInterest - totalSavingsInterestWithReinvestment;

  return {
    amountPerFD: Math.round(amountPerFD),
    fdData,
    totalFDInterest: Math.round(totalFDInterest),
    extraInterest: Math.round(isReinvested ? extraEarnedWithReinvestment : totalExtraEarned),
    interval: interval,
    reinvestedInterest: Math.round(totalReinvestedInterest),
    reinvestmentBonus: Math.round(reinvestmentBonus),
    totalInterestWithReinvestment: Math.round(totalReinvestedInterest)
  };
}

export interface BasicFDResult {
  grossInterest: number;
  maturityAmount: number;
  realReturn: number;
}

export function calculateBasicFD(
  principal: number,
  annualRate: number,
  tenureMonths: number
): BasicFDResult {
  // Quarterly compounding is standard for FD in India
  const r = annualRate / 100;
  const n = 4;
  const t = tenureMonths / 12;
  
  const maturityAmount = principal * Math.pow(1 + r/n, n * t);
  const grossInterest = maturityAmount - principal;
  
  // Real Return after Inflation formula: ((1 + r) / (1 + i) - 1) * 100
  const userRealReturn = ((1 + annualRate / 100) / (1 + 6 / 100) - 1) * 100;
  
  return {
    grossInterest: Math.round(grossInterest),
    maturityAmount: Math.round(maturityAmount),
    realReturn: Math.round(userRealReturn * 100) / 100
  };
}

export interface BuyVsRentResult {
  emi: number;
  totalMonthlyBuy: number;
  propertyValueAtEnd: number;
  totalPaidBuy: number;
  netWorthBuy: number;
  monthlyInvestable: number;
  totalRentPaid: number;
  sipCorpus: number;
  netWorthRent: number;
  yearlyData: {
    year: number;
    buyNetWorth: number;
    rentNetWorth: number;
  }[];
  breakEvenYear: number | null;
}

export function calculateBuyVsRent(
  propertyPrice: number,
  downPaymentPercent: number,
  loanRate: number,
  tenureYears: number,
  maintenance: number,
  currentRent: number,
  rentIncrease: number,
  sipReturn: number,
  appreciationRate: number
): BuyVsRentResult {
  const downPayment = propertyPrice * (downPaymentPercent / 100);
  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = loanRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  const emi = (loanAmount === 0 || monthlyRate === 0)
    ? (loanAmount / (tenureYears * 12)) 
    : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1));
  const totalMonthlyBuyInitial = emi + maintenance;
  
  const monthlySipRate = sipReturn / 12 / 100;

  let totalRentPaid = 0;
  let currentMonthlyRent = currentRent;
  let currentSipBalance = downPayment; // Start with down payment as lump sum
  let breakEvenYear = null;
  const yearlyData = [];

  for (let y = 1; y <= tenureYears; y++) {
    // 1. BUY SCENARIO
    const propertyValueAtYear = propertyPrice * Math.pow(1 + appreciationRate / 100, y);
    const paymentsMade = y * 12;
    // Standard remaining balance formula
    let remainingLoan;
    if (monthlyRate === 0) {
      remainingLoan = Math.max(0, loanAmount * (1 - paymentsMade / totalMonths));
    } else {
      remainingLoan = loanAmount * (Math.pow(1 + monthlyRate, totalMonths) - Math.pow(1 + monthlyRate, paymentsMade)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }
    const buyNetWorth = propertyValueAtYear - Math.max(0, remainingLoan);

    // 2. RENT SCENARIO
    // Rent is paid monthly, and the difference is invested monthly
    // For simplicity, we calculate yearly growth
    for (let m = 1; m <= 12; m++) {
      totalRentPaid += currentMonthlyRent;
      const monthlyInvestable = (emi + maintenance) - currentMonthlyRent;
      
      // Grow existing corpus
      currentSipBalance *= (1 + monthlySipRate);
      // Add monthly investment
      currentSipBalance += monthlyInvestable;
    }

    const rentNetWorth = currentSipBalance;

    yearlyData.push({
      year: y,
      buyNetWorth: Math.round(buyNetWorth),
      rentNetWorth: Math.round(rentNetWorth)
    });

    // Check crossover: Rent + Invest overtakes Buy
    if (rentNetWorth > buyNetWorth && breakEvenYear === null) {
      breakEvenYear = y;
    }

    // Increase rent for next year
    currentMonthlyRent *= (1 + rentIncrease / 100);
  }

  const finalBuyNW = yearlyData[tenureYears - 1].buyNetWorth;
  const finalRentNW = yearlyData[tenureYears - 1].rentNetWorth;

  return {
    emi: Math.round(emi),
    totalMonthlyBuy: Math.round(totalMonthlyBuyInitial),
    propertyValueAtEnd: Math.round(propertyPrice * Math.pow(1 + appreciationRate / 100, tenureYears)),
    totalPaidBuy: Math.round(downPayment + (emi * totalMonths) + (maintenance * totalMonths)),
    netWorthBuy: Math.round(finalBuyNW),
    monthlyInvestable: Math.round(totalMonthlyBuyInitial - currentRent),
    totalRentPaid: Math.round(totalRentPaid),
    sipCorpus: Math.round(currentSipBalance),
    netWorthRent: Math.round(finalRentNW),
    yearlyData,
    breakEvenYear
  };
}

export function calculateRentInvestCorpus(
  propertyPrice: number,
  downPaymentPercent: number,
  loanRate: number,
  tenureYears: number,
  maintenance: number,
  currentRent: number,
  rentIncrease: number,
  sipReturn: number
) {
  if (tenureYears <= 0) return 0;
  
  const downPayment = propertyPrice * (downPaymentPercent / 100);
  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = loanRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  let emi;
  if (monthlyRate === 0) {
    emi = loanAmount / totalMonths;
  } else {
    emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }
  const monthlySipRate = sipReturn / 12 / 100;

  let currentMonthlyRent = currentRent;
  let currentSipBalance = downPayment; 

  for (let y = 1; y <= tenureYears; y++) {
    for (let m = 1; m <= 12; m++) {
      const monthlyInvestable = (emi + maintenance) - currentMonthlyRent;
      currentSipBalance *= (1 + monthlySipRate);
      currentSipBalance += monthlyInvestable;
    }
    currentMonthlyRent *= (1 + rentIncrease / 100);
  }
  return currentSipBalance;
}

export function calculateRequiredSIP(
  targetAmount: number,
  annualRate: number,
  years: number
): number {
  if (targetAmount <= 0) return 0;
  if (years <= 0) return targetAmount;
  
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  
  if (monthlyRate === 0) {
    return targetAmount / months;
  }
  
  // SIP formula: FV = P * [((1 + r)^n - 1) / r] * (1 + r)
  // Rearranging for P: P = FV / ([((1 + r)^n - 1) / r] * (1 + r))
  const sip = targetAmount / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
  return Math.round(sip);
}
