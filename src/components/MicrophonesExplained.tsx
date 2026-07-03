import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Compass,
  ChevronLeft,
  ChevronRight
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

interface MicrophoneImageProps {
  mic: MicrophoneType;
}

const renderVectorMicrophone = (id: number) => {
  switch (id) {
    case 1: // Dynamic Mic
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          <defs>
            <linearGradient id="metalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          {/* Grill circle mesh */}
          <circle cx="50" cy="30" r="16" fill="url(#metalGrad1)" stroke="#22d3ee" strokeWidth="2" />
          <path d="M 34 30 L 66 30" stroke="#0891b2" strokeWidth="1" strokeDasharray="1 1" />
          <path d="M 50 14 L 50 46" stroke="#0891b2" strokeWidth="1" strokeDasharray="1 1" />
          {/* Mic neck */}
          <path d="M 42 45 L 58 45 L 54 85 L 46 85 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Ring separator */}
          <rect x="41" y="44" width="18" height="4" rx="1" fill="#0891b2" />
          {/* Switch */}
          <rect x="48" y="55" width="4" height="10" rx="1" fill="#334155" stroke="#38bdf8" strokeWidth="1" />
          <rect x="49" y="57" width="2" height="4" rx="0.5" fill="#22d3ee" />
        </svg>
      );
    case 2: // Condenser Mic
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          {/* Outer Shockmount elastic ring */}
          <circle cx="50" cy="50" r="28" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 4" />
          {/* Inner ring */}
          <circle cx="50" cy="50" r="18" fill="none" stroke="#0891b2" strokeWidth="1" />
          {/* Cross bands */}
          <line x1="25" y1="25" x2="75" y2="75" stroke="#334155" strokeWidth="1" />
          <line x1="75" y1="25" x2="25" y2="75" stroke="#334155" strokeWidth="1" />
          {/* Main capsule body */}
          <rect x="41" y="30" width="18" height="36" rx="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          {/* Grill texture */}
          <rect x="43" y="32" width="14" height="12" rx="1" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 1" />
          <line x1="41" y1="46" x2="59" y2="46" stroke="#38bdf8" strokeWidth="1.5" />
        </svg>
      );
    case 3: // Ribbon Mic
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          {/* Retro mounting bracket (U-shape) */}
          <path d="M 28 50 C 28 80, 72 80, 72 50" fill="none" stroke="#475569" strokeWidth="2.5" />
          {/* Side adjustment knobs */}
          <circle cx="28" cy="50" r="4" fill="#334155" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="72" cy="50" r="4" fill="#334155" stroke="#38bdf8" strokeWidth="1" />
          {/* Classic rectangular body */}
          <rect x="38" y="20" width="24" height="42" rx="4" fill="#1e293b" stroke="#22d3ee" strokeWidth="2" />
          {/* Horizontal grill bars */}
          <line x1="42" y1="26" x2="58" y2="26" stroke="#0891b2" strokeWidth="1.5" />
          <line x1="42" y1="32" x2="58" y2="32" stroke="#0891b2" strokeWidth="1.5" />
          <line x1="42" y1="38" x2="58" y2="38" stroke="#0891b2" strokeWidth="1.5" />
          <line x1="42" y1="44" x2="58" y2="44" stroke="#0891b2" strokeWidth="1.5" />
          {/* Ribbon indicator inside */}
          <path d="M 50 24 Q 52 35, 48 45 T 50 56" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 1" />
        </svg>
      );
    case 4: // Lavalier
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          {/* Clip */}
          <path d="M 32 55 L 68 55 L 62 60 L 38 60 Z" fill="#334155" stroke="#475569" strokeWidth="1" />
          <path d="M 40 55 L 45 42 L 55 42 L 60 55" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Small capsule */}
          <rect x="45" y="24" width="10" height="18" rx="5" fill="#1e293b" stroke="#22d3ee" strokeWidth="2" />
          {/* Grill cap */}
          <line x1="45" y1="29" x2="55" y2="29" stroke="#38bdf8" strokeWidth="1" />
          {/* Cable looping out */}
          <path d="M 50 42 C 50 55, 30 65, 50 85" fill="none" stroke="#0891b2" strokeWidth="1.5" />
        </svg>
      );
    case 5: // Shotgun Mic
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          {/* Long barrel horizontal layout (angled) */}
          <g transform="rotate(-30 50 50)">
            {/* Long tube */}
            <rect x="20" y="44" width="60" height="12" rx="1" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Windscreen ridges or slot pattern */}
            <line x1="25" y1="48" x2="25" y2="52" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="30" y1="48" x2="30" y2="52" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="35" y1="48" x2="35" y2="52" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="40" y1="48" x2="40" y2="52" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="45" y1="48" x2="45" y2="52" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="50" y1="48" x2="50" y2="52" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="55" y1="48" x2="55" y2="52" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="60" y1="48" x2="60" y2="52" stroke="#22d3ee" strokeWidth="1.5" />
            {/* Front grill mesh */}
            <path d="M 80 44 C 83 44, 83 56, 80 56 Z" fill="#0891b2" stroke="#22d3ee" strokeWidth="1" />
            {/* Pistol mount */}
            <rect x="52" y="56" width="6" height="14" rx="1" fill="#334155" stroke="#475569" strokeWidth="1" />
          </g>
        </svg>
      );
    case 6: // USB Mic
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          {/* U-shape desktop stand */}
          <path d="M 30 45 C 30 75, 70 75, 70 45" fill="none" stroke="#475569" strokeWidth="2.5" />
          {/* Stand stem and round base */}
          <line x1="50" y1="70" x2="50" y2="85" stroke="#475569" strokeWidth="3" />
          <ellipse cx="50" cy="85" rx="18" ry="4" fill="#334155" stroke="#475569" strokeWidth="1.5" />
          {/* Mic capsule */}
          <rect x="38" y="20" width="24" height="38" rx="10" fill="#1e293b" stroke="#22d3ee" strokeWidth="2" />
          {/* Grill section */}
          <rect x="41" y="23" width="18" height="15" rx="4" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="1.5 1.5" />
          {/* Center mute button */}
          <circle cx="50" cy="46" r="2.5" fill="#ef4444" />
        </svg>
      );
    case 7: // Boundary Mic
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          {/* Flat plate perspective */}
          <polygon points="15,70 50,45 85,70 50,85" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          {/* Center hemispherical capsule */}
          <ellipse cx="50" cy="65" rx="12" ry="7" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
          {/* Mesh perforations */}
          <line x1="44" y1="65" x2="56" y2="65" stroke="#22d3ee" strokeWidth="1" strokeDasharray="1 1" />
          <line x1="41" y1="63" x2="59" y2="63" stroke="#22d3ee" strokeWidth="1" strokeDasharray="1 1" />
          <line x1="43" y1="67" x2="57" y2="67" stroke="#22d3ee" strokeWidth="1" strokeDasharray="1 1" />
          {/* Connection port wire */}
          <path d="M 50 45 C 50 35, 30 25, 45 15" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );
    case 8: // Headset Mic
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          {/* Wire band arc */}
          <path d="M 20 50 C 20 15, 80 15, 80 50" fill="none" stroke="#475569" strokeWidth="2" />
          {/* Ear loops */}
          <path d="M 20 48 Q 16 48, 18 56 T 24 50" fill="none" stroke="#475569" strokeWidth="1.5" />
          <path d="M 80 48 Q 84 48, 82 56 T 76 50" fill="none" stroke="#475569" strokeWidth="1.5" />
          {/* Sleek thin boom arm */}
          <path d="M 20 50 Q 25 75, 48 78" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Tiny foam windshield capsule */}
          <rect x="47" y="73" width="9" height="10" rx="4" fill="#1e293b" stroke="#22d3ee" strokeWidth="1.5" />
        </svg>
      );
    case 9: // Wireless Mic
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          <defs>
            <linearGradient id="metalGrad9" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          {/* Wireless handheld chassis */}
          {/* Grill */}
          <circle cx="50" cy="24" r="14" fill="url(#metalGrad9)" stroke="#22d3ee" strokeWidth="2" />
          <line x1="36" y1="24" x2="64" y2="24" stroke="#0891b2" strokeWidth="1.5" />
          {/* Handle */}
          <path d="M 43 38 L 57 38 L 54 80 L 46 80 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          {/* LCD display screen */}
          <rect x="46" y="48" width="8" height="12" rx="1" fill="#0f172a" stroke="#0891b2" strokeWidth="1" />
          {/* Battery signal meter lines */}
          <line x1="48" y1="52" x2="52" y2="52" stroke="#22d3ee" strokeWidth="1" />
          <line x1="48" y1="55" x2="50" y2="55" stroke="#22d3ee" strokeWidth="1" />
          <line x1="48" y1="58" x2="51" y2="58" stroke="#22d3ee" strokeWidth="1" />
          {/* Bottom stubby transmitter antenna dome */}
          <path d="M 46 80 C 46 86, 54 86, 54 80 Z" fill="#0284c7" stroke="#22d3ee" strokeWidth="1" />
        </svg>
      );
    case 10: // Stereo Mic
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          {/* Shared bottom handle */}
          <path d="M 45 55 L 55 55 L 53 85 L 47 85 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Y coupling mount */}
          <path d="M 42 42 L 58 42 L 55 55 L 45 55 Z" fill="#0f172a" stroke="#0891b2" strokeWidth="1.5" />
          {/* Angle 1 Capsule (pointing left-up, 45 deg) */}
          <g transform="rotate(-45 42 42)">
            <rect x="36" y="16" width="12" height="24" rx="2" fill="#1e293b" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="36" y1="24" x2="48" y2="24" stroke="#0891b2" strokeWidth="1" />
          </g>
          {/* Angle 2 Capsule (pointing right-up, 45 deg) */}
          <g transform="rotate(45 58 42)">
            <rect x="52" y="16" width="12" height="24" rx="2" fill="#1e293b" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="52" y1="24" x2="64" y2="24" stroke="#0891b2" strokeWidth="1" />
          </g>
          {/* X-Y Angle text indicator */}
          <text x="50" y="50" fill="#22d3ee" fontSize="7" textAnchor="middle" fontWeight="black">90° XY</text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          <circle cx="50" cy="50" r="25" fill="none" stroke="#22d3ee" strokeWidth="2" />
          <path d="M 50 35 L 50 65 M 35 50 L 65 50" stroke="#22d3ee" strokeWidth="2" />
        </svg>
      );
  }
};

