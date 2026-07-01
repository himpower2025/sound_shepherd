import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  Radio, 
  Music, 
  Sparkles, 
  HelpCircle, 
  Check, 
  Info, 
  ArrowRight, 
  Play, 
  Square, 
  RefreshCw, 
  ChevronRight,
  SlidersHorizontal,
  Layers,
  Flame,
  Volume2,
  Waves,
  Zap
} from 'lucide-react';

interface EffectParameter {
  name: string;
  min: number;
  max: number;
  defaultValue: number;
  unit: string;
}

interface AudioEffectItem {
  id: number;
  title: string;
  category: 'Time-Based' | 'Modulation' | 'Dynamics' | 'Distortion/Harmonic' | 'Utility';
  description: string;
  bestFor: string;
  parameters: EffectParameter[];
  visualType: string;
}

// 20 Popular Audio Effects matching the image perfectly (All English)
const AUDIO_EFFECTS_DATA: AudioEffectItem[] = [
  {
    id: 1,
    title: 'EQ (Equalizer)',
    category: 'Utility',
    description: 'Balances the frequencies in a sound. Cut unwanted frequencies or boost the ones you want to stand out.',
    bestFor: 'Shaping tone, removing muddiness, making space in a mix',
    visualType: 'eq',
    parameters: [
      { name: 'Low Gain', min: -12, max: 12, defaultValue: 3, unit: 'dB' },
      { name: 'Mid Gain', min: -12, max: 12, defaultValue: -2, unit: 'dB' },
      { name: 'High Gain', min: -12, max: 12, defaultValue: 4, unit: 'dB' }
    ]
  },
  {
    id: 2,
    title: 'Compression',
    category: 'Dynamics',
    description: 'Reduces the dynamic range of a sound. Loud parts get quieter, quiet parts get louder. Glues mix elements together.',
    bestFor: 'Vocals, drums, glueing mix elements together',
    visualType: 'compressor',
    parameters: [
      { name: 'Threshold', min: -60, max: 0, defaultValue: -20, unit: 'dB' },
      { name: 'Ratio', min: 1, max: 20, defaultValue: 4, unit: ':1' },
      { name: 'Attack', min: 1, max: 100, defaultValue: 15, unit: 'ms' },
      { name: 'Release', min: 10, max: 1000, defaultValue: 150, unit: 'ms' }
    ]
  },
  {
    id: 3,
    title: 'Reverb',
    category: 'Time-Based',
    description: 'Simulates the natural reflections of sound in a space. Adds depth, space, and ambience.',
    bestFor: 'Creating space, adding depth to vocals, drums, instruments',
    visualType: 'reverb',
    parameters: [
      { name: 'Room Size', min: 10, max: 100, defaultValue: 60, unit: '%' },
      { name: 'Decay', min: 0.1, max: 10, defaultValue: 2.4, unit: 's' },
      { name: 'Mix', min: 0, max: 100, defaultValue: 30, unit: '%' },
      { name: 'Damp', min: 0, max: 100, defaultValue: 25, unit: '%' }
    ]
  },
  {
    id: 4,
    title: 'Delay',
    category: 'Time-Based',
    description: 'Repeats the sound after a period of time. Echoes that can be subtle or very obvious.',
    bestFor: 'Slapback on vocals, creative echoes, adding rhythm and space',
    visualType: 'delay',
    parameters: [
      { name: 'Delay Time', min: 50, max: 1000, defaultValue: 350, unit: 'ms' },
      { name: 'Feedback', min: 0, max: 95, defaultValue: 40, unit: '%' },
      { name: 'Mix', min: 0, max: 100, defaultValue: 25, unit: '%' },
      { name: 'Filter', min: 200, max: 8000, defaultValue: 3000, unit: 'Hz' }
    ]
  },
  {
    id: 5,
    title: 'Chorus',
    category: 'Modulation',
    description: 'Duplicates the sound and slightly detunes + delays it. Creates a rich, wide, lush sound.',
    bestFor: 'Guitars, synths, pads, vocals (thickening and widening)',
    visualType: 'chorus',
    parameters: [
      { name: 'Rate', min: 0.1, max: 10, defaultValue: 1.2, unit: 'Hz' },
      { name: 'Depth', min: 0, max: 100, defaultValue: 60, unit: '%' },
      { name: 'Mix', min: 0, max: 100, defaultValue: 50, unit: '%' }
    ]
  },
  {
    id: 6,
    title: 'Flanger',
    category: 'Modulation',
    description: 'Similar to chorus but with a shorter delay and feedback. Creates a sweeping, whooshing sound.',
    bestFor: 'Electric guitars, synths, experimental sounds',
    visualType: 'flanger',
    parameters: [
      { name: 'Rate', min: 0.05, max: 5, defaultValue: 0.4, unit: 'Hz' },
      { name: 'Depth', min: 0, max: 100, defaultValue: 75, unit: '%' },
      { name: 'Feedback', min: 0, max: 95, defaultValue: 55, unit: '%' },
      { name: 'Mix', min: 0, max: 100, defaultValue: 50, unit: '%' }
    ]
  },
  {
    id: 7,
    title: 'Phaser',
    category: 'Modulation',
    description: 'Shifts the phase of the signal using filters. Creates a swirling, movement sound.',
    bestFor: 'Synths, guitars, adding movement and texture',
    visualType: 'phaser',
    parameters: [
      { name: 'Rate', min: 0.1, max: 8, defaultValue: 1.5, unit: 'Hz' },
      { name: 'Depth', min: 0, max: 100, defaultValue: 70, unit: '%' },
      { name: 'Feedback', min: 0, max: 95, defaultValue: 45, unit: '%' },
      { name: 'Mix', min: 0, max: 100, defaultValue: 50, unit: '%' }
    ]
  },
  {
    id: 8,
    title: 'Distortion',
    category: 'Distortion/Harmonic',
    description: 'Adds harmonic content by clipping the signal. Makes sounds heavier and more intense.',
    bestFor: 'Guitars, bass, drums, synths, lo-fi effects',
    visualType: 'distortion',
    parameters: [
      { name: 'Drive', min: 0, max: 100, defaultValue: 65, unit: '%' },
      { name: 'Tone', min: 0, max: 100, defaultValue: 50, unit: '%' },
      { name: 'Level', min: 0, max: 100, defaultValue: 80, unit: '%' },
      { name: 'Mix', min: 0, max: 100, defaultValue: 100, unit: '%' }
    ]
  },
  {
    id: 9,
    title: 'Saturation',
    category: 'Distortion/Harmonic',
    description: 'Adds subtle harmonics and warmth without the extreme clipping of distortion.',
    bestFor: 'Vocals, bass, drums, mixing glue, making sounds warmer',
    visualType: 'saturation',
    parameters: [
      { name: 'Drive', min: 0, max: 100, defaultValue: 25, unit: '%' },
      { name: 'Warmth', min: 0, max: 100, defaultValue: 60, unit: '%' },
      { name: 'Tone', min: 0, max: 100, defaultValue: 45, unit: '%' },
      { name: 'Mix', min: 0, max: 100, defaultValue: 40, unit: '%' }
    ]
  },
  {
    id: 10,
    title: 'Limiter',
    category: 'Dynamics',
    description: 'Prevents the signal from exceeding a set level. Used on the master bus to avoid clipping.',
    bestFor: 'Mastering, preventing peaks, increasing loudness safely',
    visualType: 'limiter',
    parameters: [
      { name: 'Ceiling', min: -24, max: 0, defaultValue: -0.2, unit: 'dB' },
      { name: 'Gain Boost', min: 0, max: 24, defaultValue: 6, unit: 'dB' },
      { name: 'Release', min: 10, max: 1000, defaultValue: 250, unit: 'ms' }
    ]
  },
  {
    id: 11,
    title: 'Gate / Noise Gate',
    category: 'Dynamics',
    description: 'Cuts the sound when it falls below a set level. Removes background noise or bleed.',
    bestFor: 'Drums, live recordings, noisy environments',
    visualType: 'gate',
    parameters: [
      { name: 'Threshold', min: -80, max: 0, defaultValue: -45, unit: 'dB' },
      { name: 'Attack', min: 0.1, max: 50, defaultValue: 2, unit: 'ms' },
      { name: 'Release', min: 10, max: 1000, defaultValue: 200, unit: 'ms' },
      { name: 'Hold', min: 0, max: 500, defaultValue: 50, unit: 'ms' }
    ]
  },
  {
    id: 12,
    title: 'Expander',
    category: 'Dynamics',
    description: 'Similar to gate but more gradual and transparent. Reduces dynamics instead of cutting.',
    bestFor: 'Vocals, noise reduction, subtle dynamic control',
    visualType: 'expander',
    parameters: [
      { name: 'Threshold', min: -60, max: 0, defaultValue: -35, unit: 'dB' },
      { name: 'Ratio', min: 1, max: 4, defaultValue: 2, unit: ':1' },
      { name: 'Attack', min: 1, max: 100, defaultValue: 10, unit: 'ms' },
      { name: 'Release', min: 10, max: 1000, defaultValue: 120, unit: 'ms' }
    ]
  },
  {
    id: 13,
    title: 'De-Esser',
    category: 'Dynamics',
    description: 'Reduces harsh sibilant sounds (s, sh, ch) in vocals.',
    bestFor: 'Vocals, voiceovers, podcasts',
    visualType: 'deesser',
    parameters: [
      { name: 'Threshold', min: -40, max: 0, defaultValue: -18, unit: 'dB' },
      { name: 'Frequency', min: 4000, max: 8000, defaultValue: 6200, unit: 'Hz' },
      { name: 'Reduction Range', min: 0, max: 15, defaultValue: 6, unit: 'dB' }
    ]
  },
  {
    id: 14,
    title: 'Tremolo',
    category: 'Modulation',
    description: 'Modulates the volume up and down at a rate. Creates a pulsing or chopping effect.',
    bestFor: 'Guitars, synths, creative effects, rhythmic movement',
    visualType: 'tremolo',
    parameters: [
      { name: 'Rate', min: 1, max: 20, defaultValue: 6, unit: 'Hz' },
      { name: 'Depth', min: 0, max: 100, defaultValue: 70, unit: '%' },
      { name: 'Shape (Sine-Square)', min: 0, max: 100, defaultValue: 20, unit: '%' }
    ]
  },
  {
    id: 15,
    title: 'Auto Pan',
    category: 'Modulation',
    description: 'Automatically pans the sound left and right over time.',
    bestFor: 'Synths, pads, effects, adding motion and width',
    visualType: 'autopan',
    parameters: [
      { name: 'Rate', min: 0.1, max: 10, defaultValue: 2.5, unit: 'Hz' },
      { name: 'Width', min: 0, max: 100, defaultValue: 80, unit: '%' },
      { name: 'Phase Shift', min: 0, max: 360, defaultValue: 180, unit: 'deg' }
    ]
  },
  {
    id: 16,
    title: 'Pitch Shift',
    category: 'Modulation',
    description: 'Changes the pitch of a sound without (or with control of) changing the speed.',
    bestFor: 'Vocals, harmonies, creative sound design',
    visualType: 'pitchshift',
    parameters: [
      { name: 'Pitch Shift', min: -12, max: 12, defaultValue: 0, unit: 'st' },
      { name: 'Formant Shift', min: -12, max: 12, defaultValue: 0, unit: 'st' },
      { name: 'Mix', min: 0, max: 100, defaultValue: 100, unit: '%' }
    ]
  },
  {
    id: 17,
    title: 'Time Stretch',
    category: 'Modulation',
    description: 'Changes the duration of a sound without (or with control of) changing the pitch.',
    bestFor: 'Loops, samples, remixing, sound design',
    visualType: 'timestretch',
    parameters: [
      { name: 'Speed Ratio', min: 50, max: 200, defaultValue: 100, unit: '%' },
      { name: 'Formant Lock', min: 0, max: 1, defaultValue: 1, unit: 'on/off' }
    ]
  },
  {
    id: 18,
    title: 'Stereo Widener',
    category: 'Time-Based',
    description: 'Expands the stereo image, making sounds wider and more spacious.',
    bestFor: 'Mix bus, synths, pads, making elements wider',
    visualType: 'widener',
    parameters: [
      { name: 'Stereo Width', min: 0, max: 200, defaultValue: 130, unit: '%' },
      { name: 'Low Cut', min: 20, max: 500, defaultValue: 120, unit: 'Hz' },
      { name: 'Mix', min: 0, max: 100, defaultValue: 80, unit: '%' }
    ]
  },
  {
    id: 19,
    title: 'Transient Shaper',
    category: 'Dynamics',
    description: 'Enhances or reduces the attack (transient) or sustain of a sound.',
    bestFor: 'Drums, percussive sounds, adding punch or smoothness',
    visualType: 'transient',
    parameters: [
      { name: 'Attack', min: -100, max: 100, defaultValue: 40, unit: '%' },
      { name: 'Sustain', min: -100, max: 100, defaultValue: -20, unit: '%' },
      { name: 'Output Gain', min: -12, max: 12, defaultValue: 0, unit: 'dB' }
    ]
  },
  {
    id: 20,
    title: 'Ring Modulator',
    category: 'Modulation',
    description: 'Multiplies two signals together to create metallic, robotic, alien sounds.',
    bestFor: 'Synths, sound design, experimental effects',
    visualType: 'ringmod',
    parameters: [
      { name: 'Carrier Freq', min: 10, max: 3000, defaultValue: 450, unit: 'Hz' },
      { name: 'LFO Rate', min: 0, max: 100, defaultValue: 5, unit: 'Hz' },
      { name: 'Mix', min: 0, max: 100, defaultValue: 45, unit: '%' }
    ]
  }
];

