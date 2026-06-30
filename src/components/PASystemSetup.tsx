import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, Mic, Radio, Sliders, Cpu, Zap, Volume2, 
  ArrowRight, CheckCircle, Info, Sparkles, AlertTriangle 
} from 'lucide-react';

// Import generated realistic product photos
import sourcesImg from '../assets/images/pa_sources_1782840544071.jpg';
import mixerImg from '../assets/images/pa_mixer_1782840555690.jpg';
import processingImg from '../assets/images/pa_processing_1782840567638.jpg';
import ampImg from '../assets/images/pa_amplifiers_1782840578771.jpg';
import speakersImg from '../assets/images/pa_speakers_1782840599527.jpg';

interface StepDetail {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  image: string;
  description: string;
  details: string[];
  tips: string[];
  connections: { from: string; to: string; cable: string }[];
}

export const PASystemSetup: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps: StepDetail[] = [
    {
      id: 1,
      title: 'Sound Sources',
      subtitle: 'Where Sound Begins',
      icon: Mic,
      image: sourcesImg,
      description: 'The starting point of the signal chain. Converts acoustic energy (vibrations) or digital audio data into electrical signals.',
      details: [
        'Microphones: Dynamic (durable, high SPL handling, standard for live stages like SM58) vs Condenser (high detail, requires 48V phantom power).',
        'Instruments: Guitars, basses, or keyboards sending line-level or high-impedance signals.',
        'DJ Gear & Laptops: Stereo playback units, media players, and bluetooth receivers.'
      ],
      tips: [
        'Use a Direct Box (DI Box) to convert high-impedance unbalanced signals (like acoustic guitar or keyboard) into low-impedance balanced signals for clean, long cable runs.',
        'Keep vocal microphones behind the main speakers to drastically reduce the risk of feedback.',
        'Always lock or mute channels when connecting sound sources to prevent massive pops.'
      ],
      connections: [
        { from: 'Microphone / Instruments', to: 'DI Box / Stage Box', cable: 'XLR / TS Cable' },
        { from: 'DI Box / Stage Box', to: 'Mixing Console', cable: 'Balanced XLR' }
      ]
    },
    {
      id: 2,
      title: 'Mixing Console',
      subtitle: 'Control, Balance & Shape',
      icon: Sliders,
      image: mixerImg,
      description: 'The command center of the system. Mixes multiple audio sources, adjusts individual volume levels, modifies frequency balance (EQ), and routes the combined signal.',
      details: [
        'Pre-amplifier Gain: Sets the initial level of the signal. The foundation of professional gain staging.',
        'EQ & Filters: Uses High-Pass Filters (HPF) to remove low-frequency mud and shelf EQs to control high-mid presence.',
        'Buses & Auxes: Routes signals to main monitors or dedicated monitors on the stage.'
      ],
      tips: [
        'Set proper gain staging: Aim for standard operating levels (around green/amber, never in the red clipping zone).',
        'Use subtractive EQ: Cut problematic frequencies rather than boosting good ones. It keeps headroom clean.',
        'Mute any unused microphones to keep room noise, stage bleeding, and accidental feedback loops to a absolute minimum.'
      ],
      connections: [
        { from: 'Mixing Console Output', to: 'Signal Processing Rack', cable: 'Balanced XLR / TRS' }
      ]
    },
    {
      id: 3,
      title: 'Signal Processing',
      subtitle: 'Enhance & Protect',
      icon: Cpu,
      image: processingImg,
      description: 'Refines the collective mix before it reaches power amplification, ensuring acoustic clarity and protecting physical speaker drivers.',
      details: [
        'Graphic EQ: Adjusts specific frequency bands to correct acoustic anomalies of the venue room (room tuning / ringing out).',
        'Crossover: Splits the composite full-range audio into separate frequency bands (low, mid, high) for specialized speaker drivers.',
        'Limiter: Acts as an emergency shield, clipping extreme transients to protect down-chain hardware from destruction.'
      ],
      tips: [
        'Ring out the room: Use a graphic EQ to cut narrow feedback-prone frequencies before the show starts.',
        'Set crossovers carefully: Send low frequencies (e.g. below 80-100Hz) exclusively to subwoofers to keep your mains running light and clean.',
        'Keep limiters set just below the amplifier\'s clipping point.'
      ],
      connections: [
        { from: 'Signal Processor (Low)', to: 'Subwoofer Amplifiers', cable: 'Balanced XLR' },
        { from: 'Signal Processor (Mid/High)', to: 'Main Amplifiers', cable: 'Balanced XLR' }
      ]
    },
    {
      id: 4,
      title: 'Power Amplifiers',
      subtitle: 'Drive the Speakers',
      icon: Zap,
      image: ampImg,
      description: 'Increases the low-voltage line-level audio signal coming from mixers or processors into a high-voltage speaker-level signal powerful enough to move physical cones.',
      details: [
        'Wattage Matching: Power amplifiers must match the impedance (ohms) and program power capabilities of the passive speakers.',
        'Dedicated Amps: Low/Sub Amplifiers drive energy-intensive subs, while Mid/High Amplifiers run the main speakers.',
        'Active vs Passive: Modern active (powered) speakers have these power amplifiers built directly inside their enclosures.'
      ],
      tips: [
        'Power sequence rule: Turn on amplifiers LAST during startup, and turn them off FIRST during shutdown. This avoids the infamous "speaker-blowing pop".',
        'Keep ventilation clear: Power amps generate heavy thermal load and can go into thermal protection shutdown if blocked.',
        'Use heavy-gauge Speaker cables (like Speakon) instead of standard thin guitar signal cables, which can melt under high voltage.'
      ],
      connections: [
        { from: 'Power Amplifiers', to: 'Passive Speakers / Subwoofers', cable: 'Speakon Cable' }
      ]
    },
    {
      id: 5,
      title: 'Speakers & Output',
      subtitle: 'Deliver Sound to Audience',
      icon: Volume2,
      image: speakersImg,
      description: 'Converts electromagnetic voltage back into mechanical vibrations (sound waves) that propagate through the air to reach the audience.',
      details: [
        'Subwoofers: Specialized large-driver speakers dedicated purely to sub-bass rumble (30Hz - 100Hz).',
        'Top/Full-Range Speakers: Handles the critical vocal spectrum, guitars, and high frequencies (100Hz - 20kHz).',
        'Stage Monitors: Directional speaker wedges or in-ear systems that allow the performers to hear themselves clearly.'
      ],
      tips: [
        'Symmetrical coverage: Angle main speakers toward the back rows of the audience, ensuring coverage is even from front to back.',
        'Subwoofer coupling: Place subwoofers together or near a solid wall to increase low-end efficiency by up to +3dB.',
        'Stage monitor angling: Point wedge monitors directly at the musicians\' ears from behind their cardioid microphone capsules to maximize gain-before-feedback.'
      ],
      connections: [
        { from: 'Speakers', to: 'Audience Ears', cable: 'Acoustic Sound Waves' }
      ]
    }
  ];

  const activeData = steps.find(s => s.id === activeStep) || steps[0];

  return (
    <div id="pa-system-setup-root" className="space-y-8 animate-fade-in">
      
      {/* 1. Header & Quick Switcher */}
      <div id="pa-system-intro-card" className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-[2.5rem] border border-indigo-900/40 shadow-xl relative overflow-hidden">
        {/* Glow overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 text-xs font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" /> STAGE SIGNAL FLOW
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/20 text-blue-300 text-xs font-black uppercase tracking-wider">
              PRO HARDWARE GUIDE
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase mb-4 leading-none bg-gradient-to-r from-white via-indigo-100 to-blue-200 bg-clip-text text-transparent">
            Complete PA System Setup
          </h2>
          <p className="text-indigo-200/90 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
            Understand the complete professional audio signal path from input sources to final speaker output. Follow these five key stages to build clean, powerful, and reliable sound for any live stage or church environment.
          </p>

          {/* Interactive Flow Visual */}
          <div id="pa-flow-overview" className="mt-8 pt-6 border-t border-indigo-900/60">
            <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4 flex items-center gap-2">
              <span>Interactive Signal Flow</span>
              <span className="text-[10px] text-indigo-400 font-medium lowercase italic">(tap a node to jump to that stage)</span>
            </h4>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2">
              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = step.id === activeStep;
                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => setActiveStep(step.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left grow ${
                        isActive 
                          ? 'bg-blue-600 border-blue-500 shadow-md shadow-blue-900/30 text-white scale-[1.03]' 
                          : 'bg-slate-950/60 border-slate-800 text-indigo-200 hover:bg-slate-900/80 hover:border-indigo-800'
                      }`}
                    >
                      <div className={`p-2 rounded-xl transition-colors ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-indigo-300'
                      }`}>
                        <StepIcon size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ${
                            isActive ? 'bg-white text-blue-600' : 'bg-slate-800 text-indigo-300'
                          }`}>
                            {step.id}
                          </span>
                          <span className="text-xs font-extrabold tracking-tight uppercase leading-none">{step.title}</span>
                        </div>
                        <span className={`text-[10px] opacity-75 leading-none block mt-1 font-medium`}>{step.subtitle}</span>
                      </div>
                    </button>

                    {idx < steps.length - 1 && (
                      <div className="hidden md:flex items-center justify-center text-indigo-700 mx-1">
                        <ArrowRight size={16} className="animate-pulse" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Step-by-Step Interactive Details */}
      <div id="pa-step-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image and Description Card */}
        <div id="pa-step-left" className="lg:col-span-5 bg-white rounded-[2.5rem] border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
            <img 
              src={activeData.image} 
              alt={activeData.title} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            
            {/* Step badge overlay */}
            <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-black tracking-widest uppercase flex items-center gap-2 border border-slate-800 shadow-lg">
              <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black">
                {activeData.id}
              </span>
              STAGE {activeData.id} OF 5
            </div>

            {/* Glowing gradient indicator on image footer */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <p className="text-white font-extrabold tracking-tight uppercase text-sm sm:text-base leading-none">
                {activeData.subtitle}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800 mb-2">
                {activeData.title}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">
                {activeData.description}
              </p>
            </div>

            {/* Dynamic Connection flow details inside this step */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                CONNECTIONS FOR THIS STAGE:
              </span>
              
              <div className="space-y-2">
                {activeData.connections.map((conn, cIdx) => (
                  <div key={cIdx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">{conn.from}</span>
                      <ArrowRight size={12} className="text-slate-400" />
                      <span className="text-xs font-black text-blue-700">{conn.to}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 self-start sm:self-auto">
                      {conn.cable}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Details, Tips, and Checklist Actions */}
        <div id="pa-step-right" className="lg:col-span-7 space-y-6">
          
          {/* Detailed Points Card */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-600 w-2 h-6 rounded-full" />
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">
                How It Works (Technical Details)
              </h3>
            </div>

            <div className="space-y-3">
              {activeData.details.map((detail, idx) => {
                const parts = detail.split(': ');
                const label = parts[0];
                const text = parts[1] || '';
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3 items-start group hover:bg-white hover:border-slate-200 transition-all">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-tight block">
                        {label}
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        {text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pro Tips Section */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-amber-500 w-2 h-6 rounded-full" />
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800 flex items-center gap-1.5">
                Pro Troubleshooting & Optimization Tips
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeData.tips.map((tip, idx) => (
                <div key={idx} className="p-4 bg-amber-50/30 rounded-2xl border border-amber-100/60 flex gap-3 items-start group hover:bg-white hover:border-amber-200 transition-all">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform shrink-0" />
                  <span className="text-xs text-slate-600 leading-relaxed font-bold">
                    {tip}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Golden Rule Checklist Banner */}
          <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 flex items-start gap-4">
            <div className="bg-emerald-500 p-2.5 rounded-xl text-white shrink-0 shadow-md shadow-emerald-900/10">
              <CheckCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-tight text-emerald-800 mb-1">
                Startup Sequence reminder (Golden Law)
              </h4>
              <p className="text-xs text-emerald-600/90 leading-relaxed font-bold">
                Always power on items from input to output: <span className="underline">Sources ➔ Mixer ➔ Processing ➔ Amplifiers LAST</span>. When powering down, do the strict reverse: <span className="underline">Amplifiers FIRST, then input gear</span>. This prevents sudden signal spikes from destroying speaker diaphragms.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Overall Pro Stage Setup Golden Rules */}
      <div id="pa-golden-rules" className="bg-slate-50 border border-slate-200 p-6 sm:p-8 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">A</div>
          <h5 className="font-black text-sm uppercase tracking-tight text-slate-800">Plan Ahead</h5>
          <p className="text-xs text-slate-500 font-bold leading-relaxed">Map your inputs, mic placements, and cable paths on paper before moving physical gear onto the venue stage.</p>
        </div>

        <div className="space-y-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">B</div>
          <h5 className="font-black text-sm uppercase tracking-tight text-slate-800">Label All Cables</h5>
          <p className="text-xs text-slate-500 font-bold leading-relaxed">Use colored tape or numbered wraps on both ends of snake lines and microphone cords to speed up down-line debugging.</p>
        </div>

        <div className="space-y-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">C</div>
          <h5 className="font-black text-sm uppercase tracking-tight text-slate-800">Test Individually</h5>
          <p className="text-xs text-slate-500 font-bold leading-relaxed">Check each channel by scratch testing/speaking before introducing the full band to ensure signal health.</p>
        </div>

        <div className="space-y-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">D</div>
          <h5 className="font-black text-sm uppercase tracking-tight text-slate-800">Less is More</h5>
          <p className="text-xs text-slate-500 font-bold leading-relaxed">Do not overcomplicate setups with unneeded inserts, filters, or maxed-out volumes. Keep physical structures simple and robust.</p>
        </div>
      </div>

    </div>
  );
};
