import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Activity, Play, Square, Music, Waves, Mic, MicOff, Plus, Trash2, X, ChevronDown, Volume2, Power } from 'lucide-react';
import { Logo } from './Logo';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ChannelData {
  id: number;
  name: string;
  trim: number;       // 0-100
  reverb: number;     // 0-100
  pan: number;        // -100 to 100
  muted: boolean;
  solo: boolean;
  fader: number;      // 0-100
  eq: { high: number; midFreq: number; midGain: number; low: number }; // each 0-100
  comp: { attack: number; release: number; threshold: number }; // each 0-100
}

interface Song {
  id: string; title: string; url: string; artist?: string; type: 'file' | 'youtube';
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const DEFAULT_SONGS: Song[] = [
  { id: 'y1', title: 'Anugrako Inar',           artist: 'Adrian Dewan',        url: 'https://www.youtube.com/watch?v=BLJcYljOq-U', type: 'youtube' },
  { id: 'y2', title: 'All I Want for Christmas', artist: 'Mariah Carey',        url: 'https://www.youtube.com/watch?v=aAkMkVFwAoo', type: 'youtube' },
  { id: 'y3', title: 'Last Christmas',           artist: 'Wham!',               url: 'https://www.youtube.com/watch?v=KhqNTjbQ71A', type: 'youtube' },
  { id: 'y4', title: 'Golden',                   artist: 'KPop Demon Hunters',  url: 'https://www.youtube.com/watch?v=yebNIHKAC4A', type: 'youtube' },
  { id: 'y5', title: 'Dynamite',                 artist: 'BTS',                 url: 'https://www.youtube.com/watch?v=gdZLi9oWNZg', type: 'youtube' },
];

const INITIAL_CHANNELS: ChannelData[] = [
  { id: 1, name: 'Drums & Percussion', trim: 55, reverb: 20, pan: 0,   muted: false, solo: false, fader: 70, eq: { high: 65, midFreq: 50, midGain: 55, low: 60 }, comp: { attack: 40, release: 50, threshold: 45 } },
  { id: 2, name: 'Guitar / Piano',     trim: 60, reverb: 35, pan: -15, muted: false, solo: false, fader: 75, eq: { high: 70, midFreq: 55, midGain: 50, low: 45 }, comp: { attack: 50, release: 55, threshold: 50 } },
  { id: 3, name: 'Vocals',             trim: 65, reverb: 40, pan: 5,   muted: false, solo: false, fader: 80, eq: { high: 60, midFreq: 60, midGain: 65, low: 40 }, comp: { attack: 35, release: 45, threshold: 55 } },
  { id: 4, name: 'Keys / Synth',       trim: 50, reverb: 25, pan: 20,  muted: false, solo: false, fader: 65, eq: { high: 55, midFreq: 45, midGain: 48, low: 50 }, comp: { attack: 55, release: 60, threshold: 48 } },
];

const HELP_INFO: Record<string, { title: string; desc: string }> = {
  trim:      { title: 'Trim (Input Gain)',      desc: 'Sets the input sensitivity before signal enters the channel. Adjust so peaks are just below clipping — typically between 12 o\'clock and 3 o\'clock on a real console.' },
  reverb:    { title: 'Reverb Send',            desc: 'Controls how much of this channel is sent to the reverb bus. Use sparingly for vocals; too much makes a mix sound washy and distant.' },
  pan:       { title: 'Stereo Pan',             desc: 'Positions the channel in the left/right stereo field. Keep lead vocals at centre (12 o\'clock). Spread instruments to create width without extra volume.' },
  mute:      { title: 'Mute',                   desc: 'Silences this channel completely. Always mute unused mics to prevent feedback and unwanted room noise during a service.' },
  solo:      { title: 'Solo (PFL)',             desc: 'Pre-Fader Listen: routes this channel to your headphones only, without changing the main mix. Essential for checking if a mic is active and at the right level.' },
  fader:     { title: 'Volume Fader',           desc: 'Your main mixing tool after Gain is set. Adjust faders for balance. Small moves — 2 to 3 dB — make a big difference at front-of-house.' },
  eqHigh:    { title: 'EQ — High (Treble)',     desc: 'Boosts or cuts high frequencies (typically 8–12 kHz). A gentle boost adds air and presence to vocals. Cut if the mix sounds harsh or sibilant.' },
  eqMidFreq: { title: 'EQ — Mid Frequency',     desc: 'Selects which midrange frequency to boost or cut. Sweeping this knob while boosting helps you find problem resonances — then cut them.' },
  eqMidGain: { title: 'EQ — Mid Gain',          desc: 'Boosts or cuts the selected midrange frequency. Cut 250–400 Hz to remove boxiness; boost 2–4 kHz for vocal presence and intelligibility.' },
  eqLow:     { title: 'EQ — Low (Bass)',        desc: 'Boosts or cuts low frequencies (typically 80–200 Hz). Cut for everything except kick drum and bass. Boosting adds warmth but quickly causes muddiness.' },
  compAttack:    { title: 'Compressor — Attack',    desc: 'How fast the compressor clamps down after a signal exceeds the threshold. Slower attack lets the initial transient through — great for drums and guitars. Fast attack controls peaks on vocals.' },
  compRelease:   { title: 'Compressor — Release',   desc: 'How quickly the compressor lets go after the signal drops below the threshold. Too fast causes "pumping"; too slow makes the mix sound strangled.' },
  compThreshold: { title: 'Compressor — Threshold', desc: 'The level at which compression begins. Lower threshold = more compression. Start around –18 dBFS for vocals and adjust until gain reduction is 3–6 dB on peaks.' },
  reverbSize: { title: 'Reverb Size',           desc: 'Sets the overall size of the reverb space — from a small room to a large hall. Larger rooms sound more natural but take longer to decay. Match to your actual room size.' },
  masterReverb: { title: 'Master Reverb',       desc: 'Global wet/dry mix of the reverb effect across all channels. Keep this moderate — too much reverb reduces clarity and makes speech less intelligible.' },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getYouTubeVideoId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]{11})/);
  return m ? m[1] : null;
}
function getYouTubeEmbedUrl(url: string): string {
  const id = getYouTubeVideoId(url) || '';
  return `https://www.youtube.com/embed/${id}?enablejsapi=1&controls=1&rel=0&modestbranding=1`;
}
async function fetchYouTubeTitle(url: string): Promise<{ title: string; author: string }> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (!res.ok) throw new Error();
    const d = await res.json();
    return { title: d.title || 'Untitled', author: d.author_name || '' };
  } catch { return { title: 'YouTube Track', author: '' }; }
}

