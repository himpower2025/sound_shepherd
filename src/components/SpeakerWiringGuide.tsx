import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  HelpCircle, 
  Info, 
  ArrowRight, 
  Sliders, 
  Volume2, 
  AlertTriangle,
  Flame,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Torus
} from 'lucide-react';

interface WiringMode {
  id: 'parallel' | 'series' | 'series-parallel';
  title: string;
  titleKo: string;
  description: string;
  formula: string;
  formulaExplanation: string;
  advantages: string[];
  disadvantages: string[];
  ampSafety: string;
  efficiency: 'High' | 'Low' | 'Balanced';
  proTips: string;
}

const WIRING_MODES: WiringMode[] = [
  {
    id: 'parallel',
    title: 'Parallel Connection',
    titleKo: '병렬 연결',
    description: 'All speaker positive (+) terminals are wired together to the amplifier positive, and all negative (-) terminals are wired together to the amplifier negative.',
    formula: '1 / Rt = 1 / R1 + 1 / R2 + 1 / R3...',
    formulaExplanation: 'For identical speakers: Rt = R / N (where R is impedance of one speaker, N is the number of speakers)',
    advantages: [
      'Maximum power output (Amplifier delivers more wattage as impedance drops)',
      'If one speaker fails, other speakers in the chain keep working',
      'The standard method for professional touring PA systems and modern stage monitors'
    ],
    disadvantages: [
      'Total impedance decreases, which can overheat the amplifier',
      'Requires low-impedance high-current stable amplifiers (e.g. 2Ω or 4Ω stable)'
    ],
    ampSafety: 'Caution: Ensure your amplifier is stable at the final calculated impedance (often 2Ω or 4Ω). Running below safety limits triggers automatic protection or thermal shutdown.',
    efficiency: 'High',
    proTips: 'Always double-check the amplifier’s minimum impedance specification before daisy-chaining multiple stage monitors in parallel. Most standard amps are safe down to 4Ω, but only high-end touring models are stable at 2Ω.'
  },
  {
    id: 'series',
    title: 'Series Connection',
    titleKo: '직렬 연결',
    description: 'Speakers are wired daisy-chained in a loop. The positive of the amp connects to the positive of speaker 1, the negative of speaker 1 connects to the positive of speaker 2, and so on, until the last speaker negative returns to the amp negative.',
    formula: 'Rt = R1 + R2 + R3...',
    formulaExplanation: 'For identical speakers: Rt = R × N (where R is impedance of one speaker, N is the number of speakers)',
    advantages: [
      'Extremely safe for amplifiers (increases total impedance, reducing load and heat)',
      'Ideal for vintage amplifiers or low-wattage systems that cannot handle low-impedance loads'
    ],
    disadvantages: [
      'If a single speaker or cable in the series chain breaks, the entire sound system goes silent',
      'Severe power reduction (Amplifiers deliver significantly less power at high impedances)'
    ],
    ampSafety: 'Extremely Safe: Virtually zero risk of overloading or overheating the amplifier, but the overall volume capability will be drastically reduced.',
    efficiency: 'Low',
    proTips: 'Avoid wiring more than 2 speakers in series. High impedance (like 16Ω or 32Ω) causes the sound to be very quiet. In modern setups, series wiring is rarely used alone except inside instrument speaker cabinets.'
  },
  {
    id: 'series-parallel',
    title: 'Series-Parallel Connection',
    titleKo: '직-병렬 연결',
    description: 'Combines both methods. Speakers are grouped into pairs or series chains, and these groups are then wired in parallel to the amplifier to maintain a balanced impedance load.',
    formula: 'Rt = (R_series1 × R_series2) / (R_series1 + R_series2)',
    formulaExplanation: 'Example: Four 8Ω speakers. Two 8Ω pairs wired in series (16Ω each) are connected in parallel to yield a total system load of exactly 8Ω.',
    advantages: [
      'Maintains perfect impedance balance (e.g., four 8Ω speakers combine to form a safe 8Ω load)',
      'Multiplies overall power handling capacity without stressing the amplifier',
      'Excellent for multi-driver guitar cabinets (4x12) and commercial line arrays'
    ],
    disadvantages: [
      'Complex wiring paths can easily lead to wiring phase errors (cancelling out bass)',
      'Requires an even number of identical speakers (usually 4, 8, or 16)'
    ],
    ampSafety: 'Highly Balanced: Keeps impedance in the ideal "sweet spot" (usually 4Ω or 8Ω) where amplifiers operate at maximum efficiency with safe temperatures.',
    efficiency: 'Balanced',
    proTips: 'If you wire a 4x12 cabinet or a line array using series-parallel, ensure every single driver is identical in impedance and wattage. Mixed speakers will receive unequal power distribution, causing distortion or failure.'
  }
];