// Interactive Knob Component with full Touch / Pointer Capture support
interface InteractiveKnobProps {
  label: string;
  min: number;
  max: number;
  value: number;
  unit: string;
  onChange: (val: number) => void;
}

const InteractiveKnob: React.FC<InteractiveKnobProps> = ({ label, min, max, value, unit, onChange }) => {
  const knobRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLDivElement;
    try {
      target.setPointerCapture(e.pointerId);
    } catch (err) {}

    const startY = e.clientY;
    const startVal = value;
    const range = max - min;
    const pixelsPerUnit = 2; // Move 2 pixels per unit of value

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaY = startY - moveEvent.clientY; // drag up to increase
      const deltaVal = deltaY / pixelsPerUnit;
      let newVal = startVal + deltaVal;
      newVal = Math.max(min, Math.min(max, newVal));
      const precision = range > 20 ? 1 : 10;
      onChange(Math.round(newVal * precision) / precision);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      try {
        target.releasePointerCapture(upEvent.pointerId);
      } catch (err) {}
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const percentage = (value - min) / (max - min);
  const rotation = -135 + percentage * 270;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-900/40 rounded-2xl border border-slate-800/40 w-24">
      <span className="text-[10px] font-black uppercase text-slate-400 mb-2 truncate max-w-full tracking-wider text-center">
        {label}
      </span>
      
      <div 
        ref={knobRef}
        onPointerDown={handlePointerDown}
        className="relative w-12 h-12 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600/40 shadow-inner cursor-ns-resize flex items-center justify-center active:scale-95 transition-transform"
        style={{ touchAction: 'none' }}
      >
        <div 
          className="absolute w-1 h-3 bg-cyan-400 rounded-full top-1 left-1/2 -translate-x-1/2 origin-bottom"
          style={{ transform: `rotate(${rotation}deg) translateY(-2px)` }}
        />
        <div className="w-6 h-6 rounded-full bg-slate-950/40 shadow-inner" />
      </div>

      <div className="mt-2 text-center">
        <span className="text-xs font-mono font-bold text-slate-200">
          {value}
        </span>
        <span className="text-[9px] font-mono text-slate-400 ml-0.5">
          {unit}
        </span>
      </div>
    </div>
  );
};