const MicrophoneImage: React.FC<MicrophoneImageProps> = ({ mic }) => {
  const [imgError, setImgError] = useState(false);
  const base = import.meta.env.BASE_URL || '/';
  const baseUrl = base.endsWith('/') ? base : `${base}/`;
  
  useEffect(() => {
    setImgError(false);
  }, [mic.id]);
  
  // Choose exactly one path based on the standardized name
  const filename = (() => {
    switch (mic.id) {
      case 1: return 'dynamic-microphone.png';
      case 2: return 'condenser-microphone.png';
      case 3: return 'ribbon-microphone.png';
      case 4: return 'lavalier-microphone.png';
      case 5: return 'shotgun-microphone.png';
      case 6: return 'usb-microphone.png';
      case 7: return 'boundary-microphone.png';
      case 8: return 'headset-microphone.png';
      case 9: return 'wireless-microphone.png';
      case 10: return 'stereo-microphone.png';
      default: return '';
    }
  })();

  const src = `${baseUrl}${filename}`;

  if (imgError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-white/5 shadow-inner">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 opacity-80 my-2">
          {renderVectorMicrophone(mic.id)}
        </div>
        <span className="text-[9px] font-black tracking-widest text-cyan-400/80 font-mono">VECTOR MODEL ACTIVE</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={mic.title}
      onError={() => setImgError(true)}
      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out" 
    />
  );
};

