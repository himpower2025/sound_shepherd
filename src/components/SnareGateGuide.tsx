import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AudioLines, 
  HelpCircle, 
  Info, 
  CheckCircle2, 
  Sliders, 
  Activity, 
  AlertOctagon,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Award,
  Disc
} from 'lucide-react';

interface GatePreset {
  id: string;
  name: string;
  threshold: number; // dB
  attack: number;    // ms
  hold: number;      // ms
  release: number;   // ms
  range: number;     // dB
  description: string;
}

const GATE_PRESETS: GatePreset[] = [
  {
    id: 'default',
    name: 'Starting Snare Gate',
    threshold: -22,
    attack: 2,
    hold: 80,
    release: 180,
    range: -15,
    description: 'A solid, safe starting point for live snare drums. Balances natural sustain while attenuating low-level stage bleed.'
  },
  {
    id: 'gospel',
    name: 'Gospel / Live Worship',
    threshold: -32,
    attack: 4,
    hold: 110,
    release: 240,
    range: -10,
    description: 'Designed for drummers playing delicate ghost notes. Features a lower threshold, slower attack, and longer release to keep subtle articulations from getting cut.'
  },
  {
    id: 'rock',
    name: 'Rock / Aggressive Drums',
    threshold: -12,
    attack: 1,
    hold: 50,
    release: 100,
    range: -35,
    description: 'A tighter, aggressive gate setting. Uses a higher threshold and deep attenuation range to deliver a highly defined, clean, and punchy rock snare.'
  },
  {
    id: 'bleed',
    name: 'High Hi-Hat Bleed Fix',
    threshold: -16,
    attack: 2,
    hold: 65,
    release: 130,
    range: -20,
    description: 'Compensates for severe hi-hat spill into the snare mic. Combines a higher threshold, narrow hold/release windows, and a practical -20dB range attenuation.'
  }
];