// SVG visual renderer representing the selected audio effect dynamically
interface EffectVisualizerProps {
  type: string;
  params: { [key: string]: number };
}

const EffectVisualizer: React.FC<EffectVisualizerProps> = ({ type, params }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setPhase((prev) => (prev + 0.05) % (Math.PI * 2));
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const renderVisual = () => {
    const width = 300;
    const height = 140;
    const midY = height / 2;

    switch (type) {
      case 'eq': {
        const low = params['Low Gain'] ?? 0;
        const mid = params['Mid Gain'] ?? 0;
        const high = params['High Gain'] ?? 0;

        const lowOffset = -low * 3.5;
        const midOffset = -mid * 3.5;
        const highOffset = -high * 3.5;

        const d = `M 0 ${midY + lowOffset} 
                   C 60 ${midY + lowOffset}, 100 ${midY + midOffset}, 150 ${midY + midOffset} 
                   C 200 ${midY + midOffset}, 240 ${midY + highOffset}, 300 ${midY + highOffset}`;

        return (
          <g>
            <line x1="0" y1={midY} x2={width} y2={midY} stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
            <line x1={width / 3} y1="0" x2={width / 3} y2={height} stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
            <line x1={(width * 2) / 3} y1="0" x2={(width * 2) / 3} y2={height} stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
            
            <path d={`${d} L ${width} ${height} L 0 ${height} Z`} fill="url(#eqGlow)" className="opacity-15" />
            
            <path d={d} fill="none" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" />
            
            <circle cx="45" cy={midY + lowOffset} r="6" fill="#0891b2" stroke="#fff" strokeWidth="2" />
            <circle cx="150" cy={midY + midOffset} r="6" fill="#0891b2" stroke="#fff" strokeWidth="2" />
            <circle cx="255" cy={midY + highOffset} r="6" fill="#0891b2" stroke="#fff" strokeWidth="2" />

            <text x="45" y={midY + lowOffset - 12} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">LOW</text>
            <text x="150" y={midY + midOffset - 12} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">MID</text>
            <text x="255" y={midY + highOffset - 12} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">HIGH</text>
          </g>
        );
      }

      case 'compressor': {
        const threshold = params['Threshold'] ?? -20;
        const ratio = params['Ratio'] ?? 4;

        const threshPct = (threshold + 60) / 60;
        const threshX = 40 + threshPct * 220;
        const threshY = height - 20 - threshPct * 100;

        const endX = 280;
        const actualRiseY = threshY - (endX - threshX) * (100 / 220) / ratio;

        const characteristicPath = `M 40 ${height - 20} L ${threshX} ${threshY} L ${endX} ${actualRiseY}`;

        const wavePoints = [];
        const isCompActive = ratio > 1;
        for (let x = 40; x <= 280; x += 2) {
          const rawAmp = Math.sin((x - 40) * 0.1 - phase * 1.5) * 35;
          const isAboveThresh = Math.abs(rawAmp) > 15;
          const finalAmp = isAboveThresh && isCompActive 
            ? Math.sign(rawAmp) * (15 + (Math.abs(rawAmp) - 15) / ratio)
            : rawAmp;
          wavePoints.push(`${x},${midY + finalAmp}`);
        }

        return (
          <g>
            <rect x="0" y="0" width={width} height={height} rx="12" fill="#020617" />
            <line x1={threshX} y1="10" x2={threshX} y2={height - 10} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth="1.5" />
            <text x={threshX + 5} y="20" fill="#f43f5e" fontSize="9" fontWeight="bold">THRESHOLD</text>

            <polyline points={wavePoints.join(' ')} fill="none" stroke="#22d3ee" strokeWidth="2" opacity="0.8" />
            
            <path d={characteristicPath} fill="none" stroke="#64748b" strokeWidth="1.5" />
            <circle cx={threshX} cy={threshY} r="4" fill="#f43f5e" />
          </g>
        );
      }

      case 'reverb': {
        const size = params['Room Size'] ?? 60;
        const decay = params['Decay'] ?? 2;

        const dotCount = Math.round(size / 3);
        const dots = [];
        for (let i = 0; i < dotCount; i++) {
          const x = 30 + (Math.sin(i * 1234.56 + phase) * 0.5 + 0.5) * 240;
          const y = 20 + (Math.cos(i * 9876.54 + phase) * 0.5 + 0.5) * 100;
          const delayOpacity = Math.max(0.1, Math.min(1, 1 - (i / dotCount) * (1.5 / decay)));
          dots.push({ x, y, opacity: delayOpacity });
        }

        return (
          <g>
            <rect x="0" y="0" width={width} height={height} rx="12" fill="#020617" />
            <rect 
              x={150 - size} 
              y={70 - size / 2} 
              width={size * 2} 
              height={size} 
              rx="8" 
              fill="none" 
              stroke="#6366f1" 
              strokeWidth="1.5" 
              opacity="0.3"
            />
            
            {dots.map((d, i) => (
              <circle 
                key={i} 
                cx={d.x} 
                cy={d.y} 
                r={1.5 + Math.sin(phase + i) * 1} 
                fill="#818cf8" 
                opacity={d.opacity} 
              />
            ))}
            
            <circle cx="50" cy={midY} r="8" fill="#4338ca" className="animate-pulse" />
            <text x="50" y={midY + 3} fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">IN</text>
          </g>
        );
      }

      case 'delay': {
        const delayTime = params['Delay Time'] ?? 300;
        const feedback = params['Feedback'] ?? 40;

        const echoCount = 5;
        const spacing = (delayTime / 1000) * 120;
        const peaks = [];
        let currAmp = 50;

        for (let i = 0; i < echoCount; i++) {
          const x = 50 + i * spacing;
          if (x < width - 15) {
            peaks.push({ x, h: currAmp, opacity: 1 - i * (0.8 - (feedback / 100) * 0.7) });
            currAmp *= (feedback / 100);
          }
        }

        return (
          <g>
            <rect x="0" y="0" width={width} height={height} rx="12" fill="#020617" />
            
            {peaks.map((p, i) => (
              <g key={i}>
                {i > 0 && (
                  <path 
                    d={`M ${peaks[i-1].x} ${midY} Q ${(peaks[i-1].x + p.x)/2} ${midY - 30} ${p.x} ${midY}`} 
                    fill="none" 
                    stroke="#a855f7" 
                    strokeWidth="1" 
                    strokeDasharray="2 2" 
                    opacity={p.opacity} 
                  />
                )}
                
                <line 
                  x1={p.x} 
                  y1={midY - p.h} 
                  x2={p.x} 
                  y2={midY + p.h} 
                  stroke={i === 0 ? "#ec4899" : "#a855f7"} 
                  strokeWidth={i === 0 ? "4" : "2"} 
                  strokeLinecap="round"
                  opacity={Math.max(0.1, p.opacity)}
                />
                
                <circle cx={p.x} cy={midY - p.h} r="3.5" fill="#f472b6" opacity={Math.max(0.1, p.opacity)} />
                <circle cx={p.x} cy={midY + p.h} r="3.5" fill="#f472b6" opacity={Math.max(0.1, p.opacity)} />
              </g>
            ))}
            
            <text x="30" y="25" fill="#e879f9" fontSize="10" fontWeight="bold">Dry</text>
            <text x="180" y="25" fill="#c084fc" fontSize="10" fontWeight="bold">Wet (Feedback)</text>
          </g>
        );
      }

      case 'chorus':
      case 'flanger':
      case 'phaser': {
        const rate = params['Rate'] ?? 1;
        const depth = params['Depth'] ?? 50;

        const wave1 = [];
        const wave2 = [];
        const wave3 = [];

        for (let x = 0; x <= width; x += 4) {
          const speedFactor = rate * phase;
          const y1 = midY + Math.sin(x * 0.04 - speedFactor) * (depth * 0.3);
          const y2 = midY + Math.sin(x * 0.04 - speedFactor + 1.2) * (depth * 0.28);
          const y3 = midY + Math.sin(x * 0.04 - speedFactor + 2.4) * (depth * 0.25);
          
          wave1.push(`${x},${y1}`);
          wave2.push(`${x},${y2}`);
          wave3.push(`${x},${y3}`);
        }

        return (
          <g>
            <rect x="0" y="0" width={width} height={height} rx="12" fill="#020617" />
            <polyline points={wave1.join(' ')} fill="none" stroke="#22d3ee" strokeWidth="2.5" opacity="0.9" />
            <polyline points={wave2.join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.75" />
            <polyline points={wave3.join(' ')} fill="none" stroke="#ec4899" strokeWidth="1.5" opacity="0.6" />
            
            <circle cx="50" cy="20" r="4" fill="#22d3ee" />
            <circle cx="150" cy="20" r="4" fill="#3b82f6" />
            <circle cx="255" cy="20" r="4" fill="#ec4899" />
          </g>
        );
      }

      case 'distortion': {
        const drive = params['Drive'] ?? 50;
        const clipThreshold = 45 - (drive * 0.35);
        
        const sinePoints = [];
        for (let x = 10; x <= width - 10; x += 1.5) {
          const rawY = Math.sin((x - 10) * 0.05 - phase * 1.5) * 60;
          let clippedY = rawY;
          if (Math.abs(rawY) > clipThreshold) {
            clippedY = Math.sign(rawY) * clipThreshold;
          }
          sinePoints.push(`${x},${midY + clippedY}`);
        }

        return (
          <g>
            <rect x="0" y="0" width={width} height={height} rx="12" fill="#020617" />
            <line x1="0" y1={midY - clipThreshold} x2={width} y2={midY - clipThreshold} stroke="#ef4444" strokeDasharray="3 3" opacity="0.4" />
            <line x1="0" y1={midY + clipThreshold} x2={width} y2={midY + clipThreshold} stroke="#ef4444" strokeDasharray="3 3" opacity="0.4" />
            
            <polyline points={sinePoints.join(' ')} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinejoin="miter" />
            
            <text x="15" y="20" fill="#f87171" fontSize="9" fontWeight="bold">HARD CLIPPING</text>
          </g>
        );
      }

      case 'saturation': {
        const drive = params['Drive'] ?? 30;
        const softCap = 50;
        
        const sinePoints = [];
        for (let x = 10; x <= width - 10; x += 1.5) {
          const rawY = Math.sin((x - 10) * 0.05 - phase * 1.5) * (40 + drive * 0.4);
          const ratio = rawY / softCap;
          const softY = softCap * Math.tanh(ratio);
          sinePoints.push(`${x},${midY + softY}`);
        }

        return (
          <g>
            <rect x="0" y="0" width={width} height={height} rx="12" fill="#020617" />
            <polyline points={sinePoints.join(' ')} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            <text x="15" y="20" fill="#fbbf24" fontSize="9" fontWeight="bold">SOFT ANALOG CLIPPING</text>
          </g>
        );
      }

      case 'limiter': {
        const ceiling = params['Ceiling'] ?? -0.2;
        const gainBoost = params['Gain Boost'] ?? 6;
        
        const ceilingY = midY - 45 - (ceiling * 1.5);
        
        const wavePoints = [];
        for (let x = 10; x <= width - 10; x += 1.5) {
          const boostedAmp = Math.sin((x - 10) * 0.07 - phase * 1.5) * (30 + gainBoost * 4);
          const limitBound = midY - ceilingY;
          let limitedAmp = boostedAmp;
          if (Math.abs(boostedAmp) > limitBound) {
            limitedAmp = Math.sign(boostedAmp) * limitBound;
          }
          wavePoints.push(`${x},${midY + limitedAmp}`);
        }

        return (
          <g>
            <rect x="0" y="0" width={width} height={height} rx="12" fill="#020617" />
            <line x1="0" y1={ceilingY} x2={width} y2={ceilingY} stroke="#f43f5e" strokeWidth="2" />
            <line x1="0" y1={height - ceilingY} x2={width} y2={height - ceilingY} stroke="#f43f5e" strokeWidth="2" />
            <text x="15" y={ceilingY - 5} fill="#f43f5e" fontSize="8" fontWeight="bold">CEILING LIMIT</text>
            
            <polyline points={wavePoints.join(' ')} fill="none" stroke="#22d3ee" strokeWidth="2" />
          </g>
        );
      }

      case 'gate': {
        const threshold = params['Threshold'] ?? -45;
        const threshGap = 15 + Math.abs(threshold) * 0.5;
        
        const wavePoints = [];
        for (let x = 10; x <= width - 10; x += 1.5) {
          const distance = x - 10;
          const envelope = Math.abs(Math.sin(distance * 0.007)) > 0.4 ? 1 : 0.05;
          const carrier = Math.sin(distance * 0.15 - phase * 2) * 55;
          const rawAmp = carrier * envelope;
          
          const isGateOpen = Math.abs(rawAmp) > threshGap;
          const finalAmp = isGateOpen ? rawAmp : 0;
          wavePoints.push(`${x},${midY + finalAmp}`);
        }

        return (
          <g>
            <rect x="0" y="0" width={width} height={height} rx="12" fill="#020617" />
            <line x1="0" y1={midY - threshGap} x2={width} y2={midY - threshGap} stroke="#e2e8f0" strokeDasharray="4 4" opacity="0.3" />
            <line x1="0" y1={midY + threshGap} x2={width} y2={midY + threshGap} stroke="#e2e8f0" strokeDasharray="4 4" opacity="0.3" />
            
            <polyline points={wavePoints.join(' ')} fill="none" stroke="#10b981" strokeWidth="2" />
            <text x="15" y="20" fill="#34d399" fontSize="9" fontWeight="bold">NOISE GATE (MUTED BELOW THRESHOLD)</text>
          </g>
        );
      }

      case 'deesser': {
        const threshold = params['Threshold'] ?? -18;
        
        const wavePoints = [];
        for (let x = 10; x <= width - 10; x += 1.5) {
          const isHighFreqSibilant = x > 100 && x < 180;
          const freq = isHighFreqSibilant ? 0.4 : 0.05;
          let amp = isHighFreqSibilant ? 40 : 25;
          
          if (isHighFreqSibilant) {
            const atten = Math.max(10, 40 - Math.abs(threshold) * 0.8);
            amp = atten;
          }
          
          const Y = midY + Math.sin((x - 10) * freq - phase * 1.5) * amp;
          wavePoints.push(`${x},${Y}`);
        }

        return (
          <g>
            <rect x="0" y="0" width={width} height={height} rx="12" fill="#020617" />
            <polyline points={wavePoints.join(' ')} fill="none" stroke="#06b6d4" strokeWidth="2" />
            
            <rect x="100" y="10" width="80" height="120" fill="#06b6d4" opacity="0.1" rx="4" />
            <text x="140" y="22" fill="#22d3ee" fontSize="8" fontWeight="bold" textAnchor="middle">SIBILANCE BAND (6kHz)</text>
          </g>
        );
      }

      case 'tremolo': {
        const rate = params['Rate'] ?? 6;
        const depth = params['Depth'] ?? 70;
        
        const wavePoints = [];
        for (let x = 10; x <= width - 10; x += 1) {
          const ampMod = 1 - ((depth / 100) * 0.5 * (1 + Math.sin((x - 10) * (rate * 0.015) - phase)));
          const Y = midY + Math.sin((x - 10) * 0.1) * 45 * ampMod;
          wavePoints.push(`${x},${Y}`);
        }

        return (
          <g>
            <rect x="0" y="0" width={width} height={height} rx="12" fill="#020617" />
            <polyline points={wavePoints.join(' ')} fill="none" stroke="#eab308" strokeWidth="2" />
            <text x="15" y="20" fill="#fef08a" fontSize="9" fontWeight="bold">AMPLITUDE MODULATION</text>
          </g>
        );
      }

      case 'autopan': {
        const rate = params['Rate'] ?? 2.5;
        const widthVal = params['Width'] ?? 80;

        const leftPoints = [];
        const rightPoints = [];
        for (let x = 10; x <= width - 10; x += 1.5) {
          const offset = (widthVal / 100) * 15;
          const leftAmp = 30 + Math.sin((x - 10) * (rate * 0.015) - phase) * offset;
          const rightAmp = 30 - Math.sin((x - 10) * (rate * 0.015) - phase) * offset;

          leftPoints.push(`${x},${midY - 20 + Math.sin(x * 0.1) * leftAmp * 0.4}`);
          rightPoints.push(`${x},${midY + 20 + Math.sin(x * 0.1) * rightAmp * 0.4}`);
        }

        return (
          <g>
            <rect x="0" y="0" width={width} height={height} rx="12" fill="#020617" />
            <line x1="0" y1={midY} x2={width} y2={midY} stroke="#1e293b" />
            <polyline points={leftPoints.join(' ')} fill="none" stroke="#22d3ee" strokeWidth="2" opacity="0.9" />
            <polyline points={rightPoints.join(' ')} fill="none" stroke="#ec4899" strokeWidth="2" opacity="0.9" />
            
            <text x="15" y="20" fill="#22d3ee" fontSize="8" fontWeight="bold">LEFT CHANNEL</text>
            <text x="15" y={height - 10} fill="#f472b6" fontSize="8" fontWeight="bold">RIGHT CHANNEL</text>
          </g>
        );
      }

      default: {
        const sinePoints = [];
        for (let x = 10; x <= width - 10; x += 2) {
          const y = midY + Math.sin((x - 10) * 0.05 - phase) * 35;
          sinePoints.push(`${x},${y}`);
        }
        return (
          <g>
            <rect x="0" y="0" width={width} height={height} rx="12" fill="#020617" />
            <polyline points={sinePoints.join(' ')} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
          </g>
        );
      }
    }
  };

  return (
    <div className="flex justify-center items-center bg-slate-950 p-4 rounded-[2rem] border border-slate-800/80 shadow-inner w-full overflow-hidden">
      <svg viewBox="0 0 300 140" className="w-full max-w-sm h-auto">
        <defs>
          <linearGradient id="eqGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </linearGradient>
        </defs>
        {renderVisual()}
      </svg>
    </div>
  );
};

export const AudioEffectsGuide: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEffect, setSelectedEffect] = useState<AudioEffectItem>(AUDIO_EFFECTS_DATA[0]);
  const [effectParams, setEffectParams] = useState<{ [key: string]: number }>({});
  
  const [effectChain, setEffectChain] = useState<string[]>(['EQ', 'Compression', 'Saturation', 'Reverb', 'Limiter']);
  const availableChainEffects = ['EQ', 'Compression', 'Saturation', 'Delay', 'Reverb', 'Chorus', 'Gate', 'Limiter', 'Stereo Widener'];

  useEffect(() => {
    const initialParams: { [key: string]: number } = {};
    selectedEffect.parameters.forEach((p) => {
      initialParams[p.name] = p.defaultValue;
    });
    setEffectParams(initialParams);
  }, [selectedEffect]);

  const handleParamChange = (name: string, value: number) => {
    setEffectParams((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const categories = ['All', 'Dynamics', 'Time-Based', 'Modulation', 'Distortion/Harmonic', 'Utility'];

  const filteredEffects = selectedCategory === 'All'
    ? AUDIO_EFFECTS_DATA
    : AUDIO_EFFECTS_DATA.filter(fx => fx.category === selectedCategory);

  const toggleChainEffect = (name: string) => {
    if (effectChain.includes(name)) {
      if (effectChain.length > 1) {
        setEffectChain(prev => prev.filter(item => item !== name));
      }
    } else {
      setEffectChain(prev => [...prev, name]);
    }
  };

  const moveChainItem = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === effectChain.length - 1) return;
    
    const newChain = [...effectChain];
    const swapTarget = direction === 'left' ? index - 1 : index + 1;
    const temp = newChain[index];
    newChain[index] = newChain[swapTarget];
    newChain[swapTarget] = temp;
    setEffectChain(newChain);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: List and filters (span 5) */}
      <div className="lg:col-span-5 grid gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-purple-600 shrink-0" size={20} />
            <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-800">
              Audio Effects Catalog
            </h3>
          </div>

          {/* Categories Pill Filters */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3 rounded-xl text-[10px] md:text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Interactive Flow Grid List */}
          <div className="grid grid-cols-2 gap-2 max-h-[440px] overflow-y-auto pr-1">
            {filteredEffects.map((fx) => {
              const isSelected = fx.id === selectedEffect.id;
              return (
                <button
                  key={fx.id}
                  onClick={() => setSelectedEffect(fx)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                    isSelected
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 border-transparent text-white shadow-lg shadow-indigo-900/10 scale-[0.98]'
                      : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-500'
                    }`}>
                      {fx.id}
                    </span>
                    <span className={`text-[8px] font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {fx.category}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-xs md:text-sm font-black tracking-tight uppercase truncate">{fx.title}</h4>
                    <p className={`text-[9px] truncate ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                      {fx.bestFor}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Tips & General Rules */}
        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Info className="text-purple-400 shrink-0" size={18} />
            <h4 className="text-sm font-black uppercase tracking-wider text-purple-400">Audio Engineer Quick Tips</h4>
          </div>
          <ul className="space-y-3.5 text-xs text-slate-300 font-medium leading-relaxed">
            <li className="flex gap-2.5 items-start">
              <span className="text-purple-400 mt-1">✔</span>
              <span><strong>Less is More</strong>: Subtle settings often sound best. Extreme settings can easily damage your main audio quality and cause ear fatigue.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="text-purple-400 mt-1">✔</span>
              <span><strong>Use your ears, not your eyes</strong>: Do not rely solely on frequency meters or visual curves. Always monitor the actual sound in your headphones.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="text-purple-400 mt-1">✔</span>
              <span><strong>Bypass to Compare</strong>: Keep toggling the bypass state to check if your additions actually make the sound better or just louder.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Column: Detailed parameters & live interactive sandbox */}
      <div className="lg:col-span-7 grid gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-5 mb-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                Effect Details / {selectedEffect.category}
              </span>
              <h3 className="text-2xl font-black uppercase italic tracking-tight text-slate-800 mt-1">
                {selectedEffect.title}
              </h3>
            </div>
            
            {/* Quick Best For badge */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl py-2 px-3 flex items-center gap-2">
              <Check className="text-emerald-500" size={16} />
              <div>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Best For</p>
                <p className="text-[11px] font-bold text-slate-700 leading-normal mt-0.5">{selectedEffect.bestFor}</p>
              </div>
            </div>
          </div>

          {/* Explanations */}
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                {selectedEffect.description}
              </p>
            </div>
            
            <div className="p-4 bg-emerald-50/20 rounded-2xl border border-emerald-100/30 flex gap-3">
              <span className="text-lg">💡</span>
              <div>
                <h5 className="text-xs font-black uppercase text-emerald-800 tracking-tight">Recommended Use</h5>
                <p className="text-xs text-emerald-700 font-medium mt-1 leading-relaxed">
                  {selectedEffect.bestFor}
                </p>
              </div>
            </div>
          </div>

          {/* Live Reactive Visualizer */}
          <div className="mb-6">
            <h4 className="text-xs font-black uppercase text-slate-400 mb-2 tracking-wider flex items-center gap-1.5">
              <Waves size={14} className="text-purple-500 animate-pulse" />
              Reactive Visualizer
            </h4>
            <EffectVisualizer type={selectedEffect.visualType} params={effectParams} />
          </div>

          {/* Interactive Knobs Control Panel */}
          <div>
            <h4 className="text-xs font-black uppercase text-slate-400 mb-3 tracking-wider">
              Interactive Parameter Controls (Drag to Adjust)
            </h4>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {selectedEffect.parameters.map((p) => (
                <InteractiveKnob
                  key={p.name}
                  label={p.name}
                  min={p.min}
                  max={p.max}
                  value={effectParams[p.name] ?? p.defaultValue}
                  unit={p.unit}
                  onChange={(val) => handleParamChange(p.name, val)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Custom Interactive Audio Effect Chain Builder */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="text-purple-600 shrink-0" size={20} />
            <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-800">
              Signal Path Builder
            </h3>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed font-semibold mb-4">
            See and customize the standard layout of effects usually configured by professional sound engineers. Use left and right arrow controls on each block to re-order the signal path.
          </p>

          {/* Standard recommended order visual tips */}
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-700">Recommended Standard Order:</span>
              <span className="text-[10px] font-bold text-purple-600 uppercase bg-purple-50 px-2 py-0.5 rounded-full">Standard Order</span>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-[10px] font-black text-slate-500">
              <span className="bg-slate-200/60 py-1 px-2 rounded-lg">1. EQ</span>
              <ArrowRight size={10} />
              <span className="bg-slate-200/60 py-1 px-2 rounded-lg">2. Compressor</span>
              <ArrowRight size={10} />
              <span className="bg-slate-200/60 py-1 px-2 rounded-lg">3. Saturation</span>
              <ArrowRight size={10} />
              <span className="bg-slate-200/60 py-1 px-2 rounded-lg">4. Delays/Reverb</span>
              <ArrowRight size={10} />
              <span className="bg-slate-200/60 py-1 px-2 rounded-lg">5. Widener</span>
              <ArrowRight size={10} />
              <span className="bg-slate-200/60 py-1 px-2 rounded-lg">6. Limiter</span>
            </div>
          </div>

          {/* Interactive Flow Chain Sequence */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-950 rounded-3xl border border-slate-900 shadow-inner overflow-x-auto min-h-[90px]">
              <span className="text-[10px] font-black text-emerald-400 border border-emerald-900/50 px-2 py-1.5 rounded-xl uppercase tracking-wider bg-emerald-950/20 shrink-0">
                Input (Mic/Inst)
              </span>
              
              <ArrowRight size={12} className="text-slate-700 shrink-0" />
              
              <AnimatePresence mode="popLayout">
                {effectChain.map((name, idx) => (
                  <React.Fragment key={name}>
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-gradient-to-r from-purple-900/80 to-indigo-950/80 border border-purple-800/60 rounded-2xl p-2.5 flex items-center gap-2 text-white shadow-md relative shrink-0"
                    >
                      <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-950/50 w-5 h-5 rounded-full flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-black uppercase tracking-tight pr-1">{name}</span>
                      
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => moveChainItem(idx, 'left')}
                          disabled={idx === 0}
                          className="text-[8px] hover:text-cyan-400 bg-slate-900/80 rounded w-4 h-3 flex items-center justify-center font-bold disabled:opacity-20 disabled:hover:text-white"
                        >
                          ◀
                        </button>
                        <button 
                          onClick={() => moveChainItem(idx, 'right')}
                          disabled={idx === effectChain.length - 1}
                          className="text-[8px] hover:text-cyan-400 bg-slate-900/80 rounded w-4 h-3 flex items-center justify-center font-bold disabled:opacity-20 disabled:hover:text-white"
                        >
                          ▶
                        </button>
                      </div>

                      <button
                        onClick={() => toggleChainEffect(name)}
                        className="text-[10px] text-red-400 hover:text-red-300 font-extrabold pl-1 cursor-pointer"
                        title="Remove"
                      >
                        ×
                      </button>
                    </motion.div>
                    
                    {idx < effectChain.length - 1 && (
                      <ArrowRight size={12} className="text-slate-700 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </AnimatePresence>

              <ArrowRight size={12} className="text-slate-700 shrink-0" />
              
              <span className="text-[10px] font-black text-rose-400 border border-rose-900/50 px-2 py-1.5 rounded-xl uppercase tracking-wider bg-rose-950/20 shrink-0">
                Output (Main PA)
              </span>
            </div>

            {/* Toggle Switcher Buttons */}
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                Toggle to Add or Remove FX on the Signal Path
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableChainEffects.map((name) => {
                  const isActive = effectChain.includes(name);
                  return (
                    <button
                      key={name}
                      onClick={() => toggleChainEffect(name)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all border ${
                        isActive
                          ? 'bg-purple-100 border-purple-200 text-purple-700'
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {isActive ? `✓ ${name}` : `+ ${name}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
