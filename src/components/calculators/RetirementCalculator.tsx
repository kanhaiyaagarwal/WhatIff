import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend,
  AreaChart,
  Area,
  ReferenceLine,
  LineChart,
  Line,
  LabelList
} from 'recharts';
import { Palmtree, Info, Share2, AlertTriangle, ChevronLeft, Download } from 'lucide-react';
import { GLOBAL_AI_INSTRUCTION } from '../../aiInsightPrompt';
import { calculateRetirement, calculateRequiredSIP } from '../../lib/calculators';
import { formatCurrency, formatCompactNumber, formatIndianRupees, formatIndianShort } from '../../lib/utils';
import SaveScenarioButton from '../SaveScenarioButton';
import ShareVision from '../ShareVision';
import InvestmentBrokerSection from '../InvestmentBrokerSection';
import InfoBox, { RiskLevel } from '../InfoBox';
import { exportToExcel } from '../../lib/exportUtils';
import AIInsightSection from '../AIInsightSection';
import { renderInsight } from '../../renderInsight';

import SliderWithInput from '../SliderWithInput';

interface RetirementCalculatorProps {
  onBack: () => void;
}

export default function RetirementCalculator({ onBack }: RetirementCalculatorProps) {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyExpense, setMonthlyExpense] = useState(50000);
  const [inflation, setInflation] = useState(6);
  const [returnPre, setReturnPre] = useState(12);
  const [returnPost, setReturnPost] = useState(8);
  const [currentSIP, setCurrentSIP] = useState(10000);
  const [existingNetWorth, setExistingNetWorth] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [barPositions, setBarPositions] = useState<{ x: number; width: number; label: string; index: number }[]>([]);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const safeValue = (val: number) => (!isNaN(val) && isFinite(val) && val >= 0) ? val : 0;

  const result = useMemo(() => {
    return calculateRetirement(
      currentAge,
      retirementAge,
      monthlyExpense,
      inflation,
      returnPre,
      returnPost
    );
  }, [currentAge, retirementAge, monthlyExpense, inflation, returnPost]);

  const futureValueOfExistingNetWorth = useMemo(() => {
    return safeValue(existingNetWorth * Math.pow(1 + returnPre / 100, result.yearsToRetirement));
  }, [existingNetWorth, returnPre, result.yearsToRetirement]);

  const remainingCorpusNeeded = useMemo(() => {
    return safeValue(result.corpusRequired - futureValueOfExistingNetWorth);
  }, [result.corpusRequired, futureValueOfExistingNetWorth]);

  // Calculate required SIP to reach corpus
  const requiredSIP = useMemo(() => {
    const n = (retirementAge - currentAge) * 12;
    if (n <= 0) return 0;
    return calculateRequiredSIP(remainingCorpusNeeded, returnPre, retirementAge - currentAge);
  }, [remainingCorpusNeeded, returnPre, retirementAge, currentAge]);

  const riskLevel = useMemo((): RiskLevel => {
    if (requiredSIP < 10000) return 'safe';
    if (requiredSIP < 30000) return 'moderate';
    return 'high';
  }, [requiredSIP]);

  const projectedCorpus = useMemo(() => {
    const r = returnPre / 12 / 100;
    const n = (retirementAge - currentAge) * 12;
    if (n <= 0) return 0;
    const fv = currentSIP * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    return Math.round(safeValue(fv));
  }, [currentSIP, returnPre, retirementAge, currentAge]);

  const accumulationData = useMemo(() => {
    return Array.from({ length: result.yearsToRetirement + 1 }, (_, year) => {
      const sipCorpusAtYear = requiredSIP > 0
        ? requiredSIP * ((Math.pow(1 + returnPre / 100 / 12, year * 12) - 1) / (returnPre / 100 / 12)) * (1 + returnPre / 100 / 12)
        : 0;
      const netWorthAtYear = existingNetWorth * Math.pow(1 + returnPre / 100, year);
      return {
        year: new Date().getFullYear() + year,
        sipCorpus: Math.round(sipCorpusAtYear),
        netWorthGrowth: Math.round(netWorthAtYear),
        totalCorpus: Math.round(sipCorpusAtYear + netWorthAtYear)
      };
    });
  }, [result.yearsToRetirement, requiredSIP, returnPre, existingNetWorth]);

  const comparisonData = useMemo(() => {
    const sipContribution = requiredSIP * ((Math.pow(1 + returnPre / 100 / 12, result.yearsToRetirement * 12) - 1) / (returnPre / 100 / 12)) * (1 + returnPre / 100 / 12);
    
    return [
      { name: 'Corpus Required', value: Math.round(result.corpusRequired), color: '#52525b' },
      { name: 'Existing Net Worth', value: Math.round(futureValueOfExistingNetWorth), color: '#22d3ee' },
      { name: 'SIP Contribution', value: Math.round(sipContribution), color: '#10b981' }
    ];
  }, [result.corpusRequired, futureValueOfExistingNetWorth, requiredSIP, returnPre, result.yearsToRetirement]);

  const CustomBar = (props: any) => {
    const { x, width, payload, fill, y, height, index } = props;
    
    useEffect(() => {
      setBarPositions(prev => {
        const existing = prev.find(p => p.index === index);
        if (existing && existing.x === x && existing.width === width) return prev;
        const updated = [...prev.filter(p => p.index !== index), { x, width, label: payload.name, index }].sort((a, b) => a.index - b.index);
        return updated;
      });
    }, [x, width, index, payload.name]);

    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />;
  };

  const aiData = useMemo(() => {
    const corpusInTodaysMoney = result.corpusRequired / Math.pow(1 + inflation / 100, result.yearsToRetirement);
    const monthlyWithdrawalNominal = result.futureMonthlyExpense;
    const monthlyWithdrawalReal = monthlyExpense;
    
    const totalInvested = currentSIP * result.yearsToRetirement * 12;
    const inflationAdjustedPrincipal = totalInvested * Math.pow(1 + inflation / 100, result.yearsToRetirement);
    const purchasingPowerLoss = inflationAdjustedPrincipal - totalInvested;
    const realSurplus = projectedCorpus - inflationAdjustedPrincipal;

    const totalAtRetirement = projectedCorpus + futureValueOfExistingNetWorth;
    const shortfall = result.corpusRequired - totalAtRetirement;

    return {
      currentAge,
      retirementAge,
      monthlyExpense,
      inflation,
      returnPre,
      returnPost,
      currentSIP,
      existingNetWorth,
      futureValueOfExistingNetWorth: Math.round(safeValue(futureValueOfExistingNetWorth)),
      netWorthGrowthMultiple: existingNetWorth > 0 ? (futureValueOfExistingNetWorth / existingNetWorth).toFixed(1) : "0",
      remainingCorpusNeeded: Math.round(safeValue(remainingCorpusNeeded)),
      netWorthCoversPercent: Math.round(safeValue((futureValueOfExistingNetWorth / result.corpusRequired) * 100)),
      corpusRequired: safeValue(result.corpusRequired),
      futureMonthlyExpense: safeValue(result.futureMonthlyExpense),
      yearsToRetirement: result.yearsToRetirement,
      yearsInRetirement: result.yearsInRetirement,
      requiredSIP: safeValue(requiredSIP),
      projectedCorpus: safeValue(projectedCorpus),
      totalAtRetirement: safeValue(totalAtRetirement),
      shortfall: shortfall, // Can be negative (surplus)
      corpusInTodaysMoney: safeValue(corpusInTodaysMoney),
      monthlyWithdrawalNominal: safeValue(monthlyWithdrawalNominal),
      monthlyWithdrawalReal: safeValue(monthlyWithdrawalReal),
      totalInvested: safeValue(totalInvested),
      inflationAdjustedPrincipal: safeValue(inflationAdjustedPrincipal),
      purchasingPowerLoss: safeValue(purchasingPowerLoss),
      realSurplus: safeValue(realSurplus)
    };
  }, [currentAge, retirementAge, monthlyExpense, inflation, returnPre, returnPost, currentSIP, existingNetWorth, futureValueOfExistingNetWorth, remainingCorpusNeeded, result, requiredSIP, projectedCorpus]);

  const handleExport = () => {
    exportToExcel(
      "Retirement Plan",
      `Corpus of ${formatCurrency(result.corpusRequired)} for ${result.yearsInRetirement} years`,
      { currentAge, retirementAge, monthlyExpense, inflation, returnPre, returnPost },
      "Target Corpus",
      result.corpusRequired,
      [
        { label: 'Required Monthly SIP', value: requiredSIP },
        { label: 'Future Monthly Expense', value: result.futureMonthlyExpense }
      ],
      `You need a corpus of ${formatCurrency(result.corpusRequired)} to sustain your lifestyle.`
    );
  };

  const handleSave = () => {
    setIsShareOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palmtree className="w-6 h-6 text-emerald-500" />
            Retirement Planning
          </h2>
          <p className="text-zinc-500 text-sm">Plan your financial freedom.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
            title="Export to Excel"
          >
            <Download className="w-5 h-5" />
          </button>
          <SaveScenarioButton 
            type="retirement" 
            inputs={{ currentAge, retirementAge, monthlyExpense, inflation, returnPre, returnPost }} 
            outputs={{ 
              ...result, 
              requiredSIP, 
              mainResult: isFinite(result.corpusRequired) ? result.corpusRequired : 0 
            }} 
          />
          <button 
            onClick={() => setIsShareOpen(true)}
            className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Controls */}
        <div className="space-y-6 w-full">
          <SliderWithInput
            label="Current Age"
            value={currentAge}
            min={18}
            max={retirementAge - 1}
            step={1}
            onChange={setCurrentAge}
            formatDisplay={(v) => `${v}`}
          />
          <SliderWithInput
            label="Retire Age"
            value={retirementAge}
            min={currentAge + 1}
            max={80}
            step={1}
            onChange={setRetirementAge}
            formatDisplay={(v) => `${v}`}
          />

          <SliderWithInput
            label="Monthly Expense"
            value={monthlyExpense}
            min={10000}
            max={500000}
            step={5000}
            onChange={setMonthlyExpense}
            formatDisplay={(v) => formatCurrency(v)}
          />

          <SliderWithInput
            label="Inflation (%)"
            value={inflation}
            min={1}
            max={15}
            step={0.5}
            onChange={setInflation}
            formatDisplay={(v) => `${v}%`}
          />

          <SliderWithInput
            label="Pre-Retire Return"
            value={returnPre}
            min={1}
            max={30}
            step={0.5}
            onChange={setReturnPre}
            formatDisplay={(v) => `${v}%`}
          />
          <SliderWithInput
            label="Post-Retire Return"
            value={returnPost}
            min={1}
            max={20}
            step={0.5}
            onChange={setReturnPost}
            formatDisplay={(v) => `${v}%`}
          />

          <SliderWithInput
            label="Current Monthly SIP"
            value={currentSIP}
            min={0}
            max={200000}
            step={1000}
            onChange={setCurrentSIP}
            formatDisplay={(v) => formatCurrency(v)}
          />

          <SliderWithInput
            label="Existing Net Worth"
            value={existingNetWorth}
            min={0}
            max={100000000}
            step={10000}
            onChange={setExistingNetWorth}
            formatDisplay={(v) => formatCurrency(v)}
            footerLabel="Total value of savings, investments, and assets you already have today"
          />
        </div>

        {/* Results Card */}
        <div className="glass-card p-8 space-y-8 flex flex-col w-full h-full">
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Corpus Required</p>
            <p className="text-4xl font-bold text-white">{formatCurrency(safeValue(result.corpusRequired))}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Future Monthly Exp.</p>
              <p className="text-lg font-bold text-white">{formatCurrency(safeValue(result.futureMonthlyExpense))}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Required Monthly SIP</p>
              {futureValueOfExistingNetWorth >= result.corpusRequired ? (
                <p className="text-lg font-bold text-emerald-400">₹0</p>
              ) : (
                <p className="text-lg font-bold text-emerald-400">{formatCurrency(safeValue(requiredSIP))}</p>
              )}
            </div>
          </div>

          {existingNetWorth > 0 && (
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Your Net Worth Grows To</p>
                <p className="text-lg font-bold text-emerald-400">{formatCurrency(safeValue(futureValueOfExistingNetWorth))}</p>
                <p className="text-[10px] text-zinc-500">What your existing {formatCurrency(existingNetWorth)} becomes by retirement at {returnPre}% p.a.</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Corpus Still Needed</p>
                <p className="text-lg font-bold text-emerald-400">{formatCurrency(safeValue(remainingCorpusNeeded))}</p>
                <p className="text-[10px] text-zinc-500">After your existing net worth, this is what your SIP needs to build</p>
              </div>
            </div>
          )}

          {futureValueOfExistingNetWorth >= result.corpusRequired && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-sm text-emerald-400 leading-relaxed">
                Your existing net worth of {formatCurrency(existingNetWorth)} is on track to cover your full retirement corpus at {returnPre}% returns. No additional monthly investment is needed.
              </p>
            </div>
          )}
          
          <div className="pt-2">
            <InfoBox 
              level={riskLevel}
              message={`Assuming a life expectancy of 85 years, you will spend ${result.yearsInRetirement} years in retirement.`}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accumulation Chart */}
        <div className="glass-card p-6 min-w-0">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Corpus Accumulation</h3>
          <div className="h-[300px] w-full" style={{ minWidth: 0, minHeight: 300 }}>
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accumulationData} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    stroke="#52525b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: '#52525b', fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => formatCompactNumber(val)}
                  />
                  <Tooltip 
                    cursor={false}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend verticalAlign="bottom" height={50} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Line 
                    isAnimationActive={false}
                    type="monotone" 
                    dataKey="totalCorpus" 
                    name={existingNetWorth > 0 ? "Total Corpus" : "SIP Corpus Only"}
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={false}
                  />
                  {existingNetWorth > 0 && (
                    <>
                      <Line 
                        isAnimationActive={false}
                        type="monotone" 
                        dataKey="sipCorpus" 
                        name="SIP Corpus Only"
                        stroke="#a1a1aa" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                      <Line 
                        isAnimationActive={false}
                        type="monotone" 
                        dataKey="netWorthGrowth" 
                        name="Existing NW Growth"
                        stroke="#22d3ee" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="glass-card p-6 min-w-0">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Corpus Comparison</h3>
          <div className="h-[300px] w-full relative" style={{ minWidth: 0, minHeight: 300 }}>
            {chartReady && (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonData}
                    margin={{ top: 30, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={false}
                    />
                    <YAxis 
                      stroke="#52525b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => formatCompactNumber(val)}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ fill: 'transparent' }}
                      formatter={(value: number, name: string) => [formatCurrency(value), name]}
                    />
                    <Bar 
                      isAnimationActive={false}
                      dataKey="value" 
                      radius={[4, 4, 0, 0]} 
                      barSize={60}
                      shape={<CustomBar />}
                    >
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList 
                        dataKey="value" 
                        position="top" 
                        formatter={(val: number) => formatIndianShort(val).replace('₹', '')}
                        fill="#a1a1aa"
                        fontSize={10}
                        offset={8}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Absolutely Positioned Labels Row */}
                <div className="absolute left-0 w-full pointer-events-none" style={{ bottom: '10px', paddingTop: '8px' }}>
                  {barPositions.map((pos, idx) => (
                    <div 
                      key={idx} 
                      className="absolute flex flex-col items-center min-w-[100px]"
                      style={{ 
                        left: pos.x + pos.width / 2, 
                        transform: 'translateX(-50%)',
                        top: '8px'
                      }}
                    >
                      <span className="text-[10px] text-zinc-500 text-center leading-tight whitespace-nowrap">
                        {pos.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 mt-4 text-center">
            Assumes {returnPre}% annual returns over {result.yearsToRetirement} years.
          </p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-emerald-500">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-bold">Important Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Years to Retirement</p>
            <p className="text-xl font-bold text-white">{result.yearsToRetirement} Years</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Years in Retirement</p>
            <p className="text-xl font-bold text-white">{result.yearsInRetirement} Years</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Months to Sustain</p>
            <p className="text-xl font-bold text-white">{result.yearsInRetirement * 12} Months</p>
          </div>
        </div>
      </div>

      <AIInsightSection 
        title="Retirement Vision"
        description={`You need a corpus of ${formatCurrency(safeValue(result.corpusRequired))} to sustain your lifestyle for ${result.yearsInRetirement} years in retirement.`}
        mainValue={safeValue(result.corpusRequired)}
        mainLabel="Target Corpus"
        secondaryValues={[
          { label: 'Monthly SIP', value: safeValue(requiredSIP) },
          { label: 'Future Expense', value: safeValue(result.futureMonthlyExpense) },
          { label: 'Years to Retire', value: result.yearsToRetirement },
          { label: 'Retire Age', value: retirementAge },
          { label: 'Inflation (%)', value: inflation },
          { label: 'Pre-Retire Return (%)', value: returnPre },
          { label: 'Post-Retire Return (%)', value: returnPost },
          { label: 'Existing NW', value: existingNetWorth }
        ]}
        category="grow"
        inputs={aiData}
        onInsightGenerated={setAiInsight}
        customPrompt={(() => {
          const sipCorpusStr = formatIndianRupees(aiData.projectedCorpus);
          const netWorthAtRetirementStr = formatIndianRupees(aiData.futureValueOfExistingNetWorth);
          const totalStr = formatIndianRupees(aiData.totalAtRetirement);
          const shortfallStr = formatIndianRupees(Math.abs(aiData.shortfall));
          const corpusRequiredStr = formatIndianRupees(aiData.corpusRequired);

          let bulletInstructions = "Bullet 1 must state the corpusInTodaysMoney and compare it to the nominal corpusRequired to show the impact of inflation over the accumulation years. Bullet 2 must state the monthlyWithdrawalNominal and contrast it with the monthlyWithdrawalReal (today's expense) to show how much more money is needed just to maintain the same lifestyle. ";
          
          if (aiData.shortfall > 0) {
            bulletInstructions += `Bullet 3 must use this exact sentence: "Your SIP corpus of ${sipCorpusStr} combined with your existing net worth of ${netWorthAtRetirementStr} totals ${totalStr}, leaving a gap of ${shortfallStr} against the ${corpusRequiredStr} you require." `;
          } else {
            bulletInstructions += `Bullet 3 must use this exact sentence: "Your SIP corpus of ${sipCorpusStr} combined with your existing net worth of ${netWorthAtRetirementStr} already covers your required corpus of ${corpusRequiredStr}." `;
          }
          
          bulletInstructions += `The analysis must explicitly mention the assumptions used: ${aiData.inflation}% inflation, ${aiData.returnPre}% pre-retirement return, and ${aiData.returnPost}% post-retirement return. `;
          
          if (existingNetWorth > 0) {
            bulletInstructions = `If existingNetWorth is above 0, Bullet 1 must state netWorthCoversPercent — what percentage of the total retirement corpus the existing net worth already covers after growing at the expected return rate. Plain language: Your existing ${formatCurrency(existingNetWorth)} grows to ${formatCurrency(futureValueOfExistingNetWorth)} by retirement — that covers ${aiData.netWorthCoversPercent}% of the ${formatCurrency(result.corpusRequired)} you need. ` + bulletInstructions;
          }
          
          return GLOBAL_AI_INSTRUCTION + "\n\nData:\n" + JSON.stringify(aiData) + "\n\nBullet instructions:\n" + bulletInstructions;
        })()}
      />

      <InvestmentBrokerSection />

      <ShareVision 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Retirement Vision"
        description={`To retire at ${retirementAge} with ${formatCurrency(monthlyExpense)}/month in today's money.`}
        mainValue={safeValue(result.corpusRequired)}
        mainLabel="Target Corpus"
        secondaryValues={[
          { label: 'Monthly SIP', value: safeValue(requiredSIP) },
          { label: 'Future Expense', value: safeValue(result.futureMonthlyExpense) },
          { label: 'Years to Retire', value: result.yearsToRetirement },
          { label: 'Retire Age', value: retirementAge },
          { label: 'Inflation (%)', value: inflation },
          { label: 'Pre-Retire Return (%)', value: returnPre },
          { label: 'Post-Retire Return (%)', value: returnPost },
          { label: 'Existing NW', value: existingNetWorth }
        ]}
        insight={renderInsight(aiInsight || `To reach your goal, start a SIP of ${formatIndianRupees(safeValue(requiredSIP))} today. Every year you delay increases this requirement by ~15%.`)}
        category="grow"
        inputs={{ 
          currentAge, 
          retirementAge, 
          monthlyExpense, 
          inflation, 
          returnPre, 
          returnPost, 
          requiredSIP,
          corpusRequired: result.corpusRequired
        }}
        onSave={handleSave}
      />
    </div>
  );
}