// ─────────────────────────────────────────────
// Knob Component — beautiful circular knob
// ─────────────────────────────────────────────
interface KnobProps {
  value: number; // 0-100
  onChange: (v: number) => void;
  size?: number;
  color?: string;
  label: string;
  onHelp?: () => void;
}
const Knob: React.FC<KnobProps> = ({ value, onChange, size = 48, color = '#3b82f6', label, onHelp }) => {
  const dragging = useRef(false);
  const startY   = useRef(0);
  const startVal = useRef(0);

  const angle = -145 + (value / 100) * 290; // -145° to +145°

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true; startY.current = e.clientY; startVal.current = value;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const delta = (startY.current - e.clientY) * 0.8;
    onChange(Math.min(100, Math.max(0, startVal.current + delta)));
  };
  const onPointerUp = () => { dragging.current = false; };

  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const rad = (angle - 90) * (Math.PI / 180);
  const dotX = cx + r * Math.cos(rad);
  const dotY = cy + r * Math.sin(rad);

  // Arc path for value indicator
  const startAngle = (-145 - 90) * (Math.PI / 180);
  const endAngle   = (angle - 90) * (Math.PI / 180);
  const arcR = r + 3;
  const x1 = cx + arcR * Math.cos(startAngle), y1 = cy + arcR * Math.sin(startAngle);
  const x2 = cx + arcR * Math.cos(endAngle),   y2 = cy + arcR * Math.sin(endAngle);
  const largeArc = (angle + 145) > 180 ? 1 : 0;

  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      <div className="relative"
           onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
           style={{ width: size, height: size, cursor: 'ns-resize', touchAction: 'none' }}>
        <svg width={size} height={size}>
          {/* Outer ring track */}
          <circle cx={cx} cy={cy} r={arcR} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
          {/* Value arc */}
          {value > 0 && (
            <path d={`M ${x1} ${y1} A ${arcR} ${arcR} 0 ${largeArc} 1 ${x2} ${y2}`}
                  fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          )}
          {/* Knob body — outer shadow ring */}
          <circle cx={cx} cy={cy} r={r} fill="url(#knobGrad)" />
          {/* Gloss highlight */}
          <ellipse cx={cx - r * 0.15} cy={cy - r * 0.3} rx={r * 0.4} ry={r * 0.22}
                   fill="rgba(255,255,255,0.12)" />
          {/* Indicator dot */}
          <circle cx={dotX} cy={dotY} r={size * 0.045} fill={color}
                  style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
          {/* Gradient def */}
          <defs>
            <radialGradient id="knobGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#4a5568" />
              <stop offset="50%" stopColor="#2d3748" />
              <stop offset="100%" stopColor="#1a202c" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div className="flex items-center gap-0.5">
        <span className="text-[8px] text-gray-400 font-medium leading-none tracking-wide">{label}</span>
        {onHelp && (
          <button onPointerDown={e => { e.stopPropagation(); onHelp(); }}
            className="w-3 h-3 rounded-full bg-orange-500 hover:bg-orange-400 flex items-center justify-center transition-colors shrink-0">
            <HelpCircle size={7} className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Vertical Fader Component
// ─────────────────────────────────────────────
interface FaderProps {
  value: number; onChange: (v: number) => void; height?: number; color?: string;
}
const VertFader: React.FC<FaderProps> = ({ value, onChange, height = 140, color = '#3b82f6' }) => {
  const dragging = useRef(false);
  const startY   = useRef(0);
  const startVal = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true; startY.current = e.clientY; startVal.current = value;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = 1 - (e.clientY - rect.top) / rect.height;
    onChange(Math.min(100, Math.max(0, pct * 100)));
  };
  const onPointerUp = () => { dragging.current = false; };

  const capBottom = (value / 100) * (height - 28);

  return (
    <div ref={trackRef} className="relative rounded-lg overflow-visible cursor-ns-resize"
         onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
         style={{ width: 22, height, cursor: 'ns-resize', touchAction: 'none', background: 'linear-gradient(to bottom, #0a0c10, #1a1d25)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Track groove */}
      <div className="absolute left-1/2 top-3 bottom-3 w-px -translate-x-1/2"
           style={{ background: 'rgba(255,255,255,0.06)' }} />
      {/* Tick marks */}
      {[0,25,50,75,100].map(pct => (
        <div key={pct} className="absolute left-1 right-1 h-px"
             style={{ bottom: `${12 + pct * (height - 24) / 100}px`, background: 'rgba(255,255,255,0.08)' }} />
      ))}
      {/* Fader cap */}
      <motion.div
        animate={{ bottom: capBottom }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="absolute left-0 right-0 rounded-md pointer-events-none flex flex-col items-center justify-center gap-0.5"
        style={{ height: 28, background: 'linear-gradient(180deg, #64748b 0%, #334155 40%, #1e293b 100%)',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.3)' }}>
        {/* Grip lines */}
        {[0,1,2].map(i => (
          <div key={i} className="w-3 h-px rounded-full" style={{ background: i === 1 ? color : 'rgba(255,255,255,0.15)',
               boxShadow: i === 1 ? `0 0 4px ${color}` : 'none' }} />
        ))}
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Pan Slider
// ─────────────────────────────────────────────
const PanSlider: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className="flex items-center gap-1 w-full">
      <span className="text-[7px] text-gray-500">L</span>
      <div className="flex-1 relative h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="absolute top-1/2 left-1/2 w-px h-2 -translate-x-1/2 -translate-y-1/2 bg-gray-600" />
        <div className="absolute top-0 h-full rounded-full bg-blue-500"
             style={{ left: value < 0 ? `${50 + value / 2}%` : '50%', width: `${Math.abs(value) / 2}%` }} />
        <input type="range" min="-100" max="100" value={value}
               onChange={e => onChange(+e.target.value)}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
      <span className="text-[7px] text-gray-500">R</span>
    </div>
    <span className="text-[7px] font-mono text-blue-400">
      {value === 0 ? 'C' : `${Math.abs(value)}${value < 0 ? 'L' : 'R'}`}
    </span>
  </div>
);

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export const VirtualMixer = () => {
  const [channels, setChannels]     = useState<ChannelData[]>(INITIAL_CHANNELS);
  const [info, setInfo]             = useState<{ title: string; desc: string } | null>(null);
  const [masterFader, setMasterFader] = useState(80);
  const [masterReverb, setMasterReverb] = useState(30);
  const [reverbSize, setReverbSize]    = useState(50);
  const [masterMeter, setMasterMeter]  = useState(0);
  const [isPlaying, setIsPlaying]    = useState(false);
  const [isLoading, setIsLoading]    = useState(false);
  const [songs, setSongs]            = useState<Song[]>(DEFAULT_SONGS);
  const [currentSong, setCurrentSong] = useState<Song>(DEFAULT_SONGS[0]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [ytInputUrl, setYtInputUrl]  = useState('');
  const [ytLoading, setYtLoading]    = useState(false);
  const [ytError, setYtError]        = useState('');
  const [showAddYt, setShowAddYt]    = useState(false);
  const [micActive, setMicActive]    = useState(false);
  const [toneActive, setToneActive]  = useState(false);
  const [audioReady, setAudioReady]  = useState(false);

  const audioCtxRef  = useRef<AudioContext | null>(null);
  const audioElRef   = useRef<HTMLAudioElement | null>(null);
  const gainRef      = useRef<GainNode | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const hpfRef       = useRef<BiquadFilterNode | null>(null);
  const panRef       = useRef<StereoPannerNode | null>(null);
  const eqRefs       = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micSrcRef    = useRef<MediaStreamAudioSourceNode | null>(null);
  const oscRef       = useRef<OscillatorNode | null>(null);

  const ch0 = channels[0]; // for Web Audio sync (selected channel concept simplified)

  // ── Init Web Audio ────────────────────────
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) { audioCtxRef.current.state === 'suspended' && audioCtxRef.current.resume(); return; }
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const audio = new Audio(); audio.preload = 'auto'; audio.loop = true;
    audio.addEventListener('playing', () => { setIsLoading(false); setIsPlaying(true); });
    audio.addEventListener('pause',   () => setIsPlaying(false));
    audio.addEventListener('waiting', () => setIsLoading(true));
    audio.addEventListener('canplay', () => setIsLoading(false));
    const src = ctx.createMediaElementSource(audio);
    const hpf = ctx.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 80;
    const eqL = ctx.createBiquadFilter(); eqL.type = 'lowshelf'; eqL.frequency.value = 100;
    const eqML = ctx.createBiquadFilter(); eqML.type = 'peaking'; eqML.frequency.value = 400;
    const eqMH = ctx.createBiquadFilter(); eqMH.type = 'peaking'; eqMH.frequency.value = 2500;
    const eqH = ctx.createBiquadFilter(); eqH.type = 'highshelf'; eqH.frequency.value = 8000;
    const pan = ctx.createStereoPanner();
    const gain = ctx.createGain();
    const analyser = ctx.createAnalyser(); analyser.fftSize = 64;
    src.connect(hpf); hpf.connect(eqL); eqL.connect(eqML); eqML.connect(eqMH);
    eqMH.connect(eqH); eqH.connect(pan); pan.connect(gain); gain.connect(analyser); analyser.connect(ctx.destination);
    audioCtxRef.current = ctx; audioElRef.current = audio;
    gainRef.current = gain; analyserRef.current = analyser;
    hpfRef.current = hpf; panRef.current = pan;
    eqRefs.current = { L: eqL, ML: eqML, MH: eqMH, H: eqH };
    ctx.state === 'suspended' && ctx.resume();
    setAudioReady(true);
  }, []);

  useEffect(() => {
    const ctx = audioCtxRef.current; if (!ctx || ctx.state === 'closed') return;
    const t = ctx.currentTime;
    const g = ch0.muted ? 0 : Math.pow(10, (ch0.fader - 70) / 20) * Math.pow(10, (masterFader - 80) / 20);
    gainRef.current?.gain.setTargetAtTime(g, t, 0.05);
    panRef.current?.pan.setTargetAtTime(ch0.pan / 100, t, 0.05);
    if (eqRefs.current) {
      eqRefs.current.L.gain.setTargetAtTime((ch0.eq.low - 50) / 5, t, 0.05);
      eqRefs.current.ML.gain.setTargetAtTime((ch0.eq.midGain - 50) / 5, t, 0.05);
      eqRefs.current.MH.gain.setTargetAtTime((ch0.eq.midFreq - 50) / 5, t, 0.05);
      eqRefs.current.H.gain.setTargetAtTime((ch0.eq.high - 50) / 5, t, 0.05);
    }
  }, [ch0, masterFader]);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      if (isPlaying) {
        if (currentSong.type === 'file' && analyserRef.current) {
          const d = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(d);
          setMasterMeter((d.reduce((a, b) => a + b, 0) / d.length / 255) * 100);
        } else setMasterMeter(38 + Math.random() * 24 + (Math.random() > 0.87 ? 20 : 0));
      } else setMasterMeter(p => Math.max(0, p - 5));
      raf = requestAnimationFrame(tick);
    };
    tick(); return () => cancelAnimationFrame(raf);
  }, [isPlaying, currentSong]);

  useEffect(() => () => {
    audioElRef.current?.pause(); audioCtxRef.current?.close().catch(() => {});
    micStreamRef.current?.getTracks().forEach(t => t.stop());
  }, []);
  useEffect(() => { const h = () => setInfo(null); window.addEventListener('pointerdown', h); return () => window.removeEventListener('pointerdown', h); }, []);

  const togglePlay = async () => {
    if (currentSong.type === 'youtube') { setIsPlaying(p => !p); return; }
    initAudio();
    const ctx = audioCtxRef.current; const audio = audioElRef.current;
    if (!ctx || !audio) return;
    if (isPlaying) { audio.pause(); return; }
    if (ctx.state === 'suspended') await ctx.resume();
    if (audio.src !== currentSong.url) { audio.src = currentSong.url; audio.load(); }
    setIsLoading(true);
    audio.play().catch(() => setIsLoading(false));
  };

  const selectSong = async (song: Song) => {
    const was = isPlaying; audioElRef.current?.pause(); setIsPlaying(false); setCurrentSong(song); setShowPlaylist(false);
    if (song.type === 'file') {
      initAudio(); const audio = audioElRef.current; const ctx = audioCtxRef.current; if (!audio) return;
      audio.src = song.url; audio.load();
      if (was) { ctx?.state === 'suspended' && await ctx?.resume(); setIsLoading(true); audio.play().catch(() => setIsLoading(false)); }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; initAudio();
    const url = URL.createObjectURL(file);
    const ns: Song = { id: 'f-' + Date.now(), title: file.name.replace(/\.\w+$/, ''), url, type: 'file' };
    setCurrentSong(ns);
    const audio = audioElRef.current;
    if (audio) { audio.src = url; audio.load(); audioCtxRef.current?.resume(); audio.play().catch(() => {}); }
  };

  const addYouTubeSong = async () => {
    const url = ytInputUrl.trim(); if (!url) return;
    const vid = getYouTubeVideoId(url);
    if (!vid) { setYtError('Invalid YouTube URL'); return; }
    if (songs.some(s => s.url.includes(vid))) { setYtError('Already in playlist'); return; }
    setYtError(''); setYtLoading(true);
    const { title, author } = await fetchYouTubeTitle(url);
    setSongs(p => [...p, { id: 'yt-' + vid, title, artist: author, url: `https://www.youtube.com/watch?v=${vid}`, type: 'youtube' }]);
    setYtInputUrl(''); setYtLoading(false); setShowAddYt(false);
  };

  const deleteSong = (id: string) => {
    setSongs(p => { const n = p.filter(s => s.id !== id); if (currentSong.id === id && n.length) selectSong(n[0]); return n; });
  };

  const toggleSoundCheck = () => {
    initAudio(); const ctx = audioCtxRef.current; if (!ctx) return; ctx.resume();
    if (toneActive) { oscRef.current?.stop(); setToneActive(false); return; }
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.frequency.value = 1000; g.gain.value = 0.12;
    osc.connect(g); g.connect(ctx.destination); osc.start();
    oscRef.current = osc; setToneActive(true);
    setTimeout(() => { osc.stop(); setToneActive(false); }, 800);
  };

  const toggleMic = async () => {
    if (micActive) {
      micStreamRef.current?.getTracks().forEach(t => t.stop()); micSrcRef.current?.disconnect();
      micStreamRef.current = null; micSrcRef.current = null; setMicActive(false);
    } else {
      try {
        initAudio(); await audioCtxRef.current?.resume();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        if (audioCtxRef.current && analyserRef.current) {
          const s = audioCtxRef.current.createMediaStreamSource(stream);
          s.connect(analyserRef.current); micSrcRef.current = s;
        }
        setMicActive(true);
      } catch (err: any) { alert(`Mic error: ${err.message}`); }
    }
  };

  const updateCh = (id: number, u: Partial<ChannelData>) =>
    setChannels(p => p.map(c => c.id === id ? { ...c, ...u } : c));
  const resetCh  = (id: number) =>
    setChannels(p => p.map(c => c.id === id ? { ...INITIAL_CHANNELS.find(ic => ic.id === id)! } : c));

  const showHelp = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setInfo(HELP_INFO[key] || { title: key, desc: '' });
  };

  // ─────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────
  const BLUE  = '#3b8ef5';
  const ORANGE = '#f97316';

  // Channel strip
  const ChannelStrip = ({ ch }: { ch: ChannelData }) => (
    <div className="flex shrink-0"
         style={{ width: 200, background: 'linear-gradient(180deg, #1e2230 0%, #181b26 100%)',
                  borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* ── LEFT SECTION: Trim / Reverb / Pan / Mute / Solo / Fader ── */}
      <div className="flex flex-col items-center gap-2 px-2 pt-3 pb-2" style={{ width: 68, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <Knob value={ch.trim} onChange={v => updateCh(ch.id, { trim: v })} size={40} color={BLUE} label="Trim"
              onHelp={() => setInfo(HELP_INFO.trim)} />
        <Knob value={ch.reverb} onChange={v => updateCh(ch.id, { reverb: v })} size={40} color={BLUE} label="Reverb"
              onHelp={() => setInfo(HELP_INFO.reverb)} />
        <PanSlider value={ch.pan} onChange={v => updateCh(ch.id, { pan: v })} />

        {/* Mute */}
        <button onClick={() => updateCh(ch.id, { muted: !ch.muted })}
          className="w-full rounded-lg text-[9px] font-black uppercase tracking-wider transition-all py-1.5"
          style={{ background: ch.muted ? '#dc2626' : 'linear-gradient(180deg,#2d3748,#1a202c)',
                   color: ch.muted ? 'white' : '#94a3b8',
                   border: ch.muted ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.1)',
                   boxShadow: ch.muted ? '0 0 12px rgba(220,38,38,0.4)' : 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
          mute
        </button>

        {/* Solo */}
        <button onClick={() => updateCh(ch.id, { solo: !ch.solo })}
          className="w-full rounded-lg text-[9px] font-black uppercase tracking-wider transition-all py-1.5"
          style={{ background: ch.solo ? 'linear-gradient(180deg,#64748b,#475569)' : 'linear-gradient(180deg,#374151,#1f2937)',
                   color: ch.solo ? 'white' : '#94a3b8',
                   border: ch.solo ? '1px solid #94a3b8' : '1px solid rgba(255,255,255,0.08)',
                   boxShadow: ch.solo ? '0 0 8px rgba(148,163,184,0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
          solo
        </button>

        {/* Fader */}
        <VertFader value={ch.fader} onChange={v => updateCh(ch.id, { fader: v })} height={130} color={BLUE} />
      </div>

      {/* ── MIDDLE SECTION: EQ Knobs ── */}
      <div className="flex flex-col items-center gap-2.5 px-2 pt-3 pb-2" style={{ width: 72, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <Knob value={ch.eq.high} onChange={v => updateCh(ch.id, { eq: { ...ch.eq, high: v } })} size={44} color={BLUE} label="High" onHelp={() => setInfo(HELP_INFO.eqHigh)} />
        <Knob value={ch.eq.midFreq} onChange={v => updateCh(ch.id, { eq: { ...ch.eq, midFreq: v } })} size={52} color={BLUE} label="Mid Freq" onHelp={() => setInfo(HELP_INFO.eqMidFreq)} />
        <Knob value={ch.eq.midGain} onChange={v => updateCh(ch.id, { eq: { ...ch.eq, midGain: v } })} size={44} color={BLUE} label="Mid Gain" onHelp={() => setInfo(HELP_INFO.eqMidGain)} />
        <Knob value={ch.eq.low} onChange={v => updateCh(ch.id, { eq: { ...ch.eq, low: v } })} size={52} color={BLUE} label="Low" onHelp={() => setInfo(HELP_INFO.eqLow)} />
        <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-auto">EQ</div>
      </div>

      {/* ── RIGHT SECTION: Compressor ── */}
      <div className="flex flex-col items-center gap-2.5 px-2 pt-3 pb-2" style={{ flex: 1 }}>
        <Knob value={ch.comp.attack} onChange={v => updateCh(ch.id, { comp: { ...ch.comp, attack: v } })} size={40} color={BLUE} label="Attack" onHelp={() => setInfo(HELP_INFO.compAttack)} />
        <Knob value={ch.comp.release} onChange={v => updateCh(ch.id, { comp: { ...ch.comp, release: v } })} size={40} color={BLUE} label="Release" onHelp={() => setInfo(HELP_INFO.compRelease)} />
        <Knob value={ch.comp.threshold} onChange={v => updateCh(ch.id, { comp: { ...ch.comp, threshold: v } })} size={44} color={BLUE} label="Threshold" onHelp={() => setInfo(HELP_INFO.compThreshold)} />
        <div className="text-[7px] text-gray-600 font-bold uppercase tracking-widest mt-auto">COMPRESSOR</div>
      </div>

      {/* ── BOTTOM: Channel name label (scrap-paper style) + help button ── */}
    </div>
  );

  // ─────────────────────────────────────────
  // FULL RENDER
  // ─────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-screen overflow-hidden"
         style={{ background: '#13151e', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ══════════════════════════════════════
          TOP BAR
      ══════════════════════════════════════ */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2 border-b"
           style={{ background: 'linear-gradient(180deg, #1e2230 0%, #181b26 100%)', borderColor: 'rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(59,142,245,0.1)', border: '1px solid rgba(59,142,245,0.3)' }}>
            <Logo size={22} />
          </div>
          <div>
            <div className="text-[12px] font-black uppercase tracking-widest text-white">
              Sound <span style={{ color: BLUE }}>Shepherd</span>
            </div>
            <div className="text-[7px] font-bold uppercase tracking-[0.2em] text-gray-500">Training Console</div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Transport controls */}
        <div className="flex items-center gap-2">
          {/* Play/Stop */}
          <button onClick={togglePlay} disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase text-white transition-all"
            style={{ background: isLoading ? '#374151' : isPlaying ? '#ea580c' : BLUE,
                     boxShadow: isPlaying ? '0 0 16px rgba(234,88,12,0.4)' : `0 0 16px rgba(59,142,245,0.3)` }}>
            {isLoading ? <Activity size={13} className="animate-spin" /> : isPlaying ? <Square size={13} fill="white" /> : <Play size={13} fill="white" />}
            <span>{isLoading ? 'Loading' : isPlaying ? 'Stop' : 'Play'}</span>
          </button>

          {/* Check */}
          <button onClick={toggleSoundCheck}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all"
            style={{ background: toneActive ? '#16a34a' : '#1e2230', color: toneActive ? 'white' : '#94a3b8',
                     border: '1px solid rgba(255,255,255,0.08)', boxShadow: toneActive ? '0 0 12px rgba(22,163,74,0.4)' : 'none' }}>
            <Volume2 size={12} /> Check
          </button>

          {/* Mic */}
          <button onClick={toggleMic}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all"
            style={{ background: micActive ? '#dc2626' : '#1e2230', color: micActive ? 'white' : '#94a3b8',
                     border: '1px solid rgba(255,255,255,0.08)', boxShadow: micActive ? '0 0 12px rgba(220,38,38,0.4)' : 'none' }}>
            {micActive ? <MicOff size={12} /> : <Mic size={12} />}
            <span className="hidden sm:inline">{micActive ? 'Mic On' : 'Mic'}</span>
          </button>

          {/* Upload */}
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase cursor-pointer transition-all"
                 style={{ background: '#1e2230', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
            <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
            <Music size={12} /><span className="hidden sm:inline">Upload</span>
          </label>

          <div className="w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Playlist picker */}
          <div className="relative">
            <button onClick={() => setShowPlaylist(p => !p)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-left"
              style={{ background: '#1e2230', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Music size={12} style={{ color: isPlaying ? BLUE : '#64748b' }} />
              <div>
                <div className="text-[7px] text-gray-500 uppercase font-bold tracking-widest leading-none">Now Playing</div>
                <div className="text-[10px] font-black text-white max-w-[130px] truncate uppercase">{currentSong.title}</div>
              </div>
              <ChevronDown size={11} className={`text-gray-500 transition-transform ${showPlaylist ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showPlaylist && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full mt-1 right-0 z-50 overflow-hidden rounded-xl"
                  style={{ width: 320, background: '#1e2230', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                  <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Playlist</span>
                    <button onClick={() => setShowAddYt(p => !p)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase text-white"
                      style={{ background: BLUE }}>
                      <Plus size={10} /> Add YouTube
                    </button>
                  </div>
                  <AnimatePresence>
                    {showAddYt && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="p-2 space-y-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                          <div className="flex gap-1.5">
                            <input type="text" value={ytInputUrl} autoFocus placeholder="Paste YouTube URL..."
                              onChange={e => { setYtInputUrl(e.target.value); setYtError(''); }}
                              onKeyDown={e => e.key === 'Enter' && addYouTubeSong()}
                              className="flex-1 rounded-lg px-2.5 py-1.5 text-[10px] text-white outline-none"
                              style={{ background: '#0d0f14', border: '1px solid rgba(255,255,255,0.1)' }} />
                            <button onClick={addYouTubeSong} disabled={ytLoading || !ytInputUrl.trim()}
                              className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase text-white"
                              style={{ background: BLUE }}>
                              {ytLoading ? '…' : 'Add'}
                            </button>
                          </div>
                          {ytError && <p className="text-[8px] text-red-400">{ytError}</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="max-h-64 overflow-y-auto">
                    {songs.map(s => (
                      <div key={s.id} className="flex items-center gap-2 px-2 py-2 group border-b last:border-0 transition-all"
                           style={{ borderColor: 'rgba(255,255,255,0.04)', background: currentSong.id === s.id ? 'rgba(59,142,245,0.08)' : 'transparent' }}>
                        <button onClick={() => selectSong(s)} className="flex-1 flex items-center gap-2.5 min-w-0 text-left">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                               style={{ background: currentSong.id === s.id ? BLUE : '#2d3748' }}>
                            {currentSong.id === s.id && isPlaying ? <Activity size={12} className="animate-pulse text-white" /> : <Music size={12} className="text-gray-400" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-black uppercase truncate" style={{ color: currentSong.id === s.id ? BLUE : 'white' }}>{s.title}</div>
                            <div className="flex items-center gap-1">
                              <span className="text-[7px] font-bold px-1 rounded border"
                                    style={{ color: s.type === 'youtube' ? '#f87171' : '#4ade80', borderColor: s.type === 'youtube' ? '#7f1d1d' : '#14532d' }}>
                                {s.type === 'youtube' ? 'YT' : 'MP3'}
                              </span>
                              <span className="text-[7px] text-gray-500 truncate">{s.artist}</span>
                            </div>
                          </div>
                        </button>
                        <button onClick={() => deleteSong(s.id)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-gray-600 hover:text-red-400 transition-all">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 py-2 text-center text-[7px] text-gray-600 font-bold uppercase border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    YT = video only · Upload MP3 for full console control
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          STAGE MONITOR (YouTube / waveform)
      ══════════════════════════════════════ */}
      <div className="shrink-0 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0d0f14' }}>
        <div className="aspect-video" style={{ maxHeight: 180 }}>
          {currentSong.type === 'youtube' ? (
            <div className="relative w-full h-full">
              <iframe key={currentSong.id} src={getYouTubeEmbedUrl(currentSong.url)}
                className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title={currentSong.title} />
              <div className="absolute bottom-0 inset-x-0 text-center py-1 pointer-events-none"
                   style={{ background: 'rgba(0,0,0,0.7)' }}>
                <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: BLUE }}>
                  ▶ Press Play inside the video
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: '#0a0c10' }}>
              <Waves size={28} style={{ color: isPlaying ? BLUE : '#1e2230' }} />
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">
                {isPlaying ? 'Audio Playing' : 'Audio Only Mode'}
              </span>
              {isPlaying && (
                <div className="flex gap-0.5 items-end h-6">
                  {[...Array(16)].map((_, i) => (
                    <motion.div key={i}
                      animate={{ height: [`${10 + Math.random() * 90}%`, `${10 + Math.random() * 90}%`] }}
                      transition={{ duration: 0.2 + Math.random() * 0.3, repeat: Infinity, repeatType: 'reverse' }}
                      className="w-1 rounded-full" style={{ height: '10%', background: BLUE, opacity: 0.6 }} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          MIXER — horizontal scroll
      ══════════════════════════════════════ */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-x-auto overflow-y-hidden"
             style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
          <div className="flex h-full" style={{ minWidth: 'max-content' }}>

            {/* Channel Strips */}
            {channels.map(ch => (
              <div key={ch.id} className="flex flex-col shrink-0" style={{ width: 200 }}>

                {/* Strip body */}
                <div className="flex flex-1"
                     style={{ background: 'linear-gradient(180deg, #1c1f2b 0%, #161820 100%)',
                              borderRight: '1px solid rgba(255,255,255,0.06)' }}>

                  {/* LEFT: Trim / Reverb / Pan / Mute / Solo / Fader */}
                  <div className="flex flex-col items-center gap-2 pt-3 pb-2 px-2"
                       style={{ width: 68, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                    <Knob value={ch.trim} onChange={v => updateCh(ch.id, { trim: v })} size={40} color={BLUE} label="Trim"
                          onHelp={() => setInfo(HELP_INFO.trim)} />
                    <Knob value={ch.reverb} onChange={v => updateCh(ch.id, { reverb: v })} size={40} color={BLUE} label="Reverb"
                          onHelp={() => setInfo(HELP_INFO.reverb)} />
                    <PanSlider value={ch.pan} onChange={v => updateCh(ch.id, { pan: v })} />
                    <button onClick={() => updateCh(ch.id, { muted: !ch.muted })}
                      className="w-full rounded-lg py-1 text-[9px] font-black uppercase tracking-wide transition-all"
                      style={{ background: ch.muted ? '#dc2626' : 'linear-gradient(180deg,#2d3748,#1a202c)',
                               color: ch.muted ? 'white' : '#64748b',
                               border: `1px solid ${ch.muted ? '#f87171' : 'rgba(255,255,255,0.08)'}`,
                               boxShadow: ch.muted ? '0 0 10px rgba(220,38,38,0.35)' : 'none' }}>
                      mute
                    </button>
                    <button onClick={() => updateCh(ch.id, { solo: !ch.solo })}
                      className="w-full rounded-lg py-1 text-[9px] font-black uppercase tracking-wide transition-all"
                      style={{ background: ch.solo ? 'linear-gradient(180deg,#64748b,#475569)' : 'linear-gradient(180deg,#374151,#1f2937)',
                               color: ch.solo ? 'white' : '#64748b',
                               border: `1px solid ${ch.solo ? '#94a3b8' : 'rgba(255,255,255,0.08)'}` }}>
                      solo
                    </button>
                    <VertFader value={ch.fader} onChange={v => updateCh(ch.id, { fader: v })} height={120} color={BLUE} />
                  </div>

                  {/* MIDDLE: EQ */}
                  <div className="flex flex-col items-center gap-2 pt-3 pb-1 px-1.5"
                       style={{ width: 74, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                    <Knob value={ch.eq.high} onChange={v => updateCh(ch.id, { eq: { ...ch.eq, high: v } })} size={44} color={BLUE} label="High" onHelp={() => setInfo(HELP_INFO.eqHigh)} />
                    <Knob value={ch.eq.midFreq} onChange={v => updateCh(ch.id, { eq: { ...ch.eq, midFreq: v } })} size={52} color={BLUE} label="Mid Freq" onHelp={() => setInfo(HELP_INFO.eqMidFreq)} />
                    <Knob value={ch.eq.midGain} onChange={v => updateCh(ch.id, { eq: { ...ch.eq, midGain: v } })} size={44} color={BLUE} label="Mid Gain" onHelp={() => setInfo(HELP_INFO.eqMidGain)} />
                    <Knob value={ch.eq.low} onChange={v => updateCh(ch.id, { eq: { ...ch.eq, low: v } })} size={52} color={BLUE} label="Low" onHelp={() => setInfo(HELP_INFO.eqLow)} />
                    <div className="text-[7px] font-bold uppercase tracking-widest text-gray-600 mt-auto pt-1">EQ</div>
                  </div>

                  {/* RIGHT: Compressor */}
                  <div className="flex flex-col items-center gap-2.5 pt-3 pb-1 px-1.5" style={{ flex: 1 }}>
                    <Knob value={ch.comp.attack} onChange={v => updateCh(ch.id, { comp: { ...ch.comp, attack: v } })} size={40} color={BLUE} label="Attack" onHelp={() => setInfo(HELP_INFO.compAttack)} />
                    <Knob value={ch.comp.release} onChange={v => updateCh(ch.id, { comp: { ...ch.comp, release: v } })} size={40} color={BLUE} label="Release" onHelp={() => setInfo(HELP_INFO.compRelease)} />
                    <Knob value={ch.comp.threshold} onChange={v => updateCh(ch.id, { comp: { ...ch.comp, threshold: v } })} size={44} color={BLUE} label="Threshold" onHelp={() => setInfo(HELP_INFO.compThreshold)} />
                    <div className="text-[6px] font-bold uppercase tracking-widest text-gray-700 mt-auto pt-1">COMPRESSOR</div>
                  </div>
                </div>

                {/* Channel name label — scrap-paper style */}
                <div className="relative shrink-0 flex items-center justify-between px-2 py-1.5"
                     style={{ height: 52, background: 'linear-gradient(135deg, #c9a96e 0%, #b8965a 40%, #a07d45 100%)',
                              borderTop: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                  {/* Paper texture overlay */}
                  <div className="absolute inset-0 opacity-20"
                       style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
                  {/* Fader position indicator (blue strip at bottom like original) */}
                  <div className="absolute bottom-0 left-2 right-8 h-3 rounded-t-sm overflow-hidden"
                       style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <div className="h-full rounded-t-sm transition-all"
                         style={{ width: `${ch.fader}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                                  boxShadow: '0 0 8px rgba(59,130,246,0.5)' }} />
                  </div>
                  <span className="relative text-[10px] font-black text-amber-900 italic tracking-tight leading-tight" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}>
                    {ch.name}
                  </span>
                  {/* Orange help button */}
                  <button onClick={() => setInfo({ title: ch.name, desc: `Channel ${ch.id}. Use the knobs above to shape this channel's sound. Click any ? button for detailed guidance.` })}
                    className="relative w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-110"
                    style={{ background: 'radial-gradient(circle at 35% 35%, #fb923c, #ea580c)',
                             boxShadow: '0 2px 8px rgba(234,88,12,0.5), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
                    <HelpCircle size={14} className="text-white" />
                  </button>
                </div>
              </div>
            ))}

            {/* ── MASTER STRIP ── */}
            <div className="flex flex-col shrink-0" style={{ width: 120 }}>
              <div className="flex-1 flex flex-col items-center gap-3 pt-3 pb-2 px-3"
                   style={{ background: 'linear-gradient(180deg, #1c1f2b 0%, #161820 100%)',
                            borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                {/* Master close (X) button — orange like original */}
                <button className="w-9 h-9 rounded-full flex items-center justify-center self-end transition-all hover:scale-110"
                        style={{ background: 'radial-gradient(circle at 35% 35%, #fb923c, #ea580c)',
                                 boxShadow: '0 2px 10px rgba(234,88,12,0.4), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
                  <X size={16} className="text-white font-black" />
                </button>

                {/* Brain/help icon like original */}
                <button onClick={() => setInfo({ title: 'Master Section', desc: 'Controls the global reverb and overall output level. Reverb Size sets the space; Reverb sets the wet/dry mix. Master fader controls final output gain.' })}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'radial-gradient(circle at 35% 35%, #fb923c, #ea580c)',
                           boxShadow: '0 2px 10px rgba(234,88,12,0.4), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
                  <HelpCircle size={16} className="text-white" />
                </button>

                {/* Reverb Size knob */}
                <Knob value={reverbSize} onChange={setReverbSize} size={44} color={BLUE} label="Reverb Size"
                      onHelp={() => setInfo(HELP_INFO.reverbSize)} />

                {/* Master Reverb knob */}
                <Knob value={masterReverb} onChange={setMasterReverb} size={44} color={BLUE} label="Reverb"
                      onHelp={() => setInfo(HELP_INFO.masterReverb)} />

                {/* Master button — blue like original */}
                <button className="w-full py-1.5 rounded-lg text-[9px] font-black uppercase text-white transition-all"
                        style={{ background: `linear-gradient(180deg, ${BLUE}, #1d4ed8)`,
                                 border: '1px solid rgba(59,130,246,0.4)',
                                 boxShadow: `0 0 12px rgba(59,142,245,0.3)` }}>
                  Master
                </button>

                {/* Master fader + dual VU meter */}
                <div className="flex gap-2 items-end flex-1 w-full justify-center pb-1">
                  <VertFader value={masterFader} onChange={setMasterFader} height={120} color="#ef4444" />
                  {/* VU Meter */}
                  <div className="flex gap-0.5" style={{ height: 120 }}>
                    {[1, 0.92].map((scale, i) => (
                      <div key={i} className="w-2 rounded-sm overflow-hidden" style={{ background: '#0a0c10', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="w-full h-full flex flex-col-reverse">
                          <motion.div animate={{ height: `${masterMeter * scale}%` }} transition={{ duration: 0.08 }}
                            className="w-full rounded-sm"
                            style={{ background: masterMeter > 85 ? '#ef4444' : masterMeter > 65 ? '#eab308' : '#22c55e',
                                     boxShadow: masterMeter > 0 ? `0 0 4px ${masterMeter > 85 ? '#ef4444' : '#22c55e'}` : 'none' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Master label */}
              <div className="shrink-0 flex items-center justify-center py-2 px-2"
                   style={{ height: 52, background: '#0d0f14', borderLeft: '1px solid rgba(255,255,255,0.06)',
                            borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em] [writing-mode:vertical-lr] rotate-180">
                  {currentSong.title}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          HELP MODAL
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {info && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onPointerDown={() => setInfo(null)}>
            <motion.div initial={{ y: 30, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="rounded-2xl p-5 max-w-sm w-full shadow-2xl"
              style={{ background: 'linear-gradient(180deg, #1e2230, #161820)', border: '1px solid rgba(255,255,255,0.12)' }}
              onPointerDown={e => e.stopPropagation()}>
              <div className="flex items-start gap-3">
                <div className="rounded-xl p-2 shrink-0"
                     style={{ background: 'radial-gradient(circle at 35% 35%, #fb923c, #ea580c)',
                              boxShadow: '0 2px 10px rgba(234,88,12,0.4)' }}>
                  <HelpCircle size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[12px] font-black uppercase tracking-wider mb-2" style={{ color: BLUE }}>{info.title}</h3>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{info.desc}</p>
                </div>
                <button onClick={() => setInfo(null)} className="text-gray-600 hover:text-white transition-colors shrink-0">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