export const MicrophonesExplained: React.FC = () => {
  const [selectedMic, setSelectedMic] = useState<MicrophoneType>(MICROPHONE_TYPES_DATA[0]);
  const [filterType, setFilterType] = useState<string>('All');

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -180, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 180, behavior: 'smooth' });
    }
  };

  const filteredMics = useMemo(() => {
    if (filterType === 'All') return MICROPHONE_TYPES_DATA;
    
    return MICROPHONE_TYPES_DATA.filter(mic => {
      const titleLower = mic.title.toLowerCase();
      const bestForStr = mic.bestFor.join(' ').toLowerCase();
      
      if (filterType === 'Studio') {
        return (
          titleLower.includes('condenser') ||
          titleLower.includes('ribbon') ||
          titleLower.includes('usb') ||
          titleLower.includes('stereo') ||
          bestForStr.includes('studio') ||
          bestForStr.includes('acoustic') ||
          bestForStr.includes('vintage') ||
          bestForStr.includes('ambient')
        );
      }
      
      if (filterType === 'Live Stage') {
        return (
          titleLower.includes('dynamic') ||
          titleLower.includes('headset') ||
          titleLower.includes('wireless') ||
          bestForStr.includes('live') ||
          bestForStr.includes('stage') ||
          bestForStr.includes('choir') ||
          bestForStr.includes('performance') ||
          bestForStr.includes('drum') ||
          bestForStr.includes('theater')
        );
      }
      
      if (filterType === 'Video/Broadcast') {
        return (
          titleLower.includes('lavalier') ||
          titleLower.includes('shotgun') ||
          titleLower.includes('usb') ||
          titleLower.includes('headset') ||
          bestForStr.includes('video') ||
          bestForStr.includes('broadcast') ||
          bestForStr.includes('film') ||
          bestForStr.includes('interview') ||
          bestForStr.includes('meeting') ||
          bestForStr.includes('conference') ||
          bestForStr.includes('podcast') ||
          bestForStr.includes('game') ||
          bestForStr.includes('stream') ||
          bestForStr.includes('presentation')
        );
      }
      
      return true;
    });
  }, [filterType]);

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
    <div className="flex flex-col gap-6">
      {/* Definitions Def SVG definition */}
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="cardioidGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="metalSilver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
      </svg>

      {/* MOBILE ONLY: Horizontal Selector Card at the top */}
      <div className="block lg:hidden bg-white p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Mic2 className="text-blue-600 shrink-0" size={16} />
            <h3 className="text-xs sm:text-sm font-black uppercase italic tracking-tight text-slate-800">
              Microphone Guide
            </h3>
          </div>
          <span className="bg-blue-50 text-blue-700 font-extrabold text-[8px] sm:text-[9px] uppercase px-2 py-0.5 rounded-full">
            10 Types
          </span>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {['All', 'Studio', 'Live Stage', 'Video/Broadcast'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`py-1 px-2.5 rounded-lg text-[8px] sm:text-[9px] font-black tracking-wider uppercase transition-all ${
                filterType === filter
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Scroll Container Wrapper with side arrow buttons */}
        <div className="relative w-full px-1">
          {/* Left Arrow button */}
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 z-10 w-7 h-7 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-full flex items-center justify-center text-slate-700 active:scale-95 hover:bg-slate-50 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft size={14} className="stroke-[3.5]" />
          </button>

          {/* Mobile Horizontal Microphone Scroll Bar with custom clean scroll styling */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-3 pb-2.5 scroll-smooth select-none snap-x -mx-2 px-2 scrollbar-none"
          >
            {filteredMics.map((mic) => {
              const isSelected = mic.id === selectedMic.id;
              return (
                <button
                  key={mic.id}
                  onClick={() => setSelectedMic(mic)}
                  className={`snap-center shrink-0 p-3 w-[120px] rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 border-transparent text-white shadow-md scale-[0.98]'
                      : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`w-4 h-4 rounded-md flex items-center justify-center font-black text-[8px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {mic.id.toString().padStart(2, '0')}
                    </span>
                    <CheckCircle2 
                      size={11} 
                      className={`transition-all ${isSelected ? 'text-cyan-300 opacity-100' : 'text-slate-300 opacity-0'}`} 
                    />
                  </div>
                  
                  {/* Mini vector microphone preview */}
                  <div className="h-8 w-8 mx-auto opacity-90 my-0.5">
                    {renderVectorMicrophone(mic.id)}
                  </div>
                  
                  <div className="min-w-0 w-full">
                    <h4 className="text-[9px] font-black uppercase tracking-tight truncate text-center">
                      {mic.title.replace(' Microphone', '')}
                    </h4>
                  </div>
                </button>
              );
            })}
            {/* Spacer dummy element to perfectly solve the scroll cutting and right edge clipping issue */}
            <div className="w-8 shrink-0 h-4" />
          </div>

          {/* Right Arrow button */}
          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1.5 z-10 w-7 h-7 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-full flex items-center justify-center text-slate-700 active:scale-95 hover:bg-slate-50 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight size={14} className="stroke-[3.5]" />
          </button>
        </div>
      </div>

      {/* Main Grid Layout: Adapts on desktop to side-by-side, stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DESKTOP ONLY: Left Column Selector sidebar (Col span 5) */}
        <div className="hidden lg:grid lg:col-span-5 gap-6">
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

        {/* Right Column: Detailed parameters & visual sandbox (Col span 7 on Desktop, Full Width on Mobile) */}
        <div className="lg:col-span-7 grid gap-6">
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                Mic Type Profile #{selectedMic.id}
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-slate-800 mt-1.5">
                {selectedMic.title}
              </h3>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl py-1.5 px-2.5 flex items-center gap-2 self-start md:self-auto">
              <Award className="text-blue-500 shrink-0" size={14} />
              <div>
                <p className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Best Applied To</p>
                <p className="text-[10px] sm:text-[11px] font-black text-slate-700 leading-normal mt-0.5">{selectedMic.bestFor[0]}</p>
              </div>
            </div>
          </div>

          {/* Image & Pattern Split Display */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
            {/* Actual HD Image */}
            <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden h-32 sm:h-44 lg:h-56 border border-slate-200 bg-slate-50 p-2 sm:p-4 shadow-sm flex items-center justify-center">
              <MicrophoneImage key={selectedMic.id} mic={selectedMic} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/10 to-transparent flex items-end p-1.5 sm:p-3 pointer-events-none">
                <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-slate-700 bg-white/95 shadow-sm border border-slate-100 px-1.5 py-0.5 rounded-md">
                  Real Equipment Visual
                </span>
              </div>
            </div>

            {/* Interactive Polar Pattern Display */}
            <div className="bg-slate-950 rounded-xl sm:rounded-2xl h-32 sm:h-44 lg:h-56 p-2 sm:p-3.5 flex flex-col justify-between items-center border border-slate-900 shadow-inner relative text-white overflow-hidden">
              <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 bg-white/5 border border-white/10 rounded-full p-0.5 sm:p-1" title="Interactive Pickup Geometry">
                <Compass size={10} className="text-cyan-400" />
              </div>
              
              <div className="flex-1 flex items-center justify-center py-0.5 overflow-hidden scale-75 sm:scale-90 lg:scale-100">
                {renderPolarPatternSVG(selectedMic.polarPattern)}
              </div>

              <div className="w-full bg-white/5 p-1 sm:p-2 rounded-lg border border-white/5 text-center mt-0.5">
                <h5 className="text-[8px] sm:text-[10px] font-black uppercase text-cyan-400 mb-0.5 tracking-wider truncate">
                  Pickup: {selectedMic.polarPattern}
                </h5>
                <p className="text-[7px] sm:text-[9px] text-slate-300 font-semibold leading-tight line-clamp-2">
                  {selectedMic.polarPatternDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Key Features & Use Cases */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* Features (Bullet points matched to user image) */}
            <div className="bg-slate-50/50 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 flex flex-col justify-between gap-3">
              <div>
                <h4 className="text-[11px] sm:text-xs font-black uppercase text-slate-400 mb-2.5 tracking-wider flex items-center gap-1.5">
                  <span className="w-1 h-2.5 bg-blue-600 rounded-full" />
                  Key Features
                </h4>
                <div className="space-y-2">
                  {selectedMic.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex gap-1.5 items-start">
                      <span className="text-blue-500 text-xs mt-0.5 shrink-0">•</span>
                      <p className="text-[11px] sm:text-xs text-slate-600 font-bold leading-normal">{feat}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50/20 p-2 rounded-lg border border-blue-100/30 text-[8px] sm:text-[9px] font-black text-blue-700 uppercase tracking-wider text-center">
                No Simulated Logic • Real Specs
              </div>
            </div>

            {/* Target Use cases (Best For grid) */}
            <div className="bg-slate-50/50 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100">
              <h4 className="text-[11px] sm:text-xs font-black uppercase text-slate-400 mb-2.5 tracking-wider flex items-center gap-1.5">
                <span className="w-1 h-2.5 bg-indigo-600 rounded-full" />
                Best For (Use Cases)
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {selectedMic.bestFor.map((use, uIdx) => (
                  <div key={uIdx} className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-100 flex items-center gap-2.5 hover:border-indigo-200 transition-colors">
                    <div className="bg-indigo-50 text-indigo-600 p-1 rounded-lg shrink-0">
                      {use.includes('Vocal') && <Mic size={12} />}
                      {use.includes('Drum') && <Waves size={12} />}
                      {use.includes('Amp') && <Volume2 size={12} />}
                      {use.includes('Acoustic') && <Music size={12} />}
                      {use.includes('Podcast') && <Volume1 size={12} />}
                      {use.includes('Cabinet') && <Volume2 size={12} />}
                      {use.includes('Brass') && <Music size={12} />}
                      {use.includes('String') && <Music size={12} />}
                      {use.includes('Video') && <Video size={12} />}
                      {use.includes('Interview') && <PhoneCall size={12} />}
                      {use.includes('Presentation') && <Tv size={12} />}
                      {use.includes('Gaming') && <Gamepad2 size={12} />}
                      {use.includes('Streaming') && <Laptop size={12} />}
                      {use.includes('Conference') && <PhoneCall size={12} />}
                      {use.includes('Meeting') && <Tv size={12} />}
                      {use.includes('Fitness') && <Activity size={12} />}
                      {use.includes('Speaking') && <Volume1 size={12} />}
                      {use.includes('Performance') && <Mic size={12} />}
                      {use.includes('Choir') && <Waves size={12} />}
                      {use.includes('Ambience') && <Waves size={12} />}
                    </div>
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{use}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pro Tips / Application Notes */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/20 to-indigo-50/10 rounded-2xl sm:rounded-3xl border border-blue-100/40 flex gap-3">
            <div className="bg-blue-600 text-white rounded-xl p-1.5 h-8 w-8 flex items-center justify-center shrink-0 shadow-sm">
              <Info size={15} />
            </div>
            <div>
              <h5 className="text-[11px] sm:text-xs font-black uppercase text-blue-800 tracking-tight">
                Senior Sound Consultant Notes
              </h5>
              <p className="text-[11px] sm:text-xs text-slate-600 font-semibold mt-0.5 leading-relaxed">
                {selectedMic.proTips}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* MOBILE ONLY: Polar Pattern Overview Panel at the bottom */}
    <div className="block lg:hidden bg-slate-900 text-white p-5 rounded-[2rem] border border-slate-800 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Compass className="text-cyan-400 shrink-0" size={16} />
        <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
          Understanding Polar Patterns
        </h4>
      </div>
      <p className="text-[11px] text-slate-300 leading-relaxed mb-4 font-semibold">
        A microphone's polar pattern dictates how sensitive it is to sounds arriving from different angles. Picking the correct pattern is crucial for isolation and feedback rejection.
      </p>
      <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-400 font-mono">
        <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-800">
          <span className="text-cyan-400 block mb-0.5">● Cardioid</span>
          Front pickup. Keeps stage bleed out.
        </div>
        <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-800">
          <span className="text-cyan-400 block mb-0.5">● Omnidirectional</span>
          360° capture. Natural room acoustics.
        </div>
        <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-800">
          <span className="text-cyan-400 block mb-0.5">● Figure-8</span>
          Front and back. Rejects side sounds.
        </div>
        <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-800">
          <span className="text-cyan-400 block mb-0.5">● Shotgun</span>
          Super directional front-focused beam.
        </div>
      </div>
    </div>
  </div>
  );
};
