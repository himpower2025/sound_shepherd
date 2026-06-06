import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle, Activity, Power, Volume2, CircleDot, Trash2,
  ChevronRight, ChevronLeft, Play, Square, Music, Waves, Mic, MicOff,
  LogIn, LogOut, Save, Download
} from 'lucide-react';
import { 
  onSnapshot, collection, addDoc, query, orderBy, 
  serverTimestamp, doc, setDoc, getDoc, deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import { 
  signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser 
} from 'firebase/auth';
import { auth, db, googleProvider } from '../lib/firebase';
import { Logo } from './Logo';

// ─────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // In a real app, you might show a toast here.
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ChannelData {
  id: number;
  name: string;
  color: string;
  gain: number;
  pan: number;
  fader: number;
  muted: boolean;
  solo: boolean;
  hpf: boolean;
  eq: { high: number; mid: number; midFreq: number; low: number };
  comp: { threshold: number; ratio: number; attack: number; release: number };
  reverb: number;
}

interface Song {
  id: string;
  title: string;
  url: string;
  artist?: string;
  /** 'file' = direct MP3/audio URL  |  'youtube' = YouTube embed */
  type: 'file' | 'youtube';
}

// ─────────────────────────────────────────────
// Song List
// NOTE: 'file' type = full Web Audio API control
//       'youtube' type = video display + IFrame volume sync only
//       Full EQ/Pan on YouTube blocked by browser same-origin policy.
// ─────────────────────────────────────────────
const SONGS: Song[] = [
  { id: 'guide-01', title: 'Guide Session 01 (Acoustic Folk)', artist: 'Session Guide', url: '', type: 'file' },
  { id: 'guide-02', title: 'Guide Session 02 (Worship Piano)', artist: 'Session Guide', url: '', type: 'file' },
  { id: 'guide-03', title: 'Guide Session 03 (Symphonic Organ)', artist: 'Session Guide', url: '', type: 'file' },
  { id: 'guide-04', title: 'Guide Session 04 (Vocal Harmonics)', artist: 'Session Guide', url: '', type: 'file' },
  { id: 'guide-05', title: 'Guide Session 05 (Worship Pad Intro)', artist: 'Session Guide', url: '', type: 'file' },
  { id: 'guide-06', title: 'Guide Session 06 (Full Praise Band)', artist: 'Session Guide', url: '', type: 'file' },
  { id: 'guide-07', title: 'Guide Session 07 (Speech Intelligibility)', artist: 'Session Guide', url: '', type: 'file' },
  { id: 'guide-08', title: 'Guide Session 08 (Ambient Sanctuary Choir)', artist: 'Session Guide', url: '', type: 'file' }
];

const INITIAL_CHANNELS: ChannelData[] = [
  { 
    id: 1, 
    name: 'Vocals', 
    color: 'bg-amber-500/20', 
    gain: 50, 
    pan: 0, 
    fader: 75, 
    muted: false, 
    solo: false, 
    hpf: true, 
    eq: { high: 2, mid: 1, midFreq: 1500, low: -3 }, 
    comp: { threshold: -20, ratio: 4, attack: 15, release: 150 }, 
    reverb: 30 
  },
  { 
    id: 2, 
    name: 'Guitar/Piano', 
    color: 'bg-orange-500/15', 
    gain: 45, 
    pan: -20, 
    fader: 70, 
    muted: false, 
    solo: false, 
    hpf: true, 
    eq: { high: 3, mid: -1, midFreq: 800, low: -2 }, 
    comp: { threshold: -15, ratio: 3, attack: 25, release: 200 }, 
    reverb: 15 
  },
  { 
    id: 3, 
    name: 'Bass Guitar', 
    color: 'bg-blue-500/15', 
    gain: 40, 
    pan: 0, 
    fader: 65, 
    muted: false, 
    solo: false, 
    hpf: false, 
    eq: { high: -4, mid: 2, midFreq: 250, low: 3 }, 
    comp: { threshold: -25, ratio: 5, attack: 10, release: 100 }, 
    reverb: 0 
  },
  { 
    id: 4, 
    name: 'Drums', 
    color: 'bg-emerald-500/15', 
    gain: 45, 
    pan: 15, 
    fader: 70, 
    muted: false, 
    solo: false, 
    hpf: false, 
    eq: { high: 4, mid: 0, midFreq: 1000, low: 2 }, 
    comp: { threshold: -18, ratio: 6, attack: 5, release: 80 }, 
    reverb: 5 
  }
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

async function fetchYouTubeTitle(url: string): Promise<{ title: string; author: string }> {
  // Real OEmbed call for accurate titles
  try {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) throw new Error("Invalid ID");
    const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    const data = await response.json();
    return { 
      title: data.title || "YouTube Track", 
      author: data.author_name || "Unknown Artist" 
    };
  } catch (e) {
    return { title: 'New Community Track', author: 'YouTube' };
  }
}

function getYouTubeEmbedUrl(url: string): string {
  const id = getYouTubeVideoId(url) || '';
  return `https://www.youtube.com/embed/${id}?enablejsapi=1&controls=1&rel=0&modestbranding=1`;
}

// Generates a professional synthetic impulse response for reverb effect (zero assets/fetch needed!)
function createReverbImpulseResponse(ctx: BaseAudioContext, duration: number, decay: number) {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

// ─────────────────────────────────────────────
// Interactive 3D Analog Knob Component
// ─────────────────────────────────────────────
interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  colorClass?: string;
  unit?: string;
}

const Knob: React.FC<KnobProps> = ({ label, value, min, max, onChange, colorClass = "text-blue-500", unit = "" }) => {
  const knobRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startVal = value;
    const range = max - min;
    const speed = 0.5; // Drag sensitivity multiplier

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaY = startY - moveEvent.clientY; // Dragging UP increases value
      const newVal = Math.min(max, Math.max(min, startVal + (deltaY * (range / 150)) * speed));
      onChange(Math.round(newVal * 10) / 10);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Map value to rotation angle (-135 degrees to +135 degrees)
  const percent = (value - min) / (max - min);
  const angle = -135 + percent * 270;

  return (
    <div className="flex flex-col items-center select-none group">
      <div 
        ref={knobRef}
        onPointerDown={handlePointerDown}
        className="relative w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600/40 shadow-md cursor-ns-resize flex items-center justify-center active:scale-95 transition-transform"
      >
        {/* Notch indicator line */}
        <motion.div 
          className="absolute w-0.5 h-3 bg-blue-400 rounded-full origin-bottom"
          style={{ 
            transform: `rotate(${angle}deg)`, 
            top: '4px',
            boxShadow: '0 0 4px rgba(96,165,250,0.8)'
          }} 
        />
        {/* Metal Cap center */}
        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-slate-800 border border-slate-705 shadow-inner flex items-center justify-center pointer-events-none">
          <div className="w-1 h-1 rounded-full bg-slate-600/50" />
        </div>
      </div>
      <span className="text-[7px] md:text-[8px] font-black uppercase tracking-tight text-slate-500 mt-1 leading-none">{label}</span>
      <span className="text-[6px] md:text-[7px] font-mono font-bold text-blue-400/80 leading-none mt-0.5">{value}{unit}</span>
    </div>
  );
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export const VirtualMixer = () => {
  const [channels, setChannels] = useState<ChannelData[]>(INITIAL_CHANNELS);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [info, setInfo] = useState<{ title: string; desc: string; x: number; y: number } | null>(null);

  // Auth
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Transport
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>(SONGS);
  const [currentSong, setCurrentSong] = useState<Song | null>(SONGS[0] || null);
  const [masterMeter, setMasterMeter] = useState(0);
  const [masterFader, setMasterFader] = useState(80);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [ytInputUrl, setYtInputUrl] = useState('');
  const [ytInputLoading, setYtInputLoading] = useState(false);
  const [ytInputError, setYtInputError] = useState('');
  const [skin, setSkin] = useState<'modern' | 'analog'>('modern');

  // Multi-device responsive layout & scrolling helpers
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const channelRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [focusedStripId, setFocusedStripId] = useState<number>(1);

  const handleStripSelect = (id: number) => {
    setFocusedStripId(id);
    if (id >= 1 && id <= 4) {
      setSelectedId(id);
    }
  };

  const handlePrevStrip = () => {
    const nextId = focusedStripId === 1 ? 6 : focusedStripId - 1;
    handleStripSelect(nextId);
  };

  const handleNextStrip = () => {
    const nextId = focusedStripId === 6 ? 1 : focusedStripId + 1;
    handleStripSelect(nextId);
  };

  // Auto-scroll focused console strip into view centered horizontally
  useEffect(() => {
    const container = scrollContainerRef.current;
    const activeCh = channelRefs.current[focusedStripId];
    if (container && activeCh) {
      const scrollLeft = activeCh.offsetLeft - (container.clientWidth / 2) + (activeCh.clientWidth / 2);
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      });
    }
  }, [focusedStripId]);

  // ── Web Audio Engine ──────────────────────────
  // Used only for type==='file' tracks.
  // AudioContext is created once, after the first user interaction.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);   // <audio> element
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [audioCtxState, setAudioCtxState] = useState<AudioContextState>('suspended');

  // Multi-channel stem references modeled after Yamaha MG16
  interface ChannelNodes {
    crossoverFilter1: BiquadFilterNode;
    crossoverFilter2?: BiquadFilterNode;
    hpf: BiquadFilterNode;
    eqL: BiquadFilterNode;
    eqM: BiquadFilterNode;
    eqH: BiquadFilterNode;
    compressor: DynamicsCompressorNode;
    pan: StereoPannerNode;
    gain: GainNode;
    reverbSend: GainNode;
    analyser: AnalyserNode;
  }
  const channelNodesRef = useRef<Record<number, ChannelNodes>>({});
  const masterGainNodeRef = useRef<GainNode | null>(null);
  const masterAnalyserRef = useRef<AnalyserNode | null>(null);
  const convolverNodeRef = useRef<ConvolverNode | null>(null);
  const reverbReturnGainRef = useRef<GainNode | null>(null);

  // FX SPX Reverb settings
  const [reverbSize, setReverbSize] = useState<number>(1.8); // decay duration in seconds
  const [reverbMix, setReverbMix] = useState<number>(25);   // return level 0-100

  // Real-time bouncing VU meters state for channels
  const [channelMeters, setChannelMeters] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 });

  // Mic
  const [micActive, setMicActive] = useState(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Test tone
  const [testToneActive, setTestToneActive] = useState(false);
  const oscRef = useRef<OscillatorNode | null>(null);

  // ── Firebase Integration ──────────────────────
  useEffect(() => {
    // 1. Connection Test
    const testConn = async () => {
      try { await getDocFromServer(doc(db, 'test', 'connection')); } catch (e) {}
    };
    testConn();

    // 2. Auth state
    const unsubAuth = onAuthStateChanged(auth, (u: FirebaseUser | null) => {
      setUser(u);
      if (u) {
        // Update user profile
        setDoc(doc(db, 'users', u.uid), {
          displayName: u.displayName,
          photoURL: u.photoURL,
          lastLogin: new Date().toISOString()
        }, { merge: true }).catch((e: any) => handleFirestoreError(e, OperationType.WRITE, `users/${u.uid}`));
      }
    });

    // 3. Real-time Songs (Community Playlist)
    const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
    const unsubSongs = onSnapshot(q, (snapshot: any) => {
      const dbSongs: Song[] = snapshot.docs.map((d: any) => ({
        id: d.id,
        ...d.data()
      } as Song));
      
      // Merge with default songs, keeping defaults unique
      const merged = [...SONGS, ...dbSongs.filter(s => !SONGS.some(def => def.id === s.id))];
      setSongs(merged);
      if (merged.length > 0) {
        setCurrentSong(prev => prev || merged[0]);
      }
    }, (error: any) => handleFirestoreError(error, OperationType.LIST, 'songs'));

    return () => {
      unsubAuth();
      unsubSongs();
    };
  }, []);

  const login = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (e) { console.error("Login failed:", e); }
  };

  const logout = () => signOut(auth);

  // ── Save/Load Mix ──
  const saveMix = async () => {
    if (!user) { alert("Please login to save your mix."); return; }
    if (!currentSong) { alert("Please load or upload a song first to save your mix configuration."); return; }
    try {
      const presetData = {
        songId: currentSong.id,
        userId: user.uid,
        masterFader,
        channels: channels.map(c => ({
          id: c.id,
          gain: c.gain,
          pan: c.pan,
          fader: c.fader,
          muted: c.muted,
          solo: c.solo,
          hpf: c.hpf,
          eq: { ...c.eq }
        })),
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'users', user.uid, 'presets'), presetData);
      alert("Mix preset saved!");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/presets`);
    }
  };

  const loadLatestMix = async () => {
    if (!user) return;
    try {
      // For simplicity, just get the latest preset for this song
      const q = query(collection(db, 'users', user.uid, 'presets'), orderBy('createdAt', 'desc'));
      const snap = await getDoc(doc(db, 'users', user.uid, 'presets', 'latest')); // This is a placeholder logic
      // In a real app, you'd show a list. Let's just fetch the last one from the snapshot if needed.
    } catch (e) {}
  };

  const selectedChannel = channels.find(c => c.id === selectedId)!;

  const HELP_DATABASE: Record<string, { title: string; desc: string }> = {
    gain: { title: 'Input Gain (Sensitivity)', desc: 'Think of this as the "volume" coming INTO the mixer. Set this so the loudest parts don\'t hit the red. Too low → hiss; too high → distort (clip).' },
    hpf: { title: 'High-Pass Filter (80Hz)', desc: 'Turn this ON for every vocal and instrument EXCEPT kick drums and bass guitars. It removes foot stomps and rumble, making your mix sound professional and clear.' },
    eq: { title: 'Equalizer (EQ)', desc: 'Used to fix "room boom" or make voices clearer. Use HPF to cut low-end rumble, and boost high-mids slightly to help words be more intelligible.' },
    pan: { title: 'Panning (Stereo)', desc: 'Positions sound Left or Right. Keep the Worship Leader center. Panning instruments slightly creates space so everything sounds clearer without being louder.' },
    fader: { title: 'Volume Fader', desc: 'Your main tool during the service. Start with Gain set correctly, then use faders to balance. The goal is a "transparent" mix where you can hear everyone clearly.' },
    solo: { title: 'Solo (PFL)', desc: 'Pre-Fader Listen. Hear a specific channel through headphones without the congregation hearing it. Essential for checking if a mic is actually on!' },
    mute: { title: 'Mute / Silence', desc: 'Instantly silences the channel. Always mute mics when not in use to prevent feedback or hearing private conversations between songs.' },
  };

  // ── Init Web Audio (multi-channel split) ──────
  const initWebAudio = useCallback(() => {
    // Already initialized — just resume if suspended
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();

    // Create <audio> elements
    const audio = new Audio();
    audio.preload = 'auto';
    audio.loop = true;

    // Events
    audio.addEventListener('playing', () => { setIsLoading(false); setIsPlaying(true); });
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('waiting', () => setIsLoading(true));
    audio.addEventListener('canplay', () => setIsLoading(false));
    audio.addEventListener('error', () => setIsLoading(false));

    // Web Audio Routing: source -> crossovers -> EQs -> Comps -> Pans -> Gains -> Analysers -> MasterBus -> MasterOut
    const source = ctx.createMediaElementSource(audio);

    // Create Master Bus Gain and Analyser
    const masterBus = ctx.createGain();
    const masterAnalyserNode = ctx.createAnalyser();
    masterAnalyserNode.fftSize = 64;

    // Create SPX Reverb Convolver effect
    const convolver = ctx.createConvolver();
    convolver.buffer = createReverbImpulseResponse(ctx, reverbSize, 1.5);
    const reverbReturn = ctx.createGain();
    convolver.connect(reverbReturn);
    reverbReturn.connect(masterBus);

    // Master path
    const masterVolumeNode = ctx.createGain();
    masterBus.connect(masterVolumeNode);
    masterVolumeNode.connect(masterAnalyserNode);
    masterAnalyserNode.connect(ctx.destination);

    // Build the 4 channels
    const nodes: Record<number, ChannelNodes> = {};
    INITIAL_CHANNELS.forEach(ch => {
      const cross1 = ctx.createBiquadFilter();
      let cross2: BiquadFilterNode | undefined;

      // STEM FREQUENCY CROSSOVER EXTRACTION LOGIC
      if (ch.id === 1) {
        // Vocals: presence bandpass
        cross1.type = 'bandpass';
        cross1.frequency.value = 1800;
        cross1.Q.value = 0.65;
      } else if (ch.id === 2) {
        // Guitar/Piano: wide midrange
        cross1.type = 'bandpass';
        cross1.frequency.value = 600;
        cross1.Q.value = 0.5;
      } else if (ch.id === 3) {
        // Bass Guitar: sub lows
        cross1.type = 'lowpass';
        cross1.frequency.value = 130;
      } else if (ch.id === 4) {
        // Drums: parallel lowpass (kick) + highpass (cymbals/clicks)
        cross1.type = 'lowpass';
        cross1.frequency.value = 85;

        cross2 = ctx.createBiquadFilter();
        cross2.type = 'highpass';
        cross2.frequency.value = 4500;
        source.connect(cross2);
      }

      // Connect crossovers from source
      source.connect(cross1);

      // HPF
      const hpfNode = ctx.createBiquadFilter();
      hpfNode.type = 'highpass';
      hpfNode.frequency.value = ch.hpf ? 80 : 15;

      // EQs
      const eqLNode = ctx.createBiquadFilter();
      eqLNode.type = 'lowshelf';
      eqLNode.frequency.value = 100;

      const eqMNode = ctx.createBiquadFilter();
      eqMNode.type = 'peaking';
      eqMNode.frequency.value = ch.eq.midFreq;
      eqMNode.Q.value = 0.7;

      const eqHNode = ctx.createBiquadFilter();
      eqHNode.type = 'highshelf';
      eqHNode.frequency.value = 8000;

      // Dynamics Compressor
      const compNode = ctx.createDynamicsCompressor();
      compNode.threshold.value = ch.comp.threshold;
      compNode.ratio.value = ch.comp.ratio;
      compNode.attack.value = ch.comp.attack / 1000;
      compNode.release.value = ch.comp.release / 1000;

      // Stereo Pan
      const panNode = ctx.createStereoPanner();
      panNode.pan.value = ch.pan / 100;

      // Gain controls
      const gainNode = ctx.createGain();
      const reverbSendNode = ctx.createGain();

      // Analyser per channel for separate meters
      const chAnalyser = ctx.createAnalyser();
      chAnalyser.fftSize = 64;

      // Connect stems together
      cross1.connect(hpfNode);
      if (cross2) {
        cross2.connect(hpfNode);
      }

      hpfNode.connect(eqLNode);
      eqLNode.connect(eqMNode);
      eqMNode.connect(eqHNode);
      eqHNode.connect(compNode);

      // Branch to Pan and Reverb Send
      compNode.connect(panNode);
      panNode.connect(gainNode);
      gainNode.connect(chAnalyser);
      chAnalyser.connect(masterBus);

      compNode.connect(reverbSendNode);
      reverbSendNode.connect(convolver);

      nodes[ch.id] = {
        crossoverFilter1: cross1,
        crossoverFilter2: cross2,
        hpf: hpfNode,
        eqL: eqLNode,
        eqM: eqMNode,
        eqH: eqHNode,
        compressor: compNode,
        pan: panNode,
        gain: gainNode,
        reverbSend: reverbSendNode,
        analyser: chAnalyser,
      };
    });

    audioCtxRef.current = ctx;
    audioElRef.current = audio;
    sourceNodeRef.current = source;
    channelNodesRef.current = nodes;
    masterGainNodeRef.current = masterVolumeNode;
    masterAnalyserRef.current = masterAnalyserNode;
    convolverNodeRef.current = convolver;
    reverbReturnGainRef.current = reverbReturn;

    setAudioCtxState(ctx.state);
    if (ctx.state === 'suspended') ctx.resume();
  }, [reverbSize]);

  // ── AudioContext state polling ──────────────────
  useEffect(() => {
    const t = setInterval(() => {
      if (audioCtxRef.current) setAudioCtxState(audioCtxRef.current.state);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // ── Sync node parameters ────────────────────────
  const syncNodes = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'closed') return;

    const t = ctx.currentTime;
    const masterGain = Math.pow(10, (masterFader - 80) / 20);

    // Sync Master volume and reverb returns
    if (masterGainNodeRef.current) {
      masterGainNodeRef.current.gain.setTargetAtTime(masterGain, t, 0.05);
    }
    if (reverbReturnGainRef.current) {
      reverbReturnGainRef.current.gain.setTargetAtTime(reverbMix / 100, t, 0.05);
    }

    // Is any channel currently Soloed? (PFL logic)
    const isAnySoloed = channels.some(c => c.solo);

    // Sync each channel strip
    channels.forEach(ch => {
      const live = channelNodesRef.current[ch.id];
      if (!live) return;

      // If solo exists, channels that are NOT soloed must be quiet
      const isMutedBySolo = isAnySoloed && !ch.solo;
      const isMuted = ch.muted || isMutedBySolo;

      const faderVolume = Math.pow(10, (ch.fader - 70) / 20); // 70 is nominal 0dB fader level
      const trimGain = ch.gain / 50; // nominal 50 -> 1x trim

      // Power scales to balance filtered bands
      let stemMultiplier = 1.0;
      if (ch.id === 1) stemMultiplier = 1.7; // vocals clarity
      if (ch.id === 2) stemMultiplier = 1.2; // guitar presence
      if (ch.id === 3) stemMultiplier = 1.85; // bass richness
      if (ch.id === 4) stemMultiplier = 1.55; // drum crispness

      const targetGain = isMuted ? 0 : faderVolume * trimGain * stemMultiplier;

      live.gain.gain.setTargetAtTime(targetGain, t, 0.05);
      live.reverbSend.gain.setTargetAtTime((ch.reverb / 100) * (isMuted ? 0 : 1), t, 0.05);

      // Pan
      live.pan.pan.setTargetAtTime(ch.pan / 100, t, 0.05);

      // HPF
      live.hpf.frequency.setTargetAtTime(ch.hpf ? 80 : 15, t, 0.05);

      // 3-Band Parametric Sweep EQ
      live.eqL.gain.setTargetAtTime(ch.eq.low, t, 0.05);
      live.eqM.gain.setTargetAtTime(ch.eq.mid, t, 0.05);
      live.eqM.frequency.setTargetAtTime(ch.eq.midFreq, t, 0.05);
      live.eqH.gain.setTargetAtTime(ch.eq.high, t, 0.05);

      // Compressor parameters
      live.compressor.threshold.setTargetAtTime(ch.comp.threshold, t, 0.05);
      live.compressor.ratio.setTargetAtTime(ch.comp.ratio, t, 0.05);
      live.compressor.attack.setTargetAtTime(ch.comp.attack / 1000, t, 0.05);
      live.compressor.release.setTargetAtTime(ch.comp.release / 1000, t, 0.05);
    });
  }, [channels, masterFader, reverbMix]);

  useEffect(() => { syncNodes(); }, [syncNodes]);

  // ── VU Meter animation (multitrack reading) ─────
  useEffect(() => {
    let raf: number;
    const loop = () => {
      if (isPlaying && currentSong) {
        if (currentSong.type === 'file') {
          // Read Master output meter
          if (masterAnalyserRef.current) {
            const data = new Uint8Array(masterAnalyserRef.current.frequencyBinCount);
            masterAnalyserRef.current.getByteFrequencyData(data);
            const avg = data.reduce((a, b) => a + b, 0) / data.length;
            setMasterMeter((avg / 255) * 110); // scale slightly for visual impact
          }

          // Read individual channels' analysers
          const meters: Record<number, number> = {};
          channels.forEach(ch => {
            const live = channelNodesRef.current[ch.id];
            if (live && live.analyser && !ch.muted) {
              const chData = new Uint8Array(live.analyser.frequencyBinCount);
              live.analyser.getByteFrequencyData(chData);
              const avg = chData.reduce((a, b) => a + b, 0) / chData.length;
              meters[ch.id] = Math.min(100, (avg / 255) * 200 * (ch.gain / 50));
            } else {
              meters[ch.id] = 0;
            }
          });
          setChannelMeters(meters);
        } else {
          // YouTube: simple simulation with some random organic jitter
          const t = Date.now() / 150;
          setMasterMeter(40 + Math.sin(t) * 15 + Math.random() * 8);

          const meters: Record<number, number> = {};
          channels.forEach(ch => {
            meters[ch.id] = ch.muted ? 0 : 35 + Math.sin(t + ch.id) * 18 + Math.random() * 10;
          });
          setChannelMeters(meters);
        }
      } else {
        setMasterMeter(0);
        const meters: Record<number, number> = {};
        channels.forEach(ch => { meters[ch.id] = 0; });
        setChannelMeters(meters);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, currentSong, channels]);

  // ── Cleanup ─────────────────────────────────────
  useEffect(() => {
    return () => {
      audioElRef.current?.pause();
      audioCtxRef.current?.close().catch(() => {});
      micStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ─────────────────────────────────────────────
  // Transport Controls
  // ─────────────────────────────────────────────
  const togglePlay = async () => {
    if (!currentSong) return;
    if (currentSong.type === 'file' && !currentSong.url) {
      alert("This is a pending Demo Guide track placeholder. Authentic high-fidelity sessional multitracks will be officially uploaded on client handover. In the meantime, please import your own audio files (up to 6 custom slots) using the import button to play and practice!");
      return;
    }
    // YouTube type: console/meter simulation only — user plays directly inside iframe
    if (currentSong.type === 'youtube') {
      setIsPlaying(prev => !prev);
      return;
    }

    // file type: Web Audio playback
    initWebAudio();

    const ctx = audioCtxRef.current;
    const audio = audioElRef.current;
    if (!ctx || !audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (ctx.state === 'suspended') await ctx.resume();
      // Always update src in case the song changed
      if (audio.src !== currentSong.url) {
        audio.src = currentSong.url;
        audio.load();
      }
      setIsLoading(true);
      audio.play().catch((err: any) => {
        console.error('Play error:', err);
        setIsLoading(false);
        // If CORS blocks the CDN file, guide user to upload their own file
        if (err.name === 'NotSupportedError' || err.name === 'NotAllowedError') {
          alert('Could not play this track. Please use the Upload button to load your own audio file.');
        }
      });
    }
  };

  const selectSong = async (song: Song) => {
    const wasPlaying = isPlaying;

    // Stop current playback
    if (audioElRef.current) audioElRef.current.pause();
    setIsPlaying(false);
    setCurrentSong(song);
    setShowPlaylist(false);

    if (song.type === 'file') {
      if (!song.url) {
        // Just select placeholder but do not play/init web audio
        return;
      }
      // Ensure Web Audio engine is ready
      initWebAudio();
      // audioElRef may now be set by initWebAudio; get fresh reference
      const audio = audioElRef.current;
      const ctx = audioCtxRef.current;
      if (!audio) return;

      audio.src = song.url;
      audio.load();

      if (wasPlaying) {
        if (ctx?.state === 'suspended') await ctx?.resume();
        setIsLoading(true);
        audio.play().catch(() => setIsLoading(false));
      }
    }
    // YouTube type: video replaces via key={currentSong.id} on the iframe
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check custom tracks limit (maximum of 6)
    const customSongsCount = songs.filter(s => s.id.startsWith('custom-')).length;
    if (customSongsCount >= 6) {
      alert("A maximum of 6 uploaded custom songs is allowed to keep performance optimal and memory usage light. Please delete one of your uploaded tracks from the media source playlist first.");
      return;
    }

    initWebAudio();
    const url = URL.createObjectURL(file);
    // Blob URLs are always same-origin — CORS never an issue
    const newSong: Song = { id: 'custom-' + Date.now(), title: file.name.replace(/\.\w+$/, ''), url, type: 'file' };
    setSongs(prev => [...prev.filter(s => s.id !== newSong.id), newSong]);
    setCurrentSong(newSong);
    const audio = audioElRef.current;
    if (audio) {
      audio.src = url;
      audio.load();
      // Auto-play the uploaded file immediately
      const ctx = audioCtxRef.current;
      if (ctx?.state === 'suspended') ctx.resume();
      audio.play().catch(() => {});
    }
  };

  const addYouTubeSong = async () => {
    const url = ytInputUrl.trim();
    if (!url) return;
    const videoId = getYouTubeVideoId(url);
    if (!videoId) {
      setYtInputError('Please paste a valid YouTube URL (youtube.com or youtu.be)');
      return;
    }
    // Prevent duplicates
    if (songs.some(s => s.url.includes(videoId))) {
      setYtInputError('This video is already in your playlist.');
      return;
    }
    setYtInputError('');
    setYtInputLoading(true);
    
    try {
      const { title, author } = await fetchYouTubeTitle(url);
      const newSongData = {
        title,
        artist: author,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        type: 'youtube',
        createdBy: user?.uid || 'anonymous',
        createdAt: serverTimestamp()
      };

      if (user) {
        await addDoc(collection(db, 'songs'), newSongData);
      } else {
        // Fallback for anonymous users (local only)
        setSongs(prev => [...prev, { id: 'yt-' + videoId, ...newSongData } as Song]);
      }
      setYtInputUrl('');
    } catch (e) {
      setYtInputError('Failed to add track.');
    } finally {
      setYtInputLoading(false);
    }
  };

  // ── Delete song from playlist ──────────────────
  const deleteSong = async (id: string) => {
    // If it's a default song, just hide it locally
    if (SONGS.some(s => s.id === id)) {
      setSongs(prev => prev.filter(s => s.id !== id));
      return;
    }

    // If it's a Firestore song, delete it
    try {
       await deleteDoc(doc(db, 'songs', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `songs/${id}`);
      // Fallback: local delete
      setSongs(prev => prev.filter(s => s.id !== id));
    }

    if (currentSong?.id === id) {
      const next = songs.filter(s => s.id !== id);
      if (next.length > 0) {
        selectSong(next[0]);
      } else {
        setCurrentSong(null);
        setIsPlaying(false);
        if (audioElRef.current) audioElRef.current.pause();
      }
    }
  };

  // ── Test Tone ──────────────────────────────────
  const toggleSoundCheck = () => {
    initWebAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    if (testToneActive) {
      oscRef.current?.stop();
      setTestToneActive(false);
    } else {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 440;
      g.gain.value = 0.15;
      osc.connect(g); g.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      setTestToneActive(true);
      setTimeout(() => { osc.stop(); setTestToneActive(false); }, 1000);
    }
  };

  // ── Microphone ─────────────────────────────────
  const toggleMic = async () => {
    if (micActive) {
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      micSourceRef.current?.disconnect();
      micStreamRef.current = null; micSourceRef.current = null;
      setMicActive(false);
    } else {
      try {
        initWebAudio();
        const ctx = audioCtxRef.current;
        if (ctx?.state === 'suspended') await ctx.resume();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        micStreamRef.current = stream;
        if (ctx) {
          const src = ctx.createMediaStreamSource(stream);
          micSourceRef.current = src;
          // Dynamically plug microphone source into Channel 1 (Vocals) processing path!
          const vocNode = channelNodesRef.current[1];
          if (vocNode) {
            src.connect(vocNode.hpf);
          } else if (masterAnalyserRef.current) {
            src.connect(masterAnalyserRef.current);
          }
        }
        setMicActive(true);
      } catch (err: any) {
        alert(`Microphone access failed: ${err.message}`);
      }
    }
  };

  // ─────────────────────────────────────────────
  // Channel / UI Helpers
  // ─────────────────────────────────────────────
  const updateChannel = (id: number, updates: Partial<ChannelData>) =>
    setChannels(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

  const showInfo = (e: React.MouseEvent, title: string, desc: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setInfo({ title, desc, x: rect.left + rect.width / 2, y: rect.top - 10 });
  };

  useEffect(() => {
    const handler = () => { if (info) setInfo(null); };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [info]);

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className={`transition-all duration-500 flex flex-col h-full min-h-[480px] md:min-h-[700px] relative overflow-hidden rounded-[1rem] md:rounded-[2rem] shadow-2xl border-2 md:border-4 ${
      skin === 'modern'
        ? 'bg-[#1a1c23] border-[#252833] p-1.5 md:p-3'
        : 'bg-[#d1d5db] border-[#9ca3af] p-2 md:p-4 text-slate-900'
    }`}>

      {/* ── Top Bar ── */}
      <div className={`flex items-center justify-between mb-1 md:mb-3 pb-1 border-b shrink-0 ${skin === 'modern' ? 'border-white/5' : 'border-black/10'}`}>
        <div className="flex items-center gap-2 md:gap-4">
          <div className={`${skin === 'modern' ? 'bg-slate-900 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-slate-700 border border-slate-600 shadow-xl'} p-2 md:p-2.5 rounded-2xl flex items-center justify-center relative group overflow-hidden`}>
            {skin === 'modern' && <div className="absolute inset-0 bg-blue-600/5 blur-xl group-hover:bg-blue-600/10 transition-colors" />}
            <Logo size={24} />
          </div>
          <div>
            <h2 className={`text-[10px] sm:text-xs md:text-xl font-black tracking-tighter uppercase italic leading-none ${skin === 'modern' ? 'text-white' : 'text-slate-800'}`}>
              SHEPHERD <span className={skin === 'modern' ? 'text-blue-500' : 'text-slate-500'}>CORE</span>
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`w-1 h-1 rounded-full animate-pulse ${skin === 'modern' ? 'bg-green-500' : 'bg-red-600'}`} />
              <span className={`text-[6px] md:text-[9px] font-bold uppercase tracking-[0.2em] ${skin === 'modern' ? 'text-slate-500' : 'text-slate-600'}`}>
                {skin === 'modern' ? 'PRECISION DSP ACTIVE' : 'VINTAGE SIGNAL PATH'}
              </span>
            </div>
          </div>
        </div>

        <div className={`flex gap-2 md:gap-3 items-center p-1 md:p-1.5 rounded-xl border relative ${skin === 'modern' ? 'bg-black/40 border-white/5' : 'bg-white/40 border-black/10'}`}>
          {/* Skin switcher */}
          <div className={`flex p-1 rounded-lg border shadow-inner ${skin === 'modern' ? 'bg-[#0f1115] border-white/5' : 'bg-slate-400 border-slate-500'}`}>
            <button onClick={() => setSkin('modern')} className={`px-3 py-1.5 text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${skin === 'modern' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-slate-400'}`}>CORE-X</button>
            <button onClick={() => setSkin('analog')} className={`px-3 py-1.5 text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${skin === 'analog' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-600'}`}>ANALOG-800</button>
          </div>

          {/* Audio Engine offline indicator */}
          {audioCtxState === 'suspended' && (
            <button
              onClick={() => { initWebAudio(); }}
              className="animate-pulse px-2 sm:px-3 py-1 sm:py-1.5 bg-red-600 text-white text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase rounded shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center gap-1.5 border border-red-400"
            >
              <Power size={10} /> <span className="hidden xs:inline">Audio Engine:</span> Offline
            </button>
          )}

          {/* Sound Check (test tone) */}
          <button
            onClick={toggleSoundCheck}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all flex items-center gap-2 ${testToneActive ? 'bg-green-600 border-green-400 text-white animate-bounce' : (skin === 'modern' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-300 border-slate-400 text-slate-700')}`}
            title="System Sound Check"
          >
            <Volume2 size={14} className={testToneActive ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline text-[8px] font-black uppercase tracking-tighter">Check</span>
          </button>

          {/* File upload */}
          <div className="flex gap-2 items-center px-1 md:px-2 border-x border-white/5 mx-1 md:mx-2">
            <label className={`cursor-pointer group flex items-center justify-center p-1.5 md:p-2 rounded-lg border transition-all ${skin === 'modern' ? 'bg-slate-800 border-slate-700 hover:bg-blue-600 hover:border-blue-400' : 'bg-slate-300 border-slate-400 hover:bg-slate-400'}`}>
              <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
              <Music size={14} className={skin === 'modern' ? 'text-slate-400 group-hover:text-white' : 'text-slate-700'} />
            </label>
          </div>

          {/* Transport */}
          <div className="flex gap-2 items-center px-2 md:px-4 border-r border-white/5">
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className={`p-2 rounded-lg text-white transition-all shadow-lg ${isLoading ? 'bg-slate-700 cursor-wait' : (isPlaying ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20')}`}
            >
              {isLoading ? <Activity size={16} className="animate-spin" /> : (isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />)}
            </button>

            {/* Mic */}
            <button
              onClick={toggleMic}
              title={micActive ? 'Mic On — Click to Stop' : 'Click to Activate Microphone'}
              className={`p-2 rounded-lg text-white transition-all shadow-lg ${micActive ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30 animate-pulse' : (skin === 'modern' ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700' : 'bg-slate-300 hover:bg-slate-400 text-slate-700 border border-slate-400')}`}
            >
              {micActive ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <div className="hidden sm:block">
              <div className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Transport</div>
              <div className={`text-[10px] font-black uppercase italic ${micActive ? 'text-red-400 animate-pulse' : isLoading ? 'text-blue-400 animate-pulse' : (isPlaying ? 'text-green-500 animate-pulse' : 'text-slate-600')}`}>
                {micActive ? 'Mic Live' : isLoading ? 'Loading' : (isPlaying ? 'Live' : 'Stop')}
              </div>
            </div>
          </div>

          {/* Playlist picker */}
          <div className="relative">
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="flex gap-3 items-center px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all group overflow-hidden relative shadow-inner"
            >
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Music size={14} className={`${isPlaying ? 'text-blue-500' : 'text-slate-500'} group-hover:scale-110 transition-transform`} />
              <div className="text-left relative z-10">
                <div className="text-[7px] text-slate-500 uppercase font-black tracking-widest leading-none mb-0.5">Media Source</div>
                <div className="text-[10px] text-white font-black uppercase tracking-tight flex items-center gap-2">
                  {currentSong ? currentSong.title : "No Track Selected"}
                  <ChevronRight size={10} className={`text-slate-600 transition-transform ${showPlaylist ? 'rotate-90' : ''}`} />
                </div>
              </div>
            </button>

            <AnimatePresence>
              {showPlaylist && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 right-0 md:left-0 md:right-auto w-80 bg-[#1a1c23] border border-slate-700/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-xl"
                >
                  <div className="p-4 border-b border-slate-800 bg-black/40 flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Training Tracks</h4>
                    <Activity size={12} className={isPlaying ? 'text-blue-500' : 'text-slate-600'} />
                  </div>
                  {/* Song list */}
                  <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
                    {songs.length === 0 && (
                      <div className="py-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                        No tracks yet — upload an MP3 file below
                      </div>
                    )}
                    {songs.map(song => (
                      <div
                        key={song.id}
                        className={`flex items-center gap-2 rounded-xl mb-1 pr-2 transition-all group ${currentSong?.id === song.id ? 'bg-blue-600/10' : 'hover:bg-white/5'}`}
                      >
                        <button
                          onClick={() => selectSong(song)}
                          className="flex-1 p-3 text-left flex items-center gap-3 min-w-0"
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${currentSong?.id === song.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-600 group-hover:bg-slate-700'}`}>
                            {currentSong?.id === song.id && isPlaying ? <Activity size={12} className="animate-pulse" /> : <Music size={12} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-[10px] font-black uppercase tracking-tight truncate ${currentSong?.id === song.id ? 'text-blue-400' : 'text-slate-300'}`}>{song.title}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {song.type === 'youtube' && (
                                <span className="text-[7px] text-red-400 font-bold uppercase border border-red-800 rounded px-1 shrink-0">YT</span>
                              )}
                              {song.type === 'file' && (
                                <span className="text-[7px] text-green-400 font-bold uppercase border border-green-800 rounded px-1 shrink-0">MP3</span>
                              )}
                              <div className="text-[7px] text-slate-500 font-bold uppercase truncate">{song.artist || ''}</div>
                            </div>
                          </div>
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={() => deleteSong(song.id)}
                          title="Remove from playlist"
                          className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-slate-700 hover:bg-red-600/20 hover:text-red-405 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add YouTube URL input */}
                  <div className="p-3 border-t border-slate-800 bg-black/40 space-y-2">
                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Add YouTube Track</p>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={ytInputUrl}
                        onChange={e => { setYtInputUrl(e.target.value); setYtInputError(''); }}
                        onKeyDown={e => e.key === 'Enter' && addYouTubeSong()}
                        placeholder="Paste YouTube URL here..."
                        className="flex-1 bg-slate-900 border border-slate-705 rounded-lg px-2 py-1.5 text-[10px] text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 min-w-0"
                      />
                      <button
                        onClick={addYouTubeSong}
                        disabled={ytInputLoading || !ytInputUrl.trim()}
                        className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-705 disabled:text-slate-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        {ytInputLoading ? '...' : 'Add'}
                      </button>
                    </div>
                    {ytInputError && (
                      <p className="text-[8px] text-red-100 font-bold">{ytInputError}</p>
                    )}
                    <p className="text-[7px] text-slate-600 font-medium uppercase tracking-[0.15em]">
                      YT = video display only &nbsp;|&nbsp; Upload MP3 for full console control
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 flex-1 h-full overflow-hidden w-full max-w-full min-w-0">

        {/* Left: Console Desk Container */}
        <div className="flex-1 flex flex-col gap-3 min-w-0 w-full max-w-full order-2 lg:order-1">
          
          {/* Desk Navigation Controller Ribbon */}
          <div className={`p-2 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between border ${
            skin === 'modern' 
              ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-white/5 shadow-md' 
              : 'bg-[#cbd5e1] border-slate-400 shadow-sm'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-3.5 rounded-full ${skin === 'modern' ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className={`text-[9px] md:text-xs font-black uppercase tracking-widest ${skin === 'modern' ? 'text-slate-400' : 'text-slate-700'}`}>
                Console Strip Navigator
              </span>
            </div>

            {/* Selector Buttons */}
            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto py-0.5 justify-center">
              {/* Prev Button */}
              <button
                onClick={handlePrevStrip}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 border transition-all shrink-0 active:scale-95 ${
                  skin === 'modern'
                    ? 'bg-slate-900/60 hover:bg-slate-800 border-white/5 text-slate-300 hover:text-white'
                    : 'bg-slate-300 hover:bg-slate-200 border-slate-400 text-slate-700'
                }`}
                title="Previous Column"
              >
                <ChevronLeft size={10} strokeWidth={3} />
                <span>Prev</span>
              </button>

              {/* Channel chips */}
              <div className="flex gap-1 items-center px-1">
                {channels.map(ch => {
                  const isFocused = focusedStripId === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleStripSelect(ch.id)}
                      className={`px-2.5 py-1 rounded text-[8px] md:text-[9.5px] font-black uppercase tracking-tight transition-all truncate border ${
                        isFocused
                          ? (skin === 'modern' ? 'bg-blue-600 border-blue-400 text-white shadow shadow-blue-500/25 scale-[1.03]' : 'bg-white border-blue-600 text-blue-600 font-bold shadow-sm scale-[1.03]')
                          : (skin === 'modern' ? 'bg-slate-950/60 border-white/5 text-slate-500 hover:text-slate-300' : 'bg-slate-200 border-transparent text-slate-600 hover:bg-white/40')
                      }`}
                    >
                      CH{ch.id}
                    </button>
                  );
                })}

                {/* FX Return */}
                <button
                  onClick={() => handleStripSelect(5)}
                  className={`px-2.5 py-1 rounded text-[8px] md:text-[9.5px] font-black uppercase tracking-tight transition-all border ${
                    focusedStripId === 5
                      ? (skin === 'modern' ? 'bg-blue-600 border-blue-400 text-white shadow shadow-blue-500/25 scale-[1.03]' : 'bg-white border-blue-600 text-blue-600 font-bold shadow-sm scale-[1.03]')
                      : (skin === 'modern' ? 'bg-slate-950/60 border-white/5 text-slate-500 hover:text-slate-300' : 'bg-slate-200 border-transparent text-slate-600 hover:bg-white/40')
                  }`}
                >
                  FX RET
                </button>

                {/* Main Stereo */}
                <button
                  onClick={() => handleStripSelect(6)}
                  className={`px-2.5 py-1 rounded text-[8px] md:text-[9.5px] font-black uppercase tracking-tight transition-all border ${
                    focusedStripId === 6
                      ? (skin === 'modern' ? 'bg-red-650 border-red-500 text-white shadow shadow-red-500/25 scale-[1.03]' : 'bg-rose-100 border-red-500 text-red-650 font-bold shadow-sm scale-[1.03]')
                      : (skin === 'modern' ? 'bg-slate-950/60 border-white/5 text-slate-500 hover:text-slate-300' : 'bg-slate-200 border-transparent text-slate-600 hover:bg-white/40')
                  }`}
                >
                  MAIN
                </button>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextStrip}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 border transition-all shrink-0 active:scale-95 ${
                  skin === 'modern'
                    ? 'bg-slate-900/60 hover:bg-slate-800 border-white/5 text-slate-300 hover:text-white'
                    : 'bg-slate-300 hover:bg-slate-200 border-slate-400 text-slate-700'
                }`}
                title="Next Column"
              >
                <span>Next</span>
                <ChevronRight size={10} strokeWidth={3} />
              </button>
            </div>

            {/* Active strip helper visualizer */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              <span className={`text-[8px] md:text-[9px] font-mono font-bold leading-none ${skin === 'modern' ? 'text-slate-500' : 'text-slate-600'}`}>
                FOCUS:
              </span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                focusedStripId === 5 ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                focusedStripId === 6 ? 'bg-red-500/20 text-red-400 animate-pulse' :
                'bg-orange-500/10 text-orange-400'
              }`}>
                {focusedStripId === 1 && "Vocals"}
                {focusedStripId === 2 && "Guitar/Piano"}
                {focusedStripId === 3 && "Bass Guitar"}
                {focusedStripId === 4 && "Drums"}
                {focusedStripId === 5 && "SPX Reverb"}
                {focusedStripId === 6 && "Stereo Out"}
              </span>
            </div>
          </div>

          {/* Left: Scrollable Console Desk */}
          <div ref={scrollContainerRef} className="flex-1 w-full max-w-full overflow-x-auto pb-2 custom-scrollbar lg:max-w-none min-w-0">
            <div className={`flex gap-4 min-w-max p-4 rounded-3xl h-full relative ${skin === 'modern' ? 'bg-black/20 border border-white/5' : 'bg-slate-300 shadow-inner border border-slate-400'}`}>
            
            {channels.map(ch => {
              const isSelected = selectedId === ch.id;
              return (
                <div
                  key={ch.id}
                  ref={el => { channelRefs.current[ch.id] = el; }}
                  className={`flex flex-col gap-2 transition-all p-3 md:p-4 rounded-2xl cursor-pointer select-none ${
                    isSelected 
                      ? (skin === 'modern' ? 'bg-slate-800/80 ring-2 ring-blue-500/80 shadow-2xl scale-[1.01]' : 'bg-white/95 shadow-xl ring-2 ring-blue-600 scale-[1.01]') 
                      : (skin === 'modern' ? 'bg-slate-900/50 hover:bg-slate-900/80 border border-white/5' : 'bg-slate-205/90 hover:bg-white/60 border border-slate-400')
                  }`}
                  onClick={() => setSelectedId(ch.id)}
                >
                  {/* Channel Header */}
                  <div className={`w-full py-1 rounded-md text-[10px] md:text-[11px] font-black uppercase text-center tracking-widest ${isSelected ? 'bg-blue-600 text-white animate-pulse' : (skin === 'modern' ? 'bg-slate-950 text-slate-500' : 'bg-slate-400 text-slate-700')}`}>
                    CH {ch.id}
                  </div>

                  {/* 3 Column Sub-strips Grid */}
                  <div className="flex gap-3 md:gap-4 flex-1">
                    
                    {/* ── Column 1: Input & Routing & Fader ── */}
                    <div className="flex flex-col items-center gap-2 w-[64px] md:w-[74px] bg-black/15 p-1.5 md:p-2 rounded-xl border border-white/5 self-stretch justify-between">
                      <div className="text-[6px] md:text-[8px] font-black text-slate-300 uppercase tracking-wider mb-0.5">Strip</div>
                      
                      {/* Knob Group */}
                      <div className="flex flex-col gap-2 md:gap-2.5 items-center w-full">
                        {/* Trim (Input Level/Gain) */}
                        <Knob
                          label="Trim"
                          value={ch.gain}
                          min={0}
                          max={100}
                          onChange={(v) => updateChannel(ch.id, { gain: v })}
                        />

                        {/* Reverb send level */}
                        <Knob
                          label="Reverb"
                          value={ch.reverb}
                          min={0}
                          max={100}
                          unit="%"
                          onChange={(v) => updateChannel(ch.id, { reverb: v })}
                        />

                        {/* Panoramic positioning */}
                        <Knob
                          label="L Pan R"
                          value={ch.pan}
                          min={-100}
                          max={100}
                          onChange={(v) => updateChannel(ch.id, { pan: v })}
                        />

                        {/* Mute & Solo Buttons Stack (Integrated inside Knob Group vertically: Solo on top, Mute on bottom) */}
                        <div className="w-full flex flex-col gap-1 mt-1">
                          {/* Solo Button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); updateChannel(ch.id, { solo: !ch.solo }); }}
                            className={`w-full py-1 rounded font-black text-[8px] md:text-[9px] uppercase border transition-all ${
                              ch.solo 
                                ? 'bg-yellow-500 border-yellow-300 text-black shadow-md shadow-yellow-500/30' 
                                : (skin === 'modern' ? 'bg-slate-950 border-slate-801 text-slate-600 hover:text-slate-400' : 'bg-slate-350 border-slate-400 text-slate-705 hover:bg-slate-400')
                            }`}
                          >
                            solo
                          </button>

                          {/* Mute Button (Analog tactile look) */}
                          <button
                            onClick={(e) => { e.stopPropagation(); updateChannel(ch.id, { muted: !ch.muted }); }}
                            className={`w-full py-1 rounded font-black text-[8px] md:text-[9px] uppercase border transition-all ${
                              ch.muted 
                                ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30' 
                                : (skin === 'modern' ? 'bg-slate-950 border-slate-801 text-slate-600 hover:text-slate-400' : 'bg-slate-350 border-slate-400 text-slate-705 hover:bg-slate-400')
                            }`}
                          >
                            mute
                          </button>
                        </div>
                      </div>

                      {/* LED Meter + Vertical Fader Container */}
                      <div className="flex gap-1 h-32 md:h-40 w-full mt-2">
                        {/* Compact Channel Meter */}
                        <div className="h-full w-2 md:w-3 bg-[#0a0a0d] border border-slate-800/80 rounded-[4px] flex flex-col-reverse p-0.5 overflow-hidden gap-[1px]">
                          {[...Array(12)].map((_, i) => {
                            const level = (i / 11) * 100;
                            const val = channelMeters[ch.id] || 0;
                            const isActive = val >= level && val > 0;
                            let dotColor = 'bg-green-500/10';
                            if (isActive) {
                              if (level > 85) dotColor = 'bg-red-500 shadow-[0_0_6px_#f87171]';
                              else if (level > 65) dotColor = 'bg-yellow-405 shadow-[0_0_5px_#facc15]';
                              else dotColor = 'bg-green-400 shadow-[0_0_4px_#4ade80]';
                            } else {
                              if (level > 85) dotColor = 'bg-red-950/10';
                              else if (level > 65) dotColor = 'bg-yellow-950/10';
                              else dotColor = 'bg-green-950/10';
                            }
                            return (
                              <div key={i} className={`h-[6%] w-full rounded-[1px] transition-all duration-75 ${dotColor}`} />
                            );
                          })}
                        </div>

                        {/* Interactive vertical Fader track layout */}
                        <div className={`flex-1 relative rounded-lg border flex items-center justify-center p-0.5 shadow-inner ${skin === 'modern' ? 'bg-[#08080b] border-slate-800/80' : 'bg-slate-800 border-slate-900'}`}>
                          {/* Hash ticks on track */}
                          <div className="absolute inset-y-0 flex flex-col justify-between py-2 pointer-events-none opacity-10">
                            {[...Array(9)].map((_, i) => <div key={i} className="h-[1px] w-3 bg-white" />)}
                          </div>
                          
                          <input
                            type="range" min="0" max="100" value={ch.fader}
                            onChange={(e) => updateChannel(ch.id, { fader: parseInt(e.target.value) })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            style={{ writingMode: 'vertical-lr', direction: 'rtl' } as any}
                          />

                          {/* Blue caps indicating level */}
                          <motion.div
                            animate={{ bottom: `${ch.fader}%` }}
                            className="absolute w-full h-6 md:h-9 bg-gradient-to-r from-slate-205 via-slate-100 to-slate-205 border-y-2 border-[#1e40af] rounded shadow-lg z-10 pointer-events-none flex flex-col items-center justify-center"
                            style={{ transform: 'translateY(50%)' }}
                          >
                            <div className="w-[12%] h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* ── Column 2: Parametric Swept-Mid Equalizer ── */}
                    <div className="flex flex-col items-center gap-2 w-[64px] md:w-[74px] bg-black/15 p-1.5 md:p-2.5 rounded-xl border border-white/5 self-stretch justify-between">
                      <div className="text-[6px] md:text-[8px] font-black text-slate-300 uppercase tracking-wider mb-0.5">EQ</div>
                      
                      {/* Knob Group */}
                      <div className="flex flex-col gap-2 md:gap-2.5 items-center w-full">
                        {/* High Shelf EQ Gain */}
                        <Knob
                          label="High"
                          value={ch.eq.high}
                          min={-12}
                          max={12}
                          unit="dB"
                          onChange={(v) => updateChannel(ch.id, { eq: { ...ch.eq, high: v } })}
                        />

                        {/* Mid Crossover sweepable center frequency */}
                        <Knob
                          label="Mid Freq"
                          value={ch.eq.midFreq}
                          min={250}
                          max={5000}
                          unit="Hz"
                          onChange={(v) => updateChannel(ch.id, { eq: { ...ch.eq, midFreq: Math.round(v) } })}
                        />

                        {/* Mid Peaking EQ Gain */}
                        <Knob
                          label="Mid gain"
                          value={ch.eq.mid}
                          min={-12}
                          max={12}
                          unit="dB"
                          onChange={(v) => updateChannel(ch.id, { eq: { ...ch.eq, mid: v } })}
                        />

                        {/* Low Shelf EQ Gain */}
                        <Knob
                          label="Low"
                          value={ch.eq.low}
                          min={-12}
                          max={12}
                          unit="dB"
                          onChange={(v) => updateChannel(ch.id, { eq: { ...ch.eq, low: v } })}
                        />
                      </div>

                      {/* High Pass Filter rumble killer */}
                      <button
                        onClick={(e) => { e.stopPropagation(); updateChannel(ch.id, { hpf: !ch.hpf }); }}
                        className={`w-full py-1 rounded text-[7px] md:text-[8px] font-black uppercase border transition-all mt-auto ${
                          ch.hpf 
                            ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30' 
                            : (skin === 'modern' ? 'bg-slate-950 border-slate-805 text-slate-600' : 'bg-slate-350 border-[#475569]/30 text-slate-600')
                        }`}
                      >
                        HPF
                      </button>
                    </div>

                    {/* ── Column 3: Dynamics Compressor ── */}
                    <div className="flex flex-col items-center gap-2 w-[64px] md:w-[74px] bg-black/15 p-1.5 md:p-2.5 rounded-xl border border-white/5 self-stretch justify-between">
                      <div className="text-[6px] md:text-[8px] font-black text-slate-300 uppercase tracking-wider mb-0.5">COMP</div>
                      
                      {/* Knob Group */}
                      <div className="flex flex-col gap-2 md:gap-2.5 items-center w-full">
                        {/* Comp Attack Speed */}
                        <Knob
                          label="Attack"
                          value={ch.comp.attack}
                          min={1}
                          max={100}
                          unit="ms"
                          onChange={(v) => updateChannel(ch.id, { comp: { ...ch.comp, attack: v } })}
                        />

                        {/* Comp Release Delay */}
                        <Knob
                          label="Release"
                          value={ch.comp.release}
                          min={10}
                          max={1000}
                          unit="ms"
                          onChange={(v) => updateChannel(ch.id, { comp: { ...ch.comp, release: v } })}
                        />

                        {/* Comp Threshold trigger point */}
                        <Knob
                          label="Thresh"
                          value={ch.comp.threshold}
                          min={-60}
                          max={0}
                          unit="dB"
                          onChange={(v) => updateChannel(ch.id, { comp: { ...ch.comp, threshold: v } })}
                        />

                        {/* Perfect spacer to align with the 4th Knob of EQ */}
                        <div className="h-[43px] md:h-[53px] w-full flex items-center justify-center opacity-0 pointer-events-none" />
                      </div>

                      {/* Feedback Dynamics LEDs representing current GR */}
                      <div className="w-full flex flex-col items-center gap-1 mt-auto">
                        <span className="text-[5px] md:text-[7px] font-bold text-slate-600 uppercase tracking-tighter">GR Level</span>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900/80 relative">
                          <motion.div 
                            animate={{ 
                              width: isPlaying && ch.fader > 30 && Math.abs((ch.fader + ch.id) % 4) > 1 
                                ? `${Math.floor(25 + Math.random() * 45)}%` 
                                : '0%' 
                            }}
                            className="h-full bg-orange-500" 
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Aesthetic Tape Scribble at Bottom of Channel strip */}
                  <div className="mt-2 w-full px-2 py-2 bg-[#fef08a] border border-[#fef3c7] rounded shadow-[1px_2px_4px_rgba(0,0,0,0.15)] flex items-center justify-center select-none">
                    <span className="text-[11px] md:text-[13px] font-sans italic font-black text-slate-800 tracking-tight leading-none text-center truncate">
                      {ch.name}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* SPACER */}
            <div className="w-[1px] self-stretch bg-slate-700/20 dark:bg-white/5 my-2 animate-pulse" />

            {/* Yamaha SPX Reverb Return Strip */}
            <div 
              ref={el => { channelRefs.current[5] = el; }}
              onClick={() => handleStripSelect(5)}
              className={`w-[78px] md:w-[90px] flex flex-col items-center gap-2 p-1.5 rounded-2xl border cursor-pointer select-none transition-all ${
                focusedStripId === 5 
                  ? (skin === 'modern' ? 'bg-slate-800/80 ring-2 ring-blue-500/80 shadow-2xl scale-[1.01]' : 'bg-white shadow-xl ring-2 ring-blue-600 scale-[1.01]') 
                  : (skin === 'modern' ? 'bg-slate-900/50 hover:bg-slate-900/85 border border-white/5' : 'bg-slate-200 border border-slate-400')
              }`}
            >
              <div className="w-full text-center text-[7px] md:text-[8px] font-black uppercase tracking-wider text-blue-400 bg-blue-950/40 py-1 rounded leading-none">
                SPX Return
              </div>
              
              <div className="flex flex-col gap-5 py-4 items-center flex-1 justify-start">
                <Knob 
                  label="Reverb Size" 
                  value={reverbSize} 
                  min={0.5} 
                  max={4.0} 
                  unit="s" 
                  onChange={(v) => { 
                    setReverbSize(v);
                    const ctx = audioCtxRef.current;
                    if (ctx && convolverNodeRef.current) {
                      convolverNodeRef.current.buffer = createReverbImpulseResponse(ctx, v, 1.5);
                    }
                  }} 
                />
                
                <Knob 
                  label="Eff Return" 
                  value={reverbMix} 
                  min={0} 
                  max={100} 
                  unit="%" 
                  onChange={(v) => setReverbMix(v)} 
                />
              </div>

              {/* Tape for Return */}
              <div className="mt-auto w-full px-1 py-1.5 bg-[#cbd5e1] border border-slate-300 rounded shadow-[1px_2px_4px_rgba(0,0,0,0.15)] flex items-center justify-center select-none">
                <span className="text-[9px] md:text-[10px] font-sans font-black text-slate-700 tracking-tight leading-none text-center truncate">
                  FX RET
                </span>
              </div>
            </div>

            <div className="w-[1px] self-stretch bg-slate-700/20 dark:bg-white/5 my-2" />

            {/* Stereo Master Out Strip */}
            <div 
              ref={el => { channelRefs.current[6] = el; }}
              onClick={() => handleStripSelect(6)}
              className={`w-[84px] md:w-[102px] border-l border-white/5 pl-1.5 ml-0.5 flex flex-col items-center gap-2 rounded-2xl p-1.5 self-stretch cursor-pointer select-none transition-all ${
                focusedStripId === 6 
                  ? (skin === 'modern' ? 'bg-slate-800/80 ring-2 ring-blue-500/80 shadow-2xl scale-[1.01]' : 'bg-white shadow-xl ring-2 ring-blue-600 scale-[1.01]') 
                  : (skin === 'modern' ? 'bg-slate-900/50 hover:bg-slate-900/85 border border-white/5' : 'bg-slate-200 border border-slate-400')
              }`}
            >
              
              {user && (
                <div className="flex gap-1 w-full">
                  <button 
                    onClick={saveMix}
                    className="flex-1 py-1 bg-slate-900 border border-slate-700 rounded-lg hover:border-blue-500 transition-all group"
                    title="Save Mix Preset"
                  >
                    <Save size={11} className="text-slate-500 group-hover:text-blue-500 mx-auto" />
                  </button>
                </div>
              )}

              <button
                onClick={(e) => { initWebAudio(); showInfo(e, 'Master Output', 'Main stereo output terminal fader.'); }}
                className="w-full h-8 md:h-10 bg-red-650 rounded-lg flex flex-col items-center justify-center border border-red-500 shadow-lg shadow-red-600/10 hover:bg-red-600 transition-colors"
              >
                <span className="text-[8px] md:text-[9px] font-black text-white uppercase italic leading-none">MAIN</span>
              </button>

              {/* Stereo Output dual VUs */}
              <div className="flex gap-1 h-32 md:h-44 w-7 md:w-9 bg-black rounded p-0.5 overflow-hidden border border-slate-800">
                <div className="flex-1 bg-green-500/5 rounded-sm relative overflow-hidden flex flex-col-reverse gap-[1px]">
                  {[...Array(12)].map((_, i) => {
                    const level = (i / 11) * 100;
                    const isActive = masterMeter >= level && masterMeter > 0;
                    let dotColor = isActive ? (level > 85 ? 'bg-red-500' : level > 65 ? 'bg-yellow-405' : 'bg-green-400') : 'bg-slate-950/60';
                    return <div key={i} className={`h-[7%] w-full rounded-[1px] ${dotColor}`} />;
                  })}
                </div>
                <div className="flex-1 bg-green-500/5 rounded-sm relative overflow-hidden flex flex-col-reverse gap-[1px]">
                  {[...Array(12)].map((_, i) => {
                    const level = (i / 11) * 100;
                    const isActive = masterMeter * 0.95 >= level && masterMeter > 0;
                    let dotColor = isActive ? (level > 85 ? 'bg-red-500' : level > 65 ? 'bg-yellow-405' : 'bg-green-400') : 'bg-slate-950/60';
                    return <div key={i} className={`h-[7%] w-full rounded-[1px] ${dotColor}`} />;
                  })}
                </div>
              </div>

              {/* Master Stereo Fader cap */}
              <div className={`relative h-36 md:h-48 w-8 md:w-10 rounded-xl border flex items-center justify-center p-0.5 shadow-inner mt-auto ${skin === 'modern' ? 'bg-[#08080b] border-slate-800' : 'bg-slate-800'}`}>
                <div className="absolute inset-y-0 inset-x-0.5 flex flex-col justify-between py-3 pointer-events-none opacity-20">
                  {[...Array(9)].map((_, i) => <div key={i} className="h-[1px] w-full bg-slate-400" />)}
                </div>
                <input
                  type="range" min="0" max="100" value={masterFader}
                  onChange={(e) => setMasterFader(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  style={{ writingMode: 'vertical-lr', direction: 'rtl' } as any}
                />
                <motion.div
                  animate={{ bottom: `${masterFader}%` }}
                  className="absolute w-full h-6 md:h-10 bg-gradient-to-r from-red-200 via-red-100 to-red-205 border-y-2 border-red-750 rounded shadow-lg z-10 pointer-events-none flex flex-col items-center justify-center"
                  style={{ transform: 'translateY(50%)' }}
                >
                  <div className="w-[12%] h-full bg-red-650 shadow-[0_0_8px_#dc2626]" />
                </motion.div>
              </div>

              <div className="w-full px-1 py-1.5 bg-[#fecaca] border border-red-200 rounded shadow-[1px_2px_4px_rgba(0,0,0,0.15)] flex items-center justify-center select-none">
                <span className="text-[9px] md:text-[10px] font-sans font-black text-red-800 tracking-tight leading-none text-center truncate">
                  STEREO
                </span>
              </div>
            </div>

          </div>
        </div>
        </div>

        {/* Right Panel: Console Monitor & Training Handbook */}
        <div className={`lg:w-[320px] xl:w-[350px] shrink-0 rounded-[1.5rem] border overflow-hidden flex flex-col min-w-full lg:min-w-0 order-1 lg:order-2 mb-2 lg:mb-0 transition-colors ${skin === 'modern' ? 'bg-slate-800/40 border-white/5' : 'bg-slate-200 border-black/10'}`}>
          <div className={`p-2 md:p-3 border-b flex items-center justify-between shrink-0 ${skin === 'modern' ? 'bg-slate-900 border-white/5' : 'bg-slate-400 border-black/10'}`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 shadow-inner">
                <Activity size={13} />
              </div>
              <div>
                <h3 className={`text-[10px] md:text-sm font-bold uppercase italic ${skin === 'modern' ? 'text-white' : 'text-slate-900'}`}>CONSOLE MONITOR</h3>
                <p className={`text-[7px] md:text-[10px] font-black tracking-widest leading-none ${skin === 'modern' ? 'text-slate-500' : 'text-slate-700'}`}>TRAINING SUITE</p>
              </div>
            </div>
          </div>

          <div className="p-3 md:p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">

            {/* ── Stage Monitor (Always visualizes the sound) ── */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none flex items-center gap-1.5">
                  <Activity size={10} className="text-blue-500" /> Live worship scene
                </span>
                <span className="text-[6px] md:text-[8px] font-bold text-slate-600 uppercase">Interactive Screen</span>
              </div>

              <div className={`aspect-video rounded-xl border overflow-hidden relative ${skin === 'modern' ? 'bg-black border-white/10' : 'bg-slate-900 border-black/20'}`}>
                {currentSong ? (
                  currentSong.type === 'youtube' ? (
                    <div className="w-full h-full relative">
                      <iframe
                        key={currentSong.id}
                        src={getYouTubeEmbedUrl(currentSong.url)}
                        className="w-full h-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title={currentSong.title}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/85 text-center py-1.5 pointer-events-none">
                        <span className="text-[8px] text-blue-300 font-bold uppercase tracking-widest">
                          ▶ Press Play inside the video container
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/60 p-3 text-center gap-2">
                      <Waves size={24} className={isPlaying ? 'text-blue-500 animate-pulse' : 'text-blue-500/20'} />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {isPlaying ? `Playing: ${currentSong.title}` : 'Audio Idle'}
                      </span>
                      {isPlaying && (
                        <div className="flex gap-0.5 items-end h-6">
                          {[...Array(15)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [`${15 + Math.random() * 85}%`, `${15 + Math.random() * 85}%`] }}
                              transition={{ duration: 0.2 + Math.random() * 0.4, repeat: Infinity, repeatType: 'reverse' }}
                              className="w-1 bg-blue-500/60 rounded-full"
                              style={{ height: '30%' }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-950/60 text-center gap-2">
                    <Music size={18} className="animate-pulse text-blue-500/30" />
                    <span className="text-[9px] font-black text-white uppercase">No Practice Track</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Active Channel Indicator Helper ── */}
            <div className={`p-3 rounded-xl border ${skin === 'modern' ? 'bg-slate-950/40 border-white/5' : 'bg-white border-black/10 shadow-sm'}`}>
              <div className="flex items-center gap-2.5 mb-2 border-b border-dashed pb-1.5 border-slate-705/30">
                <span className={`w-5 h-5 rounded flex items-center justify-center text-white font-black text-[10px] leading-none ${selectedChannel.color}`}>{selectedChannel.id}</span>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-wide">Selected: {selectedChannel.name}</h4>
                  <p className="text-[7px] text-slate-500 font-bold uppercase leading-none">Tuning active console strip</p>
                </div>
              </div>
              
              <div className="space-y-2 text-[10px] text-slate-400 font-medium leading-relaxed">
                <p>You can adjust this channel's <strong className="text-white">Trim, Reverb, Pan, custom fine-swept EQ</strong>, and <strong className="text-white">dynamic Compression threshold</strong> directly on the mixer desk in parallel.</p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <div className="bg-slate-900/60 p-1.5 rounded border border-white/5 text-center">
                    <span className="block text-[6px] text-slate-500 uppercase font-black">HPF state</span>
                    <span className={`text-[8px] font-bold ${selectedChannel.hpf ? 'text-green-400' : 'text-slate-600'}`}>{selectedChannel.hpf ? 'ON (80Hz Cut)' : 'OFF (Full Bypass)'}</span>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded border border-white/5 text-center">
                    <span className="block text-[6px] text-slate-500 uppercase font-black">Swept Mid Range</span>
                    <span className="text-[8px] font-black text-blue-400">{selectedChannel.eq.midFreq}Hz</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SOUND ENGINEER HANDBOOK (Interactive help panel) ── */}
            <div className={`p-3 rounded-xl border ${skin === 'modern' ? 'bg-slate-900/50 border-white/5' : 'bg-slate-300 border-black/10'}`}>
              <h4 className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1.5 italic">SOUND TRAINING METHOD</h4>
              
              <div className="space-y-3">
                {/* Topic 1: Gain Structure */}
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-wider text-blue-300">1. Gain (Trim) structure</span>
                  <p className="text-[9px] text-slate-400 leading-snug">Set the top **Trim** knob so that loud vocal snaps bounce the channel meter primarily in the green and yellow zones. Don't hit red peak zone to avoid harsh clipping distortion.</p>
                </div>

                {/* Topic 2: High Pass Filter */}
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-wider text-blue-300">2. Low-frequency Mud Cut (HPF)</span>
                  <p className="text-[9px] text-slate-400 leading-snug">Press **HPF** to dynamically clean low end rumble on Vocals & Guitars. Keep HPF off on Bass Instrument to retain natural punchy power.</p>
                </div>

                {/* Topic 3: 3-Band Swept EQ */}
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-wider text-blue-300">3. Parametric Vocal Tuning</span>
                  <p className="text-[9px] text-slate-400 leading-snug">Adjust **Mid Crossover Freq** (e.g., 2000Hz for speech presence, 500Hz for guitar scoop) and apply safe cut/boost gains to sculpt a beautifully transparent frequency room mix.</p>
                </div>

                {/* Topic 4: Dynamic Control */}
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-wider text-blue-300">4. Dynamic Compression (COMP)</span>
                  <p className="text-[9px] text-slate-400 leading-snug">Turn down **Thresh** and dial in custom **Attack & Release** times to cleanly compress highly dynamic singers and level out inconsistent worship transients.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Tooltip ── */}
      <AnimatePresence>
        {info && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed z-[9999] pointer-events-none"
            style={{ left: `${info.x}px`, top: `${info.y}px`, transform: 'translate(-50%, -100%)' }}
          >
            <div className="bg-[#1e293b] text-white p-3 rounded-lg shadow-2xl border border-white/20 pointer-events-auto w-[220px]">
              <div className="flex items-start gap-2">
                <div className="bg-blue-600 p-1 rounded-md shrink-0"><HelpCircle size={14} className="text-white" /></div>
                <div className="flex-1">
                  <h3 className="font-black text-[10px] uppercase tracking-wider mb-1 text-blue-400">{info.title}</h3>
                  <p className="text-slate-200 text-[10px] leading-snug font-medium">{info.desc}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setInfo(null); }} className="p-0.5 hover:bg-white/10 rounded-md transition-all self-start">
                  <Square size={8} className="text-slate-500" />
                </button>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1e293b]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};
