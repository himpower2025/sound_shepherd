import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Info } from 'lucide-react';

const FREQUENCY_DATA = [
  { range: 'Sub Bass', freq: '20-60 Hz', description: 'The foundation. Feel the power of the kick drum and bass without overdoing it.', color: 'bg-indigo-900' },
  { range: 'Bass', freq: '60-250 Hz', description: 'Thickness and warmth. Also houses the fundamental "body" of many vocals.', color: 'bg-indigo-700' },
  { range: 'Low Mids', freq: '250-500 Hz', description: 'The "Mud" zone. Too much makes the mix sound cloudy/cluttered.', color: 'bg-indigo-500' },
  { range: 'Mid Range', freq: '500 Hz - 2 kHz', description: 'Core of instruments and vocals. Essential for projection and clarity.', color: 'bg-blue-500' },
  { range: 'High Mids', freq: '2-4 kHz', description: 'Definition and "edge". Boost for clarity, but watch for harshness.', color: 'bg-cyan-500' },
  { range: 'Presence', freq: '4-6 kHz', description: 'Closeness and definition. Brings elements to the front of the mix.', color: 'bg-emerald-500' },
  { range: 'Brilliance', freq: '6-20 kHz', description: 'Airy qualities and high-end sizzle. Adds sparkle to acoustic sources.', color: 'bg-yellow-500' }
];

const INSTRUMENT_RANGES = [
  { name: 'Vocals', start: 10, end: 90, color: 'bg-rose-400' },
  { name: 'Acoustic Guitar', start: 15, end: 85, color: 'bg-orange-400' },
  { name: 'Bass Guitar', start: 5, end: 40, color: 'bg-slate-700' },
  { name: 'Kick Drum', start: 2, end: 35, color: 'bg-slate-900' },
  { name: 'Cymbals', start: 60, end: 98, color: 'bg-yellow-400' }
];

export const FrequencyReference: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Frequency IQ</h2>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest leading-none">SPECTRUM ANALYSIS REFERENCE</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative h-24 bg-black/40 rounded-2xl border border-white/5 flex items-center overflow-hidden">
             {/* Gradient Background */}
             <div className="absolute inset-0 flex">
                {FREQUENCY_DATA.map((d, i) => (
                    <div key={i} className="flex-1 h-full opacity-10" style={{ backgroundColor: d.color.replace('bg-', '') }}></div>
                ))}
             </div>
             
             {/* Grid Lines */}
             <div className="absolute inset-0 flex justify-between px-4 pointer-events-none opacity-20">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-px h-full bg-white"></div>
                ))}
             </div>

             <div className="relative w-full px-6 flex justify-between items-center z-10">
                <span className="text-[8px] font-mono text-slate-500">20Hz</span>
                <span className="text-[8px] font-mono text-slate-500">100Hz</span>
                <span className="text-[8px] font-mono text-slate-500">1kHz</span>
                <span className="text-[8px] font-mono text-slate-500">10kHz</span>
                <span className="text-[8px] font-mono text-slate-500">20kHz</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FREQUENCY_DATA.map((data, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 group transition-all hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <span className={`w-2 h-2 rounded-full ${data.color}`}></span>
                  <span className="text-[10px] font-mono text-blue-400">{data.freq}</span>
                </div>
                <h4 className="text-white font-black uppercase text-xs tracking-widest">{data.range}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{data.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black uppercase italic tracking-tighter mb-6 flex items-center gap-2">
            <Info size={20} className="text-blue-600" />
            Instrument Footprints
        </h3>
        
        <div className="space-y-6">
          {INSTRUMENT_RANGES.map((inst, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>{inst.name}</span>
              </div>
              <div className="h-6 bg-slate-50 rounded-full border border-slate-100 relative overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${inst.end - inst.start}%`, left: `${inst.start}%` }}
                  className={`absolute h-full ${inst.color} opacity-80 rounded-full shadow-lg shadow-blue-900/10`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
