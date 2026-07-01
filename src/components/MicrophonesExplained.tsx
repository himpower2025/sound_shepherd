import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Mic2, 
  Check, 
  Sparkles, 
  Waves, 
  Tv, 
  Gamepad2, 
  Laptop, 
  Volume2, 
  Award, 
  Info, 
  HelpCircle, 
  Activity, 
  Video, 
  PhoneCall, 
  Music,
  Maximize2,
  ListFilter,
  CheckCircle2,
  Volume1,
  Compass
} from 'lucide-react';

interface MicrophoneType {
  id: number;
  title: string;
  features: string[];
  bestFor: string[];
  imageUrl: string;
  polarPattern: 'Cardioid' | 'Supercardioid' | 'Omnidirectional' | 'Figure-8' | 'Shotgun' | 'Stereo';
  polarPatternDesc: string;
  proTips: string;
}

const MICROPHONE_TYPES_DATA: MicrophoneType[] = [
  {
    id: 1,
    title: 'Dynamic Microphone',
    features: [
      'Rugged and durable build quality',
      'Handles extremely loud sound sources easily',
      'No external phantom power required'
    ],
    bestFor: ['Live Vocals', 'Drums', 'Guitar Amps'],
    imageUrl: '/dynamic-microphone.png',
    polarPattern: 'Cardioid',
    polarPatternDesc: 'Picks up sound from the front while rejecting ambient noise from the rear. Ideal for noisy stages.',
    proTips: 'The absolute workhorse for live stages. If you are mic’ing a loud snare drum or a screaming vocalist, this is your safest choice. It resists feedback incredibly well.'
  },
  {
    id: 2,
    title: 'Condenser Microphone',
    features: [
      'Highly sensitive with rich, detailed sound',
      'Excellent high-frequency response capturing nuances',
      'Requires +48V phantom power to operate'
    ],
    bestFor: ['Studio Vocals', 'Acoustic Instruments', 'Podcasts'],
    imageUrl: '/condenser-microphone.png',
    polarPattern: 'Cardioid',
    polarPatternDesc: 'Highly sensitive heart-shaped pickup area. Captures subtle room acoustics along with the direct signal.',
    proTips: 'Perfect for controlled environments like recording studios. Because they are so sensitive, avoid using them on loud live stages near heavy monitor wedges to prevent feedback.'
  },
  {
    id: 3,
    title: 'Ribbon Microphone',
    features: [
      'Produces a warm, smooth, natural vintage tone',
      'Extremely delicate ribbon element inside',
      'Highly responsive to transients and high-frequency details'
    ],
    bestFor: ['Guitar Cabinets', 'Brass', 'Strings', 'Vintage Recordings'],
    imageUrl: '/ribbon-microphone.png',
    polarPattern: 'Figure-8',
    polarPatternDesc: 'Picks up sound equally from the front and back, while completely rejecting sounds coming from the sides.',
    proTips: 'Ribbon mics have a vintage vibe. Never apply +48V phantom power to passive ribbon mics as it can permanently damage or tear the delicate aluminum ribbon element.'
  },
  {
    id: 4,
    title: 'Lavalier (Lapel) Microphone',
    features: [
      'Ultra-small, clip-on design for discreet mounting',
      'Provides consistent hands-free operation',
      'Highly portable and easy to hide in clothing'
    ],
    bestFor: ['Interviews', 'Presentations', 'YouTube Videos', 'TV Broadcasting'],
    imageUrl: '/lavalier-microphone.png',
    polarPattern: 'Omnidirectional',
    polarPatternDesc: 'Picks up sound from all directions (360 degrees) evenly, allowing consistent voice capture during body movement.',
    proTips: 'Position the mic about 6-8 inches below the chin. Placing it too high results in a boomy "chest-resonance" sound, while placing it too low sounds thin and distant.'
  },
  {
    id: 5,
    title: 'Shotgun Microphone',
    features: [
      'Extremely directional narrow pickup pattern',
      'Long-distance reach capturing clear distant audio',
      'Excellent rejection of side-axis ambient noises'
    ],
    bestFor: ['Filmmaking', 'Broadcasting', 'Outdoor Recording'],
    imageUrl: '/shotgun-microphone.png',
    polarPattern: 'Shotgun',
    polarPatternDesc: 'Uses an interference tube to cancel out side-axis sounds, resulting in a razor-sharp front-focused beam.',
    proTips: 'Ensure you point the shotgun mic directly at the speaker’s mouth. Even a slight angle off-axis can cause severe high-frequency loss due to the narrow beam.'
  },
  {
    id: 6,
    title: 'USB Microphone',
    features: [
      'Plug-and-play simplicity via USB cable',
      'Built-in audio interface and headphone amp',
      'No external mixers or audio interfaces needed'
    ],
    bestFor: ['Streaming', 'Gaming', 'Podcasts', 'Online Meetings'],
    imageUrl: '/usb-microphone.png',
    polarPattern: 'Cardioid',
    polarPatternDesc: 'Heart-shaped pickup, perfect for single users speaking directly into the microphone on a desk.',
    proTips: 'Ideal for beginners and home offices. Use a pop filter and keep the mic close (4-6 inches) to reduce keyboard tapping noises and room echoes.'
  },
  {
    id: 7,
    title: 'Boundary (PZM) Microphone',
    features: [
      'Designed to be placed directly on flat surfaces (walls/tables)',
      'Captures full room sound evenly with minimal reflections',
      'Eliminates phase cancellation from table surface bounces'
    ],
    bestFor: ['Conference Rooms', 'Theater Stages', 'Board Meetings'],
    imageUrl: '/boundary-microphone.png',
    polarPattern: 'Omnidirectional',
    polarPatternDesc: 'Hemispherical pattern. Picks up all sounds in the hemisphere above the flat mounting surface.',
    proTips: 'Place these in the center of conference tables or at the front edge of theater stages. They capture voices naturally without needing a forest of visible stands.'
  },
  {
    id: 8,
    title: 'Headset Microphone',
    features: [
      'Worn directly on the head for absolute mic distance stability',
      'Leaves both hands completely free during movement',
      'Very high gain-before-feedback due to ultra-close mouth proximity'
    ],
    bestFor: ['Fitness Instructors', 'Public Speaking', 'Live Stage Performances'],
    imageUrl: '/headset-microphone.png',
    polarPattern: 'Cardioid',
    polarPatternDesc: 'Cardioid or Hypercardioid element placed inches from the mouth to isolate the voice from PA speaker bleed.',
    proTips: 'Make sure the capsule is positioned slightly to the side of the mouth, not directly in front of it. This prevents harsh "pop" wind noises when speaking.'
  },
  {
    id: 9,
    title: 'Wireless Microphone',
    features: [
      'Provides cable-free mobility and freedom on stage',
      'Available as handheld, headset, or clip-on lavalier kits',
      'Reliable RF transmitter and receiver synchronization'
    ],
    bestFor: ['Stage Performances', 'Live Events', 'Presentations'],
    imageUrl: '/wireless-microphone.png',
    polarPattern: 'Cardioid',
    polarPatternDesc: 'Usually cardioid capsules, designed to reject stage monitors and focus purely on the performer’s voice.',
    proTips: 'Always use fresh batteries and check RF frequencies before the show to avoid interference. Keep a clear, unobstructed line-of-sight between transmitter and receiver antennas.'
  },
  {
    id: 10,
    title: 'Stereo Microphone',
    features: [
      'Houses two microphone capsules in a single body',
      'Captures realistic stereo width and acoustic spatial imaging',
      'Saves setup time compared to aligning two separate mics'
    ],
    bestFor: ['Live Concerts', 'Choirs', 'Acoustic Performances', 'Ambient Recording'],
    imageUrl: '/stereo-microphone.png',
    polarPattern: 'Stereo',
    polarPatternDesc: 'Combines two cardiod capsules arranged in specialized stereo configurations (like XY or Mid-Side).',
    proTips: 'Perfect for choir ensembles or acoustic guitar tracking where you want an immersive, wide soundstage without phase cancellation headaches.'
  }
];

