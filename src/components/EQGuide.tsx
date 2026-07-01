import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Sliders, Music, Radio, Volume2, 
  HelpCircle, ArrowRight, Check, Activity, Info, Zap
} from 'lucide-react';

interface FreqBand {
  id: string;
  name: string;
  range: string;
  desc: string;
  color: string;
  bgColor: string;
  borderColor: string;
  actionName: string;
  actionDesc: string;
  hzMin: number;
  hzMax: number;
  // Center coordinates on our 0-500 SVG coordinate system
  cx: number;
  cy: number;
}

interface EQMove {
  id: string;
  name: string;
  description: string;
  points: { hz: string; gain: string; q: string; purpose: string }[];
  startingHPF: string;
}

interface GenrePreset {
  id: string;
  name: string;
  goal: string;
  hpf: string;
  cut: string;
  boost: string;
  air: string;
  description: string;
  // Curve control points for SVG rendering: [x1, y1, cx, cy, x2, y2] style
  pathD: string;
}

export const EQGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basics' | 'live' | 'genre'>('basics');
  
  // Tab 1 States
  const [selectedBandId, setSelectedBandId] = useState<string>('lowmids');
  
  // Tab 2 States
  const [activeMoveId, setActiveMoveId] = useState<string>('vocal');
  
  // Tab 3 States
  const [activeGenreId, setActiveGenreId] = useState<string>('pop');

  // Frequency bands list
  const freqBands: FreqBand[] = [
    {
      id: 'sub',
      name: 'Sub Bass',
      range: '20 - 60 Hz',
      desc: 'Sub-bass rumble, power, and deep energy.',
      color: 'text-violet-500',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      actionName: 'Low Cut (HPF)',
      actionDesc: 'Usually cut here to remove stage floor rumble and keep the headroom clean.',
      hzMin: 20,
      hzMax: 60,
      cx: 60,
      cy: 140
    },
    {
      id: 'bass',
      name: 'Bass',
      range: '60 - 250 Hz',
      desc: 'Kick drum punch, bass guitar body, and acoustic warmth.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      actionName: 'Boost or Gentle Cut',
      actionDesc: 'Boost for punch; cut if the overall mix is boomy or clashing.',
      hzMin: 60,
      hzMax: 250,
      cx: 130,
      cy: 110
    },
    {
      id: 'lowmids',
      name: 'Low Mids',
      range: '250 - 500 Hz',
      desc: 'The "body" and fullness of vocals and instruments.',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      actionName: 'Cut Mud',
      actionDesc: 'This zone gets crowded easily. Small cuts here (250-400Hz) instantly clear up muddiness.',
      hzMin: 250,
      hzMax: 500,
      cx: 210,
      cy: 160
    },
    {
      id: 'mids',
      name: 'Mids',
      range: '500 Hz - 2 kHz',
      desc: 'Main character and speech articulation of instruments & vocals.',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      actionName: 'Define / Shape',
      actionDesc: 'Boost slightly for vocal clarity; cut around 1kHz to push instruments backward.',
      hzMin: 500,
      hzMax: 2000,
      cx: 290,
      cy: 120
    },
    {
      id: 'presence',
      name: 'Presence',
      range: '2 - 5 kHz',
      desc: 'Clarity, attack, intelligibility, and definition.',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      actionName: 'Add Bite / Polish',
      actionDesc: 'Boost slightly to help lead vocals cut through a dense live mix. Do not overdo to avoid ear fatigue.',
      hzMin: 2000,
      hzMax: 5000,
      cx: 370,
      cy: 80
    },
    {
      id: 'brilliance',
      name: 'Air / Brilliance',
      range: '5 - 20 kHz',
      desc: 'Sparkle, extreme detail, and high-end breathy openness.',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      actionName: 'Add High-end Air',
      actionDesc: 'Apply a gentle High Shelf boost (+1 to +3dB) above 10kHz for dynamic professional shine.',
      hzMin: 5000,
      hzMax: 20000,
      cx: 440,
      cy: 90
    }
  ];

  // Common EQ Moves in Live Mixing
  const liveMoves: EQMove[] = [
    {
      id: 'vocal',
      name: 'Lead Vocals',
      description: 'Primary focus: cut muddy low frequencies and boost the upper presence for pristine lyrical clarity.',
      startingHPF: '80 - 120 Hz',
      points: [
        { hz: '100 Hz', gain: 'HPF (Cut)', q: 'Gentle', purpose: 'Removes pop noises, microphone handling, and stage rumble.' },
        { hz: '300 Hz', gain: 'Cut (-2 to -4 dB)', q: 'Medium', purpose: 'Cleans up chesty muddiness and room reflections.' },
        { hz: '3.5 kHz', gain: 'Boost (+2 to +3 dB)', q: 'Broad', purpose: 'Adds high intelligibility and brings the vocal upfront.' },
        { hz: '10 kHz', gain: 'Boost (+2 dB Shelf)', q: 'Wide', purpose: 'Adds "air" and expensive modern condenser polish.' }
      ]
    },
    {
      id: 'kick',
      name: 'Kick Drum',
      description: 'Balance the deep sub-bass chest thump while cutting cardboard-sounding boxy frequencies.',
      startingHPF: '30 Hz',
      points: [
        { hz: '30 Hz', gain: 'HPF (Cut)', q: 'Steep', purpose: 'Protects main subwoofers from sub-sonic flub and over-excursion.' },
        { hz: '60 Hz', gain: 'Boost (+3 dB)', q: 'Medium', purpose: 'Enhances solid physical punch in the sub-bass.' },
        { hz: '350 Hz', gain: 'Cut (-4 to -6 dB)', q: 'Surgical', purpose: 'Scoops out cardboard, boxy, or cheap sounding frequencies.' },
        { hz: '4 kHz', gain: 'Boost (+2 to +4 dB)', q: 'Narrow', purpose: 'Accentuates the leather beater click to cut through synths.' }
      ]
    },
    {
      id: 'acoustic',
      name: 'Acoustic Guitar',
      description: 'Remove heavy booming resonance while retaining sparkling metallic string definition.',
      startingHPF: '80 - 100 Hz',
      points: [
        { hz: '80 Hz', gain: 'HPF (Cut)', q: 'Gentle', purpose: 'Cleans up body boom and frees up room for kick & bass guitar.' },
        { hz: '400 Hz', gain: 'Cut (-2 to -3 dB)', q: 'Medium', purpose: 'Reduces boxiness, making the guitar sit beautifully.' },
        { hz: '3.2 kHz', gain: 'Boost (+2 dB)', q: 'Broad', purpose: 'Adds string articulation and individual pick attack detail.' },
        { hz: '12 kHz', gain: 'Boost (+1 to +2 dB)', q: 'Shelf', purpose: 'Adds dynamic sparkle and shine to acoustic strums.' }
      ]
    },
    {
      id: 'speech',
      name: 'Speech & Preaching',
      description: 'Tuned specifically for word intelligibility and feedback safety on podium or lapel mics.',
      startingHPF: '120 - 150 Hz',
      points: [
        { hz: '130 Hz', gain: 'HPF (Steep)', q: 'Steep', purpose: 'Aggressive cut to eliminate boominess and room echoes.' },
        { hz: '500 Hz', gain: 'Cut (-2 dB)', q: 'Wide', purpose: 'Soft scoop to make the speaking voice sound less "hollow".' },
        { hz: '2.5 kHz', gain: 'Boost (+3 dB)', q: 'Broad', purpose: 'Maximizes word clarity so congregation hears every syllable.' },
        { hz: '6.5 kHz', gain: 'Cut (-2 dB Surgical)', q: 'Narrow', purpose: 'Dulls painful sibilance ("S" sounds) to protect listeners.' }
      ]
    }
  ];

  // Vocal EQ by Genre
  const genrePresets: GenrePreset[] = [
    {
      id: 'pop',
      name: 'Pop / R&B Vocal',
      goal: 'Clear, Intimate & Upfront',
      hpf: '80 Hz',
      cut: '200 - 300 Hz (Chesty Mud)',
      boost: '2 - 3 kHz (Presence & Clarity)',
      air: '10 - 12 kHz (Silky High Shelf)',
      description: 'Designed for a modern radio feel. The voice is pristine, intimate, sits on top of the synths, and has beautiful breathing room.',
      // High HPF curve, soft scoop in low mid, big bump in presence and air
      pathD: 'M 10 140 C 30 140, 50 140, 80 140 C 110 135, 140 160, 180 160 C 230 160, 270 140, 310 130 C 350 110, 390 70, 430 70 C 470 70, 490 85, 500 90'
    },
    {
      id: 'hiphop',
      name: 'Hip-Hop / Trap Vocal',
      goal: 'Punchy, Aggressive & Cutting',
      hpf: '100 Hz (Leaves room for sub-bass 808s)',
      cut: '300 - 400 Hz (Heavy Scoop)',
      boost: '3 - 5 kHz (Aggression & Edge)',
      air: 'Minimal boost (Keeps it raw/centered)',
      description: 'Tailored to slice through heavy sub-bass lines and busy drum beats. Maximizes mid-range bite and transient speed.',
      // Aggressive low cut, heavy mid-scoop, peak at 4kHz, neutral air
      pathD: 'M 10 140 C 30 140, 70 140, 100 140 C 130 140, 160 175, 200 175 C 250 175, 290 140, 330 120 C 370 100, 400 65, 440 85 C 470 100, 495 135, 500 140'
    },
    {
      id: 'house',
      name: 'House / Dance Vocal',
      goal: 'Bright, Airy & Above the Mix',
      hpf: '100 - 120 Hz (Aggressive low cut)',
      cut: '300 - 500 Hz (Scoop out mids)',
      boost: '1 - 2 kHz (Cut through synths)',
      air: '+3dB High Shelf @ 10 kHz (Extreme Sparkle)',
      description: 'Cuts through massive synth stacks and loud clubs. Very bright with high-end energy that bounces along with the beat.',
      // Extreme low cut, flat mids, massive air boost
      pathD: 'M 10 140 C 40 140, 80 140, 115 140 C 145 140, 180 150, 220 150 C 270 150, 300 120, 340 120 C 380 120, 410 80, 450 55 C 480 35, 495 30, 500 30'
    },
    {
      id: 'lofi',
      name: 'Lo-Fi / Vintage Vocal',
      goal: 'Warm, Retro & Muted',
      hpf: '60 Hz (Keep low warmth)',
      cut: 'Leave low-mids alone (Keeps it cozy)',
      boost: 'None',
      air: 'Low-Pass Filter above 10 - 12 kHz (Warmth)',
      description: 'Creates a warm, cozy "telephone" or tape recorder vibe. High frequencies are completely smoothed out to sound nostalgic.',
      // Gentle slope, cozy low mids, completely rolled off highs
      pathD: 'M 10 140 C 30 140, 60 135, 90 120 C 130 105, 180 115, 220 115 C 270 115, 320 130, 360 145 C 400 160, 430 190, 460 210 C 480 220, 495 220, 500 220'
    }
  ];

  const activeBand = freqBands.find(b => b.id === selectedBandId) || freqBands[2];
  const activeMove = liveMoves.find(m => m.id === activeMoveId) || liveMoves[0];
  const activeGenre = genrePresets.find(g => g.id === activeGenreId) || genrePresets[0];

  return (
    <div id="eq-guide-root" className="space-y-8 animate-fade-in select-none">
      
      {/* 1. Header Banner */}
      <div id="eq-guide-header" className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-pink-500/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/20 text-cyan-300 text-xs font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" /> WHAT IS EQ?
            </span>
            <span className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/20 text-pink-300 text-xs font-black uppercase tracking-wider">
              VOCAL PRESETS
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase leading-none bg-gradient-to-r from-white via-cyan-100 to-pink-200 bg-clip-text text-transparent">
            Audio EQ Master Class
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
            Equalization (EQ) is the single most powerful tool in live audio. Learn how to carve out muddy frequencies, boost clarity, and apply genre-specific vocal presets to create clean, professional live mixes with ease.
          </p>

          {/* Interactive Menu Tabs */}
          <div className="flex flex-wrap sm:flex-nowrap p-1 bg-slate-900/80 rounded-2xl border border-slate-800/80 max-w-lg mt-6 gap-1 sm:gap-0">
            <button
              onClick={() => setActiveTab('basics')}
              className={`flex-1 min-w-[90px] sm:min-w-0 py-2 sm:py-3 px-2 sm:px-4 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === 'basics' 
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sliders size={14} className="shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">1. </span>EQ Controls
              </span>
            </button>

            <button
              onClick={() => setActiveTab('live')}
              className={`flex-1 min-w-[90px] sm:min-w-0 py-2 sm:py-3 px-2 sm:px-4 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === 'live' 
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Radio size={14} className="shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">2. </span>Live Moves
              </span>
            </button>

            <button
              onClick={() => setActiveTab('genre')}
              className={`flex-1 min-w-[90px] sm:min-w-0 py-2 sm:py-3 px-2 sm:px-4 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === 'genre' 
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Music size={14} className="shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">3. </span>Vocal Presets
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Tab Sections */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: WHAT IS EQ & FREQUENCY MAP */}
        {activeTab === 'basics' && (
          <motion.div
            key="basics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left: Graphic Frequency Map */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 rounded-full bg-cyan-500" />
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">
                    Interactive Frequency Spectrum
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tap a band to see its characteristics</span>
                </div>
              </div>

              {/* Dynamic Simulated EQ Visualizer Screen */}
              <div className="relative w-full h-56 bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden shadow-inner flex flex-col justify-between p-4">
                {/* Horizontal reference grids */}
                <div className="absolute inset-0 grid grid-rows-4 pointer-events-none opacity-10">
                  <div className="border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-b border-white" />
                </div>
                {/* Vertical reference grids (Logarithmic feel) */}
                <div className="absolute inset-0 flex justify-between pointer-events-none opacity-5">
                  <div className="border-r border-white h-full" />
                  <div className="border-r border-white h-full" />
                  <div className="border-r border-white h-full" />
                  <div className="border-r border-white h-full" />
                  <div className="border-r border-white h-full" />
                </div>

                {/* SVG Curve showing parametric control */}
                <svg viewBox="0 0 500 220" className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Flat default curve line */}
                  <line x1="0" y1="130" x2="500" y2="130" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                  
                  {/* Dynamic Curve path according to selected frequency band */}
                  <motion.path
                    id="eq-interactive-path"
                    d={`M 10 130 Q ${activeBand.cx} ${activeBand.cy} 500 130`}
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="3.5"
                    animate={{ d: `M 10 130 Q ${activeBand.cx} ${activeBand.cy} 500 130` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                  />

                  {/* Gradient Glow underneath the active path */}
                  <motion.path
                    d={`M 10 130 Q ${activeBand.cx} ${activeBand.cy} 500 130 L 500 220 L 10 220 Z`}
                    fill="url(#curveGlow)"
                    opacity="0.1"
                    animate={{ d: `M 10 130 Q ${activeBand.cx} ${activeBand.cy} 500 130 L 500 220 L 10 220 Z` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                  />

                  {/* Highlight active glowing circle node */}
                  <motion.circle
                    cx={activeBand.cx}
                    cy={activeBand.cy}
                    r="8"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="3"
                    className="shadow-lg shadow-sky-500/50"
                    animate={{ cx: activeBand.cx, cy: activeBand.cy }}
                    transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                  />

                  <defs>
                    <linearGradient id="curveGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#000000" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Top Overlay Frequency Numbers */}
                <div className="relative z-10 flex justify-between text-[9px] font-bold text-slate-500 font-mono">
                  <span>20Hz (Sub)</span>
                  <span>250Hz (Bass)</span>
                  <span>1kHz (Mids)</span>
                  <span>5kHz (Presence)</span>
                  <span>20kHz (Air)</span>
                </div>

                {/* Interactive tapping regions for spectrum on top */}
                <div className="absolute inset-0 grid grid-cols-6 z-20">
                  {freqBands.map((band) => (
                    <button
                      key={band.id}
                      onClick={() => setSelectedBandId(band.id)}
                      className="h-full focus:outline-none group relative flex items-end justify-center pb-2"
                    >
                      {/* Interactive hovering line indicator */}
                      <div className={`absolute inset-x-1 bottom-0 h-1 rounded-t-full transition-all ${
                        selectedBandId === band.id ? 'bg-cyan-500 h-2' : 'bg-transparent group-hover:bg-slate-700/50'
                      }`} />
                    </button>
                  ))}
                </div>

                {/* DB Indicators on the left */}
                <div className="absolute top-2 left-2 flex flex-col justify-between h-[90%] text-[8px] font-mono font-bold text-slate-600 pointer-events-none">
                  <span>+12dB</span>
                  <span>0dB</span>
                  <span>-12dB</span>
                </div>

                {/* Bottom Overlay displaying active info briefly */}
                <div className="relative z-10 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span className="font-mono bg-slate-900/60 backdrop-blur-sm border border-slate-800 px-2 py-1 rounded-md">
                    CENTER HZ: <span className="text-white">{(activeBand.hzMin + activeBand.hzMax) / 2} Hz</span>
                  </span>
                  <span className="font-mono bg-slate-900/60 backdrop-blur-sm border border-slate-800 px-2 py-1 rounded-md">
                    SPECTRUM: <span className="text-cyan-400 font-extrabold">{activeBand.name}</span>
                  </span>
                </div>
              </div>

              {/* Horizontal grid list selectors */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {freqBands.map((band) => {
                  const isSelected = band.id === selectedBandId;
                  return (
                    <button
                      key={band.id}
                      onClick={() => setSelectedBandId(band.id)}
                      className={`p-2.5 rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                        isSelected 
                          ? `${band.bgColor} ${band.borderColor} border-slate-300 scale-[1.03] ring-1 ring-offset-1 ring-cyan-500/30` 
                          : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-[10px] font-black uppercase tracking-tight leading-none ${
                        isSelected ? band.color : 'text-slate-700'
                      }`}>
                        {band.name}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold block leading-none mt-1">
                        {band.range}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Technical Explanation Card */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Active Band Detail Explanation */}
              <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest leading-none border ${activeBand.bgColor} ${activeBand.color} ${activeBand.borderColor}`}>
                    {activeBand.range}
                  </span>
                  <span className="text-xs text-slate-400 font-bold font-mono">SELECTED BAND</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                    {activeBand.name} Spectrum
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    {activeBand.desc}
                  </p>
                </div>

                {/* The Golden EQ move for this band */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      RECOMMENDED MOVE:
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800 uppercase">
                    {activeBand.actionName}
                  </h4>
                  <p className="text-xs text-slate-500 leading-normal font-semibold">
                    {activeBand.actionDesc}
                  </p>
                </div>
              </div>

              {/* 3 Core controls explanation (Saves beginner from too much text) */}
              <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-cyan-500" />
                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-800">
                    The 3 Pillars of Parametric EQ
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3 text-left">
                    <div className="w-5 h-5 rounded bg-cyan-100 text-cyan-700 text-xs font-black flex items-center justify-center shrink-0">F</div>
                    <div>
                      <span className="text-xs font-black text-slate-800 uppercase">Frequency (Hz)</span>
                      <p className="text-[11px] text-slate-500 font-semibold leading-normal">Determines <i>where</i> in the sound pitch spectrum (bass to treble) you want to adjust.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-left">
                    <div className="w-5 h-5 rounded bg-cyan-100 text-cyan-700 text-xs font-black flex items-center justify-center shrink-0">G</div>
                    <div>
                      <span className="text-xs font-black text-slate-800 uppercase">Gain (dB)</span>
                      <p className="text-[11px] text-slate-500 font-semibold leading-normal">Controls <i>how much</i> you boost (increase volume) or cut (attenuate volume) that frequency region.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-left">
                    <div className="w-5 h-5 rounded bg-cyan-100 text-cyan-700 text-xs font-black flex items-center justify-center shrink-0">Q</div>
                    <div>
                      <span className="text-xs font-black text-slate-800 uppercase">Q (Bandwidth)</span>
                      <p className="text-[11px] text-slate-500 font-semibold leading-normal">Controls <i>how wide</i> or <i>how surgical/narrow</i> the frequency bell curve is around your chosen center.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: LIVE SOUND EQ GOALS & MOVES */}
        {activeTab === 'live' && (
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left: Interactive Instrument Presets */}
            <div className="lg:col-span-5 space-y-4 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 rounded-full bg-cyan-500" />
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">
                    Target Instrument Presets
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Standard Starting points for live consoles</span>
                </div>
              </div>

              <div className="space-y-2">
                {liveMoves.map((move) => {
                  const isActive = move.id === activeMoveId;
                  return (
                    <button
                      key={move.id}
                      onClick={() => setActiveMoveId(move.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        isActive 
                          ? 'bg-cyan-600 border-cyan-500 shadow-md shadow-cyan-900/20 text-white' 
                          : 'bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <h4 className={`text-sm font-black uppercase ${isActive ? 'text-white' : 'text-slate-800'}`}>
                          {move.name}
                        </h4>
                        <span className={`text-[10px] leading-none ${isActive ? 'text-cyan-100' : 'text-slate-400'} font-bold block mt-1`}>
                          HPF LOW CUT: {move.startingHPF}
                        </span>
                      </div>
                      <ArrowRight size={16} className={`${isActive ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Live Sound Core Rule banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl mt-4">
                <h5 className="text-xs font-black uppercase tracking-tight text-emerald-800 mb-1">
                  SUBTRACTIVE EQ RULE (GOLDEN RULE)
                </h5>
                <p className="text-[11px] text-emerald-600 font-semibold leading-relaxed">
                  Always try to <b>Cut frequencies first</b> to fix problems instead of boosting. Cutting frees up head-room, removes room mud, and protects your PA from entering feedback.
                </p>
              </div>
            </div>

            {/* Right: Dynamic EQ Points List */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LIVE EQ FORMULA</span>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800">
                    {activeMove.name} Setup
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-700 text-xs font-black uppercase tracking-wider font-mono">
                  HPF {activeMove.startingHPF}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {activeMove.description}
              </p>

              {/* Visual Step Cards */}
              <div className="space-y-3">
                {activeMove.points.map((pt, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                  >
                    {/* Index & Freq Block */}
                    <div className="md:col-span-3 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-800 block leading-none font-mono">{pt.hz}</span>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase block mt-1 tracking-wider">FREQUENCY</span>
                      </div>
                    </div>

                    {/* Move Gain setting */}
                    <div className="md:col-span-3">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        pt.gain.includes('Cut') 
                          ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {pt.gain}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold block mt-1.5 uppercase">GAIN VALUE</span>
                    </div>

                    {/* Purpose Description */}
                    <div className="md:col-span-6">
                      <p className="text-xs text-slate-500 font-bold leading-normal">
                        {pt.purpose}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: GENRE VOCAL PRESETS */}
        {activeTab === 'genre' && (
          <motion.div
            key="genre"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Column: Preset cards selection */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 rounded-full bg-cyan-500" />
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">
                    Vocal EQ by Genre
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Dial in the perfect vocal tone for any vibe</span>
                </div>
              </div>

              <div className="space-y-2">
                {genrePresets.map((genre) => {
                  const isActive = genre.id === activeGenreId;
                  return (
                    <button
                      key={genre.id}
                      onClick={() => setActiveGenreId(genre.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isActive 
                          ? 'bg-pink-600 border-pink-500 shadow-md shadow-pink-900/20 text-white' 
                          : 'bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <h4 className={`text-sm font-black uppercase ${isActive ? 'text-white' : 'text-slate-800'}`}>
                          {genre.name}
                        </h4>
                        {isActive && <Check size={14} className="text-white shrink-0" />}
                      </div>
                      <span className={`text-[10px] leading-none ${isActive ? 'text-pink-100' : 'text-slate-400'} font-bold block mt-1.5`}>
                        GOAL: {genre.goal}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Visual EQ Curve preset and point analysis */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-sm space-y-6">
              
              {/* Preset Visual Board Display */}
              <div className="relative w-full h-48 bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden shadow-inner flex flex-col justify-between p-4">
                {/* Simulated Wave Grid lines */}
                <div className="absolute inset-0 grid grid-rows-4 opacity-5 pointer-events-none">
                  <div className="border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-b border-white" />
                </div>
                
                {/* SVG Curve rendering */}
                <svg viewBox="0 0 500 220" className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Baseline reference */}
                  <line x1="0" y1="140" x2="500" y2="140" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                  
                  {/* Interactive simulated preset curve */}
                  <motion.path
                    d={activeGenre.pathD}
                    fill="none"
                    stroke="#db2777"
                    strokeWidth="3.5"
                    animate={{ d: activeGenre.pathD }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                  />

                  {/* Gradient Glow */}
                  <motion.path
                    d={`${activeGenre.pathD} L 500 220 L 10 220 Z`}
                    fill="url(#pinkGlow)"
                    opacity="0.1"
                    animate={{ d: `${activeGenre.pathD} L 500 220 L 10 220 Z` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                  />

                  <defs>
                    <linearGradient id="pinkGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#db2777" />
                      <stop offset="100%" stopColor="#000000" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Top Label Display */}
                <div className="relative z-10 flex justify-between text-[8px] font-bold text-slate-500 font-mono">
                  <span>HPF</span>
                  <span>LOW-MIDS</span>
                  <span>MIDS</span>
                  <span>PRESENCE</span>
                  <span>AIR HIGH-SHELF</span>
                </div>

                {/* Bottom Overlay Label */}
                <div className="relative z-10 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span className="font-mono bg-slate-900/60 backdrop-blur-sm border border-slate-800 px-2 py-0.5 rounded-md">
                    GENRE: <span className="text-pink-400 font-black">{activeGenre.name}</span>
                  </span>
                  <span className="text-[10px] text-pink-300 font-extrabold flex items-center gap-1">
                    <Activity size={10} className="animate-pulse" /> SIMULATED ANALOG CURVE
                  </span>
                </div>
              </div>

              {/* Analysis Point Grid List */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-black uppercase text-slate-800 mb-1">
                    Preset breakdown: {activeGenre.name}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {activeGenre.description}
                  </p>
                </div>

                {/* Grid details (Simple list instead of tons of text) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex gap-3 items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-black uppercase block leading-none">LOW CUT (HPF)</span>
                      <span className="text-xs font-black text-slate-800 block mt-1">{activeGenre.hpf}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex gap-3 items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-black uppercase block leading-none">LOW MIDS (MUD CUT)</span>
                      <span className="text-xs font-black text-slate-800 block mt-1">{activeGenre.cut}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex gap-3 items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-black uppercase block leading-none">MIDS / PRESENCE</span>
                      <span className="text-xs font-black text-slate-800 block mt-1">{activeGenre.boost}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex gap-3 items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-black uppercase block leading-none">HIGH END AIR</span>
                      <span className="text-xs font-black text-slate-800 block mt-1">{activeGenre.air}</span>
                    </div>
                  </div>
                </div>

                {/* Important reminder */}
                <div className="p-3.5 bg-amber-50/40 border border-amber-100/70 rounded-2xl text-[11px] text-slate-600 font-bold flex gap-2 items-center">
                  <Info size={14} className="text-amber-500 shrink-0" />
                  <span>Always adjust by ear! These are professional starting guidelines, not absolute rigid laws. Venue acoustics, microphones, and vocalists vary significantly.</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