export const SpeakerWiringGuide: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'parallel' | 'series' | 'series-parallel'>('parallel');
  const [speakerImpedance, setSpeakerImpedance] = useState<4 | 8 | 16>(8);
  const [speakerCount, setSpeakerCount] = useState<2 | 4 | 8>(4);

  const modeData = WIRING_MODES.find(m => m.id === selectedMode)!;

  // Calculate total impedance
  const calculateTotalImpedance = (): number => {
    if (selectedMode === 'parallel') {
      return speakerImpedance / speakerCount;
    } else if (selectedMode === 'series') {
      return speakerImpedance * speakerCount;
    } else {
      // Series-Parallel (Only supports 4 or 8 speakers for balanced layouts)
      // For 4 speakers: 2 pairs of series (2*R) in parallel -> (2*R)/2 = R
      // For 8 speakers: 4 pairs of series (2*R) in parallel -> (2*R)/4 = R/2
      // For 2 speakers: falls back to simple parallel or series (let's default to R for 2 speakers in series-parallel)
      if (speakerCount === 2) {
        return speakerImpedance; // Treat as 1 series pair
      } else if (speakerCount === 4) {
        return speakerImpedance; // (R + R) || (R + R) = 2R || 2R = R
      } else {
        return speakerImpedance / 2; // Four pairs of 2R in parallel = 2R / 4 = R/2
      }
    }
  };

  const totalImpedance = calculateTotalImpedance();

  // Dynamic status evaluation
  const getSafetyStatus = (imp: number) => {
    if (imp < 2) return { label: 'CRITICAL', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', desc: 'Too low! Most amplifiers will overheat, enter protection mode, or suffer severe damage.' };
    if (imp === 2) return { label: 'STABLE (2Ω-RATED ONLY)', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', desc: 'Acceptable only for high-end professional power amplifiers rated for 2-ohm stable loads.' };
    if (imp >= 4 && imp <= 8) return { label: 'IDEAL SWEET SPOT', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', desc: 'Perfect matching! Standard amplifiers run highly efficient, produce high power, and stay cool.' };
    return { label: 'SAFE BUT REDUCED POWER', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', desc: 'Safe for any amplifier, but power output is heavily limited. Sound will be quiet.' };
  };

  const safety = getSafetyStatus(totalImpedance);

  // Render clean SVG wiring diagrams dynamically
  const renderWiringDiagram = () => {
    // We render an amplifier block on top/left, and speaker blocks below.
    const spkCount = speakerCount;
    const isSP = selectedMode === 'series-parallel';

    return (
      <svg viewBox="0 0 600 320" className="w-full h-full text-slate-300 font-mono">
        {/* Background Grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.15" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" rx="16" />

        {/* --- AMPLIFIER BLOCK --- */}
        <g transform="translate(40, 110)">
          <rect x="0" y="0" width="120" height="100" rx="12" fill="#1e293b" stroke="#475569" strokeWidth="2" className="shadow-lg" />
          <text x="60" y="30" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold" className="uppercase tracking-widest">AMPLIFIER</text>
          
          {/* Terminals */}
          {/* Positive + */}
          <circle cx="35" cy="65" r="10" fill="#ef4444" />
          <text x="35" y="69" fill="#ffffff" fontSize="12" textAnchor="middle" fontWeight="black">+</text>
          {/* Negative - */}
          <circle cx="85" cy="65" r="10" fill="#000000" stroke="#475569" strokeWidth="1" />
          <text x="85" y="69" fill="#ffffff" fontSize="12" textAnchor="middle" fontWeight="black">-</text>
          
          <text x="60" y="90" fill="#06b6d4" fontSize="9" textAnchor="middle" className="font-bold">OUT: {totalImpedance.toFixed(1)}Ω LOAD</text>
        </g>

        {/* --- SPEAKER BLOCKS --- */}
        {/* Render 2, 4, or 8 speaker symbols */}
        {Array.from({ length: spkCount }).map((_, idx) => {
          // Calculate columns. For 2 speakers: side by side. For 4: 2x2. For 8: 4x2 grid or single row.
          // Let's place speakers horizontally in a row, centered on the right
          const startX = 220;
          const gapX = spkCount === 2 ? 140 : spkCount === 4 ? 80 : 42;
          const x = startX + idx * gapX;
          const y = 140;
          const spkWidth = spkCount === 8 ? 32 : 55;
          const spkHeight = spkCount === 8 ? 50 : 80;

          return (
            <g key={idx} transform={`translate(${x}, ${y})`}>
              {/* Speaker Enclosure */}
              <rect x="0" y="0" width={spkWidth} height={spkHeight} rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              {/* Speaker cones (small visual details) */}
              <circle cx={spkWidth/2} cy={spkHeight*0.3} r={spkWidth * 0.18} fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <circle cx={spkWidth/2} cy={spkHeight*0.7} r={spkWidth * 0.22} fill="#1e293b" stroke="#475569" strokeWidth="1" />
              {/* Terminal dots */}
              <circle cx={spkWidth*0.25} cy={spkHeight - 8} r="4" fill="#ef4444" /> {/* Positive */}
              <circle cx={spkWidth*0.75} cy={spkHeight - 8} r="4" fill="#000000" /> {/* Negative */}
              
              {/* Label */}
              <text x={spkWidth/2} y={-10} fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="black">SP{idx+1}</text>
              <text x={spkWidth/2} y={spkHeight/2 + 3} fill="#e2e8f0" fontSize="9" textAnchor="middle" fontWeight="black">{speakerImpedance}Ω</text>
            </g>
          );
        })}

        {/* --- DYNAMIC WIRING PATHS --- */}
        {/* PARALLEL WIRING PATHS */}
        {selectedMode === 'parallel' && (
          <g opacity="0.85">
            {/* Positive connections (Amp + to all Speaker +) */}
            {/* Draw a bus line across, then drop down to speaker + */}
            <path d={`M 75 175 L 75 250 L 220 250`} fill="none" stroke="#ef4444" strokeWidth="2" />
            {Array.from({ length: spkCount }).map((_, idx) => {
              const startX = 220;
              const gapX = spkCount === 2 ? 140 : spkCount === 4 ? 80 : 42;
              const x = startX + idx * gapX;
              const spkWidth = spkCount === 8 ? 32 : 55;
              const spkHeight = spkCount === 8 ? 50 : 80;
              const targetX = x + spkWidth * 0.25;
              const targetY = yPostPoint(spkHeight);
              return (
                <path 
                  key={`pos-${idx}`} 
                  d={`M ${targetX} ${targetY} L ${targetX} 250`} 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="2" 
                />
              );
            })}

            {/* Negative connections (Amp - to all Speaker -) */}
            <path d={`M 125 175 L 125 270 L 220 270`} fill="none" stroke="#000000" strokeWidth="2" />
            {Array.from({ length: spkCount }).map((_, idx) => {
              const startX = 220;
              const gapX = spkCount === 2 ? 140 : spkCount === 4 ? 80 : 42;
              const x = startX + idx * gapX;
              const spkWidth = spkCount === 8 ? 32 : 55;
              const spkHeight = spkCount === 8 ? 50 : 80;
              const targetX = x + spkWidth * 0.75;
              const targetY = yPostPoint(spkHeight);
              return (
                <path 
                  key={`neg-${idx}`} 
                  d={`M ${targetX} ${targetY} L ${targetX} 270`} 
                  fill="none" 
                  stroke="#000000" 
                  strokeWidth="2" 
                />
              );
            })}
          </g>
        )}

        {/* SERIES WIRING PATHS */}
        {selectedMode === 'series' && (
          <g opacity="0.85">
            {/* Positive connection to first speaker + */}
            {(() => {
              const spkWidth = spkCount === 8 ? 32 : 55;
              const spkHeight = spkCount === 8 ? 50 : 80;
              const firstSpkPlusX = 220 + spkWidth * 0.25;
              const firstSpkPlusY = yPostPoint(spkHeight);
              return (
                <path d={`M 75 175 L 75 240 L ${firstSpkPlusX} 240 L ${firstSpkPlusX} ${firstSpkPlusY}`} fill="none" stroke="#ef4444" strokeWidth="2" />
              );
            })()}

            {/* Daisy chain between speakers: Speaker N negative to Speaker N+1 positive */}
            {Array.from({ length: spkCount - 1 }).map((_, idx) => {
              const startX = 220;
              const gapX = spkCount === 2 ? 140 : spkCount === 4 ? 80 : 42;
              const spkWidth = spkCount === 8 ? 32 : 55;
              const spkHeight = spkCount === 8 ? 50 : 80;
              
              const currentNegX = startX + idx * gapX + spkWidth * 0.75;
              const currentNegY = yPostPoint(spkHeight);
              const nextPosX = startX + (idx + 1) * gapX + spkWidth * 0.25;
              const nextPosY = yPostPoint(spkHeight);

              return (
                <path 
                  key={`chain-${idx}`}
                  d={`M ${currentNegX} ${currentNegY} L ${currentNegX} ${currentNegY + 15} L ${nextPosX} ${nextPosY + 15} L ${nextPosX} ${nextPosY}`}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
              );
            })}

            {/* Return line from last speaker negative to Amp - */}
            {(() => {
              const startX = 220;
              const gapX = spkCount === 2 ? 140 : spkCount === 4 ? 80 : 42;
              const spkWidth = spkCount === 8 ? 32 : 55;
              const spkHeight = spkCount === 8 ? 50 : 80;
              const lastSpkNegX = startX + (spkCount - 1) * gapX + spkWidth * 0.75;
              const lastSpkNegY = yPostPoint(spkHeight);
              return (
                <path d={`M ${lastSpkNegX} ${lastSpkNegY} L ${lastSpkNegX} 280 L 125 280 L 125 175`} fill="none" stroke="#000000" strokeWidth="2" />
              );
            })()}
          </g>
        )}

        {/* SERIES-PARALLEL WIRING PATHS */}
        {selectedMode === 'series-parallel' && (
          <g opacity="0.85">
            {/* For series-parallel, we connect speakers in pairs (series), then put those pairs in parallel */}
            {(() => {
              const spkWidth = spkCount === 8 ? 32 : 55;
              const spkHeight = spkCount === 8 ? 50 : 80;
              const gapX = spkCount === 2 ? 140 : spkCount === 4 ? 80 : 42;

              return (
                <>
                  {/* Positive Parallel Rails to all Series Pair Inputs (SP1, SP3, SP5, SP7) */}
                  <path d="M 75 175 L 75 230 L 220 230" fill="none" stroke="#ef4444" strokeWidth="2" />
                  {Array.from({ length: Math.ceil(spkCount / 2) }).map((_, idx) => {
                    const pairStartIndex = idx * 2;
                    const posX = 220 + pairStartIndex * gapX + spkWidth * 0.25;
                    const posY = yPostPoint(spkHeight);
                    return (
                      <path 
                        key={`sp-pos-${idx}`}
                        d={`M ${posX} ${posY} L ${posX} 230`}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                      />
                    );
                  })}

                  {/* Series Connections within each pair: (SP1- to SP2+), (SP3- to SP4+), etc. */}
                  {Array.from({ length: Math.floor(spkCount / 2) }).map((_, idx) => {
                    const firstIdx = idx * 2;
                    const secondIdx = idx * 2 + 1;
                    const negX = 220 + firstIdx * gapX + spkWidth * 0.75;
                    const posX = 220 + secondIdx * gapX + spkWidth * 0.25;
                    const posY = yPostPoint(spkHeight);
                    return (
                      <path 
                        key={`sp-chain-${idx}`}
                        d={`M ${negX} ${posY} L ${negX} ${posY + 15} L ${posX} ${posY + 15} L ${posX} ${posY}`}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    );
                  })}

                  {/* Negative Parallel Rails from all Series Pair Outputs (SP2-, SP4-, SP6-, SP8-) */}
                  <path d="M 125 175 L 125 285 L 220 285" fill="none" stroke="#000000" strokeWidth="2" />
                  {Array.from({ length: Math.floor(spkCount / 2) }).map((_, idx) => {
                    const secondIdx = idx * 2 + 1;
                    const negX = 220 + secondIdx * gapX + spkWidth * 0.75;
                    const posY = yPostPoint(spkHeight);
                    return (
                      <path 
                        key={`sp-neg-${idx}`}
                        d={`M ${negX} ${posY} L ${negX} 285`}
                        fill="none"
                        stroke="#000000"
                        strokeWidth="2"
                      />
                    );
                  })}
                </>
              );
            })()}
          </g>
        )}
      </svg>
    );
  };

  // Helper to find the Y coordinate of the speaker terminals
  const yPostPoint = (h: number) => {
    return 140 + h - 8;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Wiring Mode Selectors & Settings (Col span 5) */}
      <div className="lg:col-span-5 grid gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Zap className="text-amber-500 shrink-0 animate-pulse" size={20} />
              <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-800">
                Speaker Wiring Modes
              </h3>
            </div>
            <span className="bg-amber-50 text-amber-700 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full">
              Amp & PA Basics
            </span>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-3 gap-1.5 mb-6 bg-slate-100 p-1 rounded-2xl">
            {(['parallel', 'series', 'series-parallel'] as const).map((mode) => {
              const isActive = selectedMode === mode;
              const lbl = mode === 'parallel' ? 'Parallel' : mode === 'series' ? 'Series' : 'Series-Parallel';
              return (
                <button
                  key={mode}
                  onClick={() => {
                    setSelectedMode(mode);
                    // Adjust speaker counts for series-parallel to ensure a valid pairing layout
                    if (mode === 'series-parallel' && speakerCount === 2) {
                      setSpeakerCount(4);
                    }
                  }}
                  className={`py-2 px-1 rounded-xl text-[9px] font-black tracking-tight uppercase transition-all text-center ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
                  }`}
                >
                  {lbl}
                </button>
              );
            })}
          </div>

          {/* Speaker Setup Control Sliders */}
          <div className="space-y-5 mb-6 bg-slate-50 p-4 rounded-3xl border border-slate-100">
            {/* Speaker Impedance */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Speaker Impedance (R)
                </span>
                <span className="text-xs font-black text-slate-700">{speakerImpedance} Ω</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([4, 8, 16] as const).map((imp) => (
                  <button
                    key={imp}
                    onClick={() => setSpeakerImpedance(imp)}
                    className={`py-2 rounded-xl text-xs font-black transition-all border ${
                      speakerImpedance === imp
                        ? 'bg-white border-blue-500 text-blue-600 shadow-sm'
                        : 'bg-white/40 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {imp} Ω
                  </button>
                ))}
              </div>
            </div>

            {/* Speaker Count */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Number of Speakers (N)
                </span>
                <span className="text-xs font-black text-slate-700">{speakerCount} Speakers</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([2, 4, 8] as const).map((num) => {
                  const isDisabled = selectedMode === 'series-parallel' && num === 2;
                  return (
                    <button
                      key={num}
                      disabled={isDisabled}
                      onClick={() => setSpeakerCount(num)}
                      className={`py-2 rounded-xl text-xs font-black transition-all border ${
                        speakerCount === num
                          ? 'bg-white border-blue-500 text-blue-600 shadow-sm'
                          : isDisabled
                          ? 'opacity-30 bg-slate-200 border-transparent text-slate-400 cursor-not-allowed'
                          : 'bg-white/40 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Real-time Calculation Result */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-inner">
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 font-mono">
              Calculated Load Output
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black italic tracking-tighter text-white">
                {totalImpedance.toFixed(2)}
              </span>
              <span className="text-lg font-black text-slate-400">OHMS (Ω)</span>
            </div>

            {/* Safety Assessment */}
            <div className={`mt-3 p-3 rounded-2xl border text-[10px] font-bold ${safety.color}`}>
              <div className="font-black uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <AlertTriangle size={12} />
                {safety.label}
              </div>
              <p className="leading-relaxed opacity-90">{safety.desc}</p>
            </div>
          </div>
        </div>

        {/* Quick Reference Chart */}
        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Torus className="text-cyan-400 shrink-0" size={18} />
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
              Common Speaker Impedance Specs
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4 font-semibold">
            Using the proper impedance guarantees maximum amplifier wattage transfers cleanly without over-heating or drawing too much current.
          </p>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-black font-mono">
            <div className="bg-blue-600/20 text-blue-400 border border-blue-500/20 py-2 rounded-xl">2Ω</div>
            <div className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 py-2 rounded-xl">4Ω</div>
            <div className="bg-amber-600/20 text-amber-400 border border-amber-500/20 py-2 rounded-xl">8Ω</div>
            <div className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 py-2 rounded-xl">16Ω</div>
          </div>
        </div>
      </div>

      {/* Right Column: Detailed parameters & visual sandbox (Col span 7) */}
      <div className="lg:col-span-7 grid gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Mode Profile: {modeData.title} ({modeData.titleKo})
              </span>
              <h3 className="text-2xl font-black uppercase italic tracking-tight text-slate-800 mt-2">
                {modeData.title}
              </h3>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl py-2 px-3 flex items-center gap-2 self-start md:self-auto">
              <Cpu className="text-blue-500 animate-spin" style={{ animationDuration: '6s' }} size={16} />
              <div>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Power Output</p>
                <p className="text-[11px] font-black text-slate-700 leading-normal mt-0.5">{modeData.efficiency} Mode</p>
              </div>
            </div>
          </div>

          {/* Interactive Dynamic Wiring SVG Sandbox */}
          <div className="bg-slate-950 rounded-3xl p-4 flex flex-col justify-between items-center border border-slate-900 shadow-inner relative text-white mb-6">
            <div className="absolute top-3 left-3 bg-white/5 border border-white/10 rounded-full p-1.5" title="Interactive Wiring Paths">
              <Sliders size={14} className="text-cyan-400" />
            </div>
            <div className="absolute top-3 right-3 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
              Live Cable Path Sandbox
            </div>
            
            <div className="w-full flex items-center justify-center py-2">
              {renderWiringDiagram()}
            </div>

            <div className="w-full bg-white/5 p-3 rounded-2xl border border-white/5 text-center mt-2 font-mono">
              <h5 className="text-[10px] font-black uppercase text-cyan-400 mb-1 tracking-wider">
                Formula: {modeData.formula}
              </h5>
              <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                {modeData.formulaExplanation}
              </p>
            </div>
          </div>

          {/* Details split: Advantages / Disadvantages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Advantages */}
            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
              <h4 className="text-xs font-black uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-emerald-500 rounded-full" />
                Key Advantages
              </h4>
              <div className="space-y-2.5">
                {modeData.advantages.map((adv, aIdx) => (
                  <div key={aIdx} className="flex gap-2 items-start">
                    <span className="text-emerald-500 text-xs mt-0.5">✓</span>
                    <p className="text-xs text-slate-600 font-bold leading-normal">{adv}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disadvantages */}
            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
              <h4 className="text-xs font-black uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-rose-500 rounded-full" />
                Disadvantages & Risks
              </h4>
              <div className="space-y-2.5">
                {modeData.disadvantages.map((dis, dIdx) => (
                  <div key={dIdx} className="flex gap-2 items-start">
                    <span className="text-rose-500 text-xs mt-0.5">✗</span>
                    <p className="text-xs text-slate-600 font-bold leading-normal">{dis}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pro Tips / Application Notes */}
          <div className="p-5 bg-gradient-to-r from-blue-50/20 to-indigo-50/10 rounded-3xl border border-blue-100/40 flex gap-4">
            <div className="bg-blue-600 text-white rounded-2xl p-2 h-9 w-9 flex items-center justify-center shrink-0 shadow-md">
              <Info size={18} />
            </div>
            <div>
              <h5 className="text-xs font-black uppercase text-blue-800 tracking-tight">
                Live Engineer Pro Tips
              </h5>
              <p className="text-xs text-slate-600 font-semibold mt-1 leading-relaxed">
                {modeData.proTips}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