export const SnareGateGuide: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(-22);
  const [attack, setAttack] = useState<number>(2);
  const [hold, setHold] = useState<number>(80);
  const [release, setRelease] = useState<number>(180);
  const [range, setRange] = useState<number>(-15);

  const [activePreset, setActivePreset] = useState<string>('default');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Apply a preset
  const applyPreset = (preset: GatePreset) => {
    setActivePreset(preset.id);
    setThreshold(preset.threshold);
    setAttack(preset.attack);
    setHold(preset.hold);
    setRelease(preset.release);
    setRange(preset.range);
  };

  // Helper to check if values match preset exactly
  const isCustom = () => {
    const currentPreset = GATE_PRESETS.find(p => p.id === activePreset);
    if (!currentPreset) return true;
    return (
      currentPreset.threshold !== threshold ||
      currentPreset.attack !== attack ||
      currentPreset.hold !== hold ||
      currentPreset.release !== release ||
      currentPreset.range !== range
    );
  };

  // Waveform visualization generator
  // We will draw a series of vertical bars representing a snare drum hit (large transient followed by decay, and some background hi-hat ticks)
  // Let's model 24 bar heights.
  // Each bar has: base signal (the actual sound), gated signal (sound modified by our gate controls).
  const snareWaveform = [
    { type: 'bleed', amp: 10 },    // Ambient bleed (hi-hat)
    { type: 'bleed', amp: 12 },    // Ambient bleed
    { type: 'transient', amp: 95 }, // Snare Hit! (Transient)
    { type: 'transient', amp: 85 }, // Early reflection
    { type: 'decay', amp: 70 },     // Decay
    { type: 'decay', amp: 55 },
    { type: 'decay', amp: 40 },
    { type: 'decay', amp: 30 },
    { type: 'decay', amp: 22 },
    { type: 'decay', amp: 15 },     // Tail
    { type: 'bleed', amp: 8 },      // Gate closed, back to bleed
    { type: 'bleed', amp: 11 },
    { type: 'bleed', amp: 9 },
    { type: 'transient', amp: 92 }, // Snare Hit 2!
    { type: 'transient', amp: 80 },
    { type: 'decay', amp: 65 },
    { type: 'decay', amp: 48 },
    { type: 'decay', amp: 35 },
    { type: 'decay', amp: 24 },
    { type: 'decay', amp: 16 },
    { type: 'bleed', amp: 10 },
    { type: 'bleed', amp: 12 },
    { type: 'bleed', amp: 7 },
    { type: 'bleed', amp: 9 }
  ];

  // Map threshold (-60 to 0) to scale (0 to 100)
  // Threshold value is negative (e.g. -20dB)
  // Let's assume -45dB is where low noise bleed sits, and -15dB is where the snare peak sits.
  // Map value X between -60 and 0 to height 0 to 100.
  const thresholdHeight = ((threshold + 60) / 60) * 85;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Preset Selectors & Knobs (Col span 5) */}
      <div className="lg:col-span-5 grid gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AudioLines className="text-pink-600 shrink-0" size={20} />
              <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-800">
                Snare Gate Settings
              </h3>
            </div>
            <span className="bg-pink-50 text-pink-700 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full">
              Live Drum Gating
            </span>
          </div>

          <p className="text-xs text-slate-500 font-bold leading-relaxed mb-6">
            A Noise Gate attenuates stage spill (guitar amps, hi-hat bleed) entering your snare microphone when the drum isn't being played. Set it correctly to keep the snare sounding natural and clean.
          </p>

          {/* Preset Buttons */}
          <div className="space-y-2 mb-6">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Live Conditions & Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              {GATE_PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id && !isCustom();
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`py-3 px-3 rounded-2xl text-left transition-all border ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <p className="text-xs font-black tracking-tight leading-normal font-sans">
                      {preset.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description of current preset */}
          {!isCustom() && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 font-semibold leading-relaxed mb-6">
              {GATE_PRESETS.find(p => p.id === activePreset)?.description}
            </div>
          )}

          {/* Parameters Sliders */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Gate Parameters
              </span>
              {isCustom() && (
                <span className="bg-amber-50 text-amber-700 font-extrabold text-[8px] uppercase px-2 py-0.5 rounded-md">
                  Custom Modded
                </span>
              )}
            </div>

            {/* Threshold Knob/Slider */}
            <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-xs font-black text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Threshold
                </span>
                <span>{threshold} dB</span>
              </div>
              <input
                type="range"
                min="-60"
                max="0"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[8px] text-slate-400 font-black mt-1 uppercase font-mono">
                <span>-60 dB (Very Loose)</span>
                <span>0 dB (Tight/Closed)</span>
              </div>
            </div>

            {/* Range Attenuation Slider */}
            <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-xs font-black text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  Range (Attenuation)
                </span>
                <span>{range} dB</span>
              </div>
              <input
                type="range"
                min="-40"
                max="0"
                value={range}
                onChange={(e) => setRange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
              />
              <div className="flex justify-between text-[8px] text-slate-400 font-black mt-1 uppercase font-mono">
                <span>-40 dB (Mute Bleed)</span>
                <span>0 dB (No Gating)</span>
              </div>
            </div>

            {/* Attack, Hold, Release in a grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Attack */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                <p className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1">Attack</p>
                <p className="text-sm font-black text-slate-700">{attack} ms</p>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={attack}
                  onChange={(e) => setAttack(Number(e.target.value))}
                  className="w-full mt-2 accent-slate-700 h-1"
                />
              </div>

              {/* Hold */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                <p className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1">Hold</p>
                <p className="text-sm font-black text-slate-700">{hold} ms</p>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="5"
                  value={hold}
                  onChange={(e) => setHold(Number(e.target.value))}
                  className="w-full mt-2 accent-slate-700 h-1"
                />
              </div>

              {/* Release */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                <p className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1">Release</p>
                <p className="text-sm font-black text-slate-700">{release} ms</p>
                <input
                  type="range"
                  min="30"
                  max="500"
                  step="10"
                  value={release}
                  onChange={(e) => setRelease(Number(e.target.value))}
                  className="w-full mt-2 accent-slate-700 h-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Visualizer & Critical Engineering Guide (Col span 7) */}
      <div className="lg:col-span-7 grid gap-6">
        {/* Interactive Gate Waveform Visualizer */}
        <div className="bg-slate-950 text-white p-6 md:p-8 rounded-[2.5rem] border border-slate-900 shadow-xl overflow-hidden relative">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 font-mono">
                Real-Time Simulation
              </span>
              <h4 className="text-lg font-black uppercase tracking-tight text-white italic mt-1">
                Visual Envelope & Bleed Shaper
              </h4>
            </div>
            
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`py-1.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                isSimulating
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {isSimulating ? 'Stop Waveform' : 'Simulate Wave'}
            </button>
          </div>

          <div className="h-44 bg-slate-900/80 rounded-3xl border border-white/5 relative flex items-end justify-between p-4 px-6 overflow-hidden shadow-inner">
            {/* Threshold Line */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-dashed border-cyan-400 z-10 pointer-events-none transition-all duration-300"
              style={{ bottom: `${thresholdHeight}%` }}
            >
              <span className="absolute right-3 -top-5 bg-cyan-400 text-slate-950 font-black font-mono text-[8px] uppercase px-1.5 py-0.5 rounded shadow-sm">
                Threshold: {threshold}dB
              </span>
            </div>

            {/* Waveform Bars */}
            <div className="w-full h-full flex items-end justify-between gap-1 pt-6 relative">
              {snareWaveform.map((bar, idx) => {
                // Calculate gated amplitude.
                // If bar amp is below threshold, apply the attenuation range (adds range to the bar amp, range is negative)
                // If bar is transient/decay, it is above threshold, stays loud.
                const isBelow = bar.amp < thresholdHeight;
                const finalAmp = isBelow
                  ? Math.max(2, bar.amp * Math.pow(10, range / 20)) // DB power scale attenuation helper
                  : bar.amp;

                const barColor = bar.type === 'transient'
                  ? 'bg-gradient-to-t from-orange-600 to-amber-400'
                  : bar.type === 'decay'
                  ? 'bg-gradient-to-t from-pink-600 to-purple-400'
                  : 'bg-slate-600';

                return (
                  <div key={idx} className="flex-1 flex flex-col justify-end h-full items-center relative">
                    {/* Background faint bar representing original raw signal */}
                    <div 
                      className="absolute w-full bg-slate-800/40 rounded-t-sm"
                      style={{ height: `${bar.amp}%` }}
                    />

                    {/* Gated Signal bar */}
                    <motion.div 
                      animate={isSimulating ? {
                        height: [`${finalAmp}%`, `${finalAmp * 0.95}%`, `${finalAmp}%`]
                      } : { height: `${finalAmp}%` }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.05 }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${barColor}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Legend */}
          <div className="grid grid-cols-3 gap-3 mt-4 text-[9px] font-black uppercase font-mono tracking-wider text-center text-slate-400">
            <div className="flex items-center justify-center gap-1.5 bg-white/5 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded bg-amber-400" />
              Transient Peak (Sustain Open)
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-white/5 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded bg-purple-400" />
              Snare Tail (Decaying Gate)
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-white/5 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded bg-slate-600" />
              Gated Bleed (Suppressed)
            </div>
          </div>
        </div>

        {/* Live Scenario Playbooks */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h4 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-blue-600 rounded-full" />
            Live Gating Solutions & Playbooks
          </h4>

          <div className="space-y-4">
            {/* Worship Drums */}
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  Gospel & worship
                </span>
                <h5 className="text-xs font-black text-slate-800">Preserving Gentle Articulations</h5>
              </div>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                Drummers in churches play highly detailed patterns with soft ghost notes. Using a harsh gate cuts these off completely, making the snare feel clinical. Maintain a low threshold (-30dB), soft attack (3-5ms), and generous release (200-250ms).
              </p>
            </div>

            {/* Hi hat bleed */}
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-rose-50 text-rose-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  Hi-hat spill
                </span>
                <h5 className="text-xs font-black text-slate-800">Combatting Heavy Hi-Hat Bleed</h5>
              </div>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                If the hi-hat is opening the snare gate: raise the gate threshold slightly and ensure the snare mic is positioned so its rear rejection zone points directly at the hi-hat. You can also apply an EQ sidechain high-cut before the gate signal input.
              </p>
            </div>

            {/* Over-gating */}
            <div className="p-4 rounded-3xl bg-amber-50/40 border border-amber-100">
              <div className="flex items-center gap-2 mb-1.5 text-amber-800">
                <AlertOctagon size={14} className="text-amber-600 shrink-0" />
                <h5 className="text-xs font-black uppercase tracking-tight">Warning: Avoid Over-Gating</h5>
              </div>
              <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                Over-gating makes the snare drum sound extremely unnatural, chopped, and lifeless. If your snare sustain cuts out immediately like a click, increase your hold and release settings, or dial back the attenuation range to -12dB instead of complete muting.
              </p>
            </div>
          </div>

          {/* Golden Rule */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-900 text-slate-100 flex items-center gap-3">
            <Award className="text-cyan-400 shrink-0" size={20} />
            <div className="text-[10px] font-black uppercase tracking-wide leading-tight">
              <span className="text-cyan-400">Golden Rule:</span> Always adjust your noise gate settings in the full band mix, never while listening to the snare drum on solo!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