export const MicrophonesExplained: React.FC = () => {
  const [selectedMic, setSelectedMic] = useState<MicrophoneType>(MICROPHONE_TYPES_DATA[0]);
  const [filterType, setFilterType] = useState<string>('All');

  const filteredMics = filterType === 'All'
    ? MICROPHONE_TYPES_DATA
    : MICROPHONE_TYPES_DATA.filter(mic => {
        if (filterType === 'Studio') {
          return mic.bestFor.includes('Studio Vocals') || mic.bestFor.includes('Acoustic Instruments') || mic.bestFor.includes('Vintage Recordings');
        }
        if (filterType === 'Live Stage') {
          return mic.bestFor.includes('Live Vocals') || mic.bestFor.includes('Live Stage Performances') || mic.bestFor.includes('Stage Performances') || mic.bestFor.includes('Drums');
        }
        if (filterType === 'Video/Broadcast') {
          return mic.bestFor.includes('Interviews') || mic.bestFor.includes('YouTube Videos') || mic.bestFor.includes('Filmmaking') || mic.bestFor.includes('Broadcasting');
        }
        return true;
      });

  // Render polar pattern pickup geometry dynamically using SVG
  const renderPolarPatternSVG = (pattern: string) => {
    switch (pattern) {
      case 'Cardioid':
        return (
          <svg viewBox="0 0 120 120" className="w-24 h-24">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="60" cy="60" r="30" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
            {/* Heart shape (Cardioid pattern) */}
            <path 
              d="M 60 90 C 35 70, 20 40, 40 25 C 50 15, 60 30, 60 30 C 60 30, 70 15, 80 25 C 100 40, 85 70, 60 90 Z" 
              fill="url(#cardioidGlow)" 
              stroke="#06b6d4" 
              strokeWidth="2" 
            />
            {/* Mic icon representation */}
            <circle cx="60" cy="65" r="5" fill="#e2e8f0" />
            <line x1="60" y1="70" x2="60" y2="80" stroke="#e2e8f0" strokeWidth="2" />
            <text x="60" y="112" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">CARDIOID</text>
          </svg>
        );
      case 'Supercardioid':
        return (
          <svg viewBox="0 0 120 120" className="w-24 h-24">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="60" cy="60" r="30" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
            {/* Supercardioid front lobe and small back lobe */}
            <path 
              d="M 60 85 C 40 70, 30 45, 45 30 C 53 22, 60 35, 60 35 C 60 35, 67 22, 75 30 C 90 45, 80 70, 60 85 Z" 
              fill="url(#cardioidGlow)" 
              stroke="#06b6d4" 
              strokeWidth="2" 
            />
            {/* Rear tiny lobe */}
            <ellipse cx="60" cy="100" rx="10" ry="12" fill="url(#cardioidGlow)" stroke="#06b6d4" strokeWidth="1.5" />
            {/* Mic icon representation */}
            <circle cx="60" cy="65" r="5" fill="#e2e8f0" />
            <line x1="60" y1="70" x2="60" y2="80" stroke="#e2e8f0" strokeWidth="2" />
            <text x="60" y="112" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">SUPERCARDIOID</text>
          </svg>
        );
      case 'Omnidirectional':
        return (
          <svg viewBox="0 0 120 120" className="w-24 h-24">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="60" cy="60" r="30" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
            {/* Full 360 circle */}
            <circle cx="60" cy="60" r="42" fill="url(#cardioidGlow)" stroke="#06b6d4" strokeWidth="2" />
            {/* Mic icon representation */}
            <circle cx="60" cy="60" r="5" fill="#e2e8f0" />
            <line x1="60" y1="65" x2="60" y2="75" stroke="#e2e8f0" strokeWidth="2" />
            <text x="60" y="112" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">OMNIDIRECTIONAL</text>
          </svg>
        );
      case 'Figure-8':
        return (
          <svg viewBox="0 0 120 120" className="w-24 h-24">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="60" cy="60" r="30" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
            {/* Front lobe */}
            <circle cx="60" cy="38" r="23" fill="url(#cardioidGlow)" stroke="#06b6d4" strokeWidth="2" />
            {/* Rear lobe */}
            <circle cx="60" cy="82" r="23" fill="url(#cardioidGlow)" stroke="#06b6d4" strokeWidth="2" />
            {/* Mic icon representation */}
            <circle cx="60" cy="60" r="5" fill="#e2e8f0" />
            <text x="60" y="112" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">FIGURE-8</text>
          </svg>
        );
      case 'Shotgun':
        return (
          <svg viewBox="0 0 120 120" className="w-24 h-24">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="60" cy="60" r="30" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
            {/* Extremely narrow top beam */}
            <ellipse cx="60" cy="35" rx="14" ry="32" fill="url(#cardioidGlow)" stroke="#06b6d4" strokeWidth="2" />
            {/* Small rear/side lobes */}
            <circle cx="45" cy="75" r="6" fill="url(#cardioidGlow)" stroke="#06b6d4" strokeWidth="1" />
            <circle cx="75" cy="75" r="6" fill="url(#cardioidGlow)" stroke="#06b6d4" strokeWidth="1" />
            <circle cx="60" cy="82" r="8" fill="url(#cardioidGlow)" stroke="#06b6d4" strokeWidth="1" />
            {/* Mic icon representation */}
            <circle cx="60" cy="65" r="4" fill="#e2e8f0" />
            <line x1="60" y1="69" x2="60" y2="85" stroke="#e2e8f0" strokeWidth="1.5" />
            <text x="60" y="112" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">SHOTGUN</text>
          </svg>
        );
      case 'Stereo':
        return (
          <svg viewBox="0 0 120 120" className="w-24 h-24">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="60" cy="60" r="30" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
            {/* XY pattern (two cardioids tilted 90 deg) */}
            <g transform="rotate(-45 60 60)">
              <path 
                d="M 60 75 C 45 60, 35 40, 48 30 C 55 23, 60 33, 60 33 C 60 33, 65 23, 72 30 C 85 40, 75 60, 60 75 Z" 
                fill="url(#cardioidGlow)" 
                stroke="#06b6d4" 
                strokeWidth="1.5" 
                opacity="0.8"
              />
            </g>
            <g transform="rotate(45 60 60)">
              <path 
                d="M 60 75 C 45 60, 35 40, 48 30 C 55 23, 60 33, 60 33 C 60 33, 65 23, 72 30 C 85 40, 75 60, 60 75 Z" 
                fill="url(#cardioidGlow)" 
                stroke="#06b6d4" 
                strokeWidth="1.5" 
                opacity="0.8"
              />
            </g>
            <circle cx="60" cy="65" r="5" fill="#e2e8f0" />
            <text x="60" y="112" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">STEREO XY</text>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Definitions Def SVG definition */}
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="cardioidGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>

      {/* Left Column: Selector sidebar (Col span 5) */}
      <div className="lg:col-span-5 grid gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Mic2 className="text-blue-600 shrink-0" size={20} />
              <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-800">
                Microphone Types
              </h3>
            </div>
            <span className="bg-blue-50 text-blue-700 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full">
              10 Essential
            </span>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {['All', 'Studio', 'Live Stage', 'Video/Broadcast'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`py-1 px-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all ${
                  filterType === filter
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Microphones List */}
          <div className="grid grid-cols-1 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredMics.map((mic) => {
              const isSelected = mic.id === selectedMic.id;
              return (
                <button
                  key={mic.id}
                  onClick={() => setSelectedMic(mic)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 border-transparent text-white shadow-xl scale-[0.99]'
                      : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-500'
                    }`}>
                      {mic.id.toString().padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight truncate">
                        {mic.title}
                      </h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mic.bestFor.slice(0, 2).map((useCase) => (
                          <span 
                            key={useCase} 
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate max-w-[90px] ${
                              isSelected ? 'bg-white/10 text-indigo-100' : 'bg-slate-200/50 text-slate-500'
                            }`}
                          >
                            {useCase}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <CheckCircle2 
                      size={18} 
                      className={`transition-all ${isSelected ? 'text-cyan-300 opacity-100 scale-110' : 'text-slate-300 opacity-0'}`} 
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Polar Pattern Overview Panel */}
        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="text-cyan-400 shrink-0" size={18} />
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
              Understanding Polar Patterns
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4 font-semibold">
            A microphone's polar pattern dictates how sensitive it is to sounds arriving from different angles. Picking the correct pattern is crucial for isolation and feedback rejection.
          </p>
          <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-400 font-mono">
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <span className="text-cyan-400 block mb-0.5">● Cardioid</span>
              Front pickup. Keeps stage bleed out.
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <span className="text-cyan-400 block mb-0.5">● Omnidirectional</span>
              360° capture. Natural room acoustics.
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <span className="text-cyan-400 block mb-0.5">● Figure-8</span>
              Front and back. Rejects side sounds.
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <span className="text-cyan-400 block mb-0.5">● Shotgun</span>
              Super directional front-focused beam.
            </div>
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
                Mic Type Profile #{selectedMic.id}
              </span>
              <h3 className="text-2xl font-black uppercase italic tracking-tight text-slate-800 mt-2">
                {selectedMic.title}
              </h3>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl py-2 px-3 flex items-center gap-2 self-start md:self-auto">
              <Award className="text-blue-500" size={16} />
              <div>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Best Applied To</p>
                <p className="text-[11px] font-black text-slate-700 leading-normal mt-0.5">{selectedMic.bestFor[0]}</p>
              </div>
            </div>
          </div>

          {/* Image & Pattern Split Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Actual HD Image */}
            <div className="relative group rounded-3xl overflow-hidden aspect-[4/3] border border-slate-200 bg-slate-900 shadow-md">
              <img 
                src={selectedMic.imageUrl} 
                alt={selectedMic.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-slate-950/40 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                  Real Equipment Visual
                </span>
              </div>
            </div>

            {/* Interactive Polar Pattern Display */}
            <div className="bg-slate-950 rounded-3xl p-4 flex flex-col justify-between items-center border border-slate-900 shadow-inner relative text-white">
              <div className="absolute top-3 left-3 bg-white/5 border border-white/10 rounded-full p-1.5" title="Interactive Pickup Geometry">
                <Compass size={14} className="text-cyan-400" />
              </div>
              
              <div className="flex-1 flex items-center justify-center py-2">
                {renderPolarPatternSVG(selectedMic.polarPattern)}
              </div>

              <div className="w-full bg-white/5 p-3 rounded-2xl border border-white/5 text-center mt-2">
                <h5 className="text-[10px] font-black uppercase text-cyan-400 mb-1 tracking-wider">
                  Pickup: {selectedMic.polarPattern}
                </h5>
                <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                  {selectedMic.polarPatternDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Key Features & Use Cases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Features (Bullet points matched to user image) */}
            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-blue-600 rounded-full" />
                  Key Features
                </h4>
                <div className="space-y-2.5">
                  {selectedMic.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex gap-2 items-start">
                      <span className="text-blue-500 text-xs mt-0.5">•</span>
                      <p className="text-xs text-slate-600 font-bold leading-normal">{feat}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50/20 p-2.5 rounded-xl border border-blue-100/30 text-[9px] font-black text-blue-700 uppercase tracking-wider text-center mt-3">
                No Simulated Logic • Real Specs
              </div>
            </div>

            {/* Target Use cases (Best For grid) */}
            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
              <h4 className="text-xs font-black uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-indigo-600 rounded-full" />
                Best For (Use Cases)
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {selectedMic.bestFor.map((use, uIdx) => (
                  <div key={uIdx} className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-3 hover:border-indigo-200 transition-colors">
                    <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-xl">
                      {use.includes('Vocal') && <Mic size={14} />}
                      {use.includes('Drum') && <Waves size={14} />}
                      {use.includes('Amp') && <Volume2 size={14} />}
                      {use.includes('Acoustic') && <Music size={14} />}
                      {use.includes('Podcast') && <Volume1 size={14} />}
                      {use.includes('Cabinet') && <Volume2 size={14} />}
                      {use.includes('Brass') && <Music size={14} />}
                      {use.includes('String') && <Music size={14} />}
                      {use.includes('Video') && <Video size={14} />}
                      {use.includes('Interview') && <PhoneCall size={14} />}
                      {use.includes('Presentation') && <Tv size={14} />}
                      {use.includes('Gaming') && <Gamepad2 size={14} />}
                      {use.includes('Streaming') && <Laptop size={14} />}
                      {use.includes('Conference') && <PhoneCall size={14} />}
                      {use.includes('Meeting') && <Tv size={14} />}
                      {use.includes('Fitness') && <Activity size={14} />}
                      {use.includes('Speaking') && <Volume1 size={14} />}
                      {use.includes('Performance') && <Mic size={14} />}
                      {use.includes('Choir') && <Waves size={14} />}
                      {use.includes('Ambience') && <Waves size={14} />}
                    </div>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{use}</span>
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
                Senior Sound Consultant Notes
              </h5>
              <p className="text-xs text-slate-600 font-semibold mt-1 leading-relaxed">
                {selectedMic.proTips}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
