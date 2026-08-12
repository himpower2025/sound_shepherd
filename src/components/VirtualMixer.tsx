import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle, Activity, Power, Volume2, CircleDot, Trash2, ChevronDown,
  ChevronRight, Play, Square, Music, Waves, Mic, MicOff, Plus, X
} from 'lucide-react';
import { Logo } from './Logo';

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
  eq: { high: number; midHigh: number; midLow: number; low: number };
}

interface Song {
  id: string;
  title: string;
  url: string;
  artist?: string;
  type: 'file' | 'youtube';
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const DEFAULT_SONGS: Song[] = [
  { id: 'y1', title: 'Anugrako Inar',          artist: 'Adrian Dewan',       url: 'https://www.youtube.com/watch?v=BLJcYljOq-U',  type: 'youtube' },
  { id: 'y2', title: 'All I Want for Christmas', artist: 'Mariah Carey',      url: 'https://www.youtube.com/watch?v=aAkMkVFwAoo',  type: 'youtube' },
  { id: 'y3', title: 'Last Christmas',           artist: 'Wham!',             url: 'https://www.youtube.com/watch?v=KhqNTjbQ71A',  type: 'youtube' },
  { id: 'y4', title: 'Golden',                   artist: 'KPop Demon Hunters', url: 'https://www.youtube.com/watch?v=yebNIHKAC4A', type: 'youtube' },
  { id: 'y5', title: 'Dynamite',                 artist: 'BTS',               url: 'https://www.youtube.com/watch?v=gdZLi9oWNZg',  type: 'youtube' },
];

// 4 channels (as requested)
const INITIAL_CHANNELS: ChannelData[] = [
  { id: 1, name: 'Lead Voc',  color: '#3b82f6', gain: 45, pan: 0,   fader: 75, muted: false, solo: false, hpf: true,  eq: { high: 2,  midHigh: 1,  midLow: 0,  low: -3 } },
  { id: 2, name: 'Back Voc',  color: '#60a5fa', gain: 40, pan: -20, fader: 65, muted: false, solo: false, hpf: true,  eq: { high: 0,  midHigh: 0,  midLow: 0,  low: -3 } },
  { id: 3, name: 'Keys',      color: '#22c55e', gain: 35, pan: 15,  fader: 70, muted: false, solo: false, hpf: false, eq: { high: 1,  midHigh: 0,  midLow: -1, low: 0  } },
  { id: 4, name: 'Drum Mix',  color: '#a855f7', gain: 30, pan: 0,   fader: 60, muted: false, solo: false, hpf: false, eq: { high: 3,  midHigh: 0,  midLow: 2,  low: 5  } },
];

const HELP: Record<string, { title: string; desc: string }> = {
  gain:  { title: 'Input Gain',         desc: 'Sets the input sensitivity. Adjust until the loudest peaks are just below clipping. Too low → noisy; too high → distortion.' },
  hpf:   { title: 'High-Pass Filter',   desc: 'Cuts low-end rumble below 80 Hz. Turn ON for every vocal and instrument except kick & bass — it instantly cleans up a muddy mix.' },
  eq:    { title: 'Equalizer (4-Band)', desc: 'Shape the frequency content of each channel. Boost hi-mids for vocal intelligibility; cut low-mids to remove boxiness.' },
  pan:   { title: 'Stereo Pan',         desc: 'Positions the signal in the stereo field. Keep lead vocal centred. Spread instruments slightly to create width and separation.' },
  fader: { title: 'Volume Fader',       desc: 'Your primary mix tool. Set Gain first, then use faders to achieve balance. Small moves (2–3 dB) have a big impact at FOH.' },
  solo:  { title: 'Solo (PFL)',         desc: 'Pre-Fader Listen — lets you hear a single channel in your headphones without affecting the main output. Great for checking mic signal.' },
  mute:  { title: 'Mute',              desc: 'Silences the channel completely. Always mute open mics when not in use to prevent feedback and unwanted noise.' },
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
  } catch {
    return { title: 'YouTube Track', author: '' };
  }
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export const VirtualMixer = () => {
  const [channels, setChannels]       = useState<ChannelData[]>(INITIAL_CHANNELS);
  const [selectedId, setSelectedId]   = useState<number>(1);
  const [panelOpen, setPanelOpen]     = useState(true);   // channel detail panel collapse
  const [info, setInfo]               = useState<{ title: string; desc: string } | null>(null);

  // Transport
  const [isPlaying, setIsPlaying]     = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [songs, setSongs]             = useState<Song[]>(DEFAULT_SONGS);
  const [currentSong, setCurrentSong] = useState<Song>(DEFAULT_SONGS[0]);
  const [masterMeter, setMasterMeter] = useState(0);
  const [masterFader, setMasterFader] = useState(80);

  // Playlist UI
  const [showPlaylist, setShowPlaylist]     = useState(false);
  const [ytInputUrl, setYtInputUrl]         = useState('');
  const [ytInputLoading, setYtInputLoading] = useState(false);
  const [ytInputError, setYtInputError]     = useState('');
  const [showAddInput, setShowAddInput]     = useState(false);

  // Skin
  const [skin, setSkin] = useState<'dark' | 'light'>('dark');

  // ── Web Audio ──────────────────────────────
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const audioElRef     = useRef<HTMLAudioElement | null>(null);
  const gainNodeRef    = useRef<GainNode | null>(null);
  const analyserRef    = useRef<AnalyserNode | null>(null);
  const hpfRef         = useRef<BiquadFilterNode | null>(null);
  const panRef         = useRef<StereoPannerNode | null>(null);
  const eqRefs         = useRef<{ L: BiquadFilterNode; ML: BiquadFilterNode; MH: BiquadFilterNode; H: BiquadFilterNode } | null>(null);
  const [audioReady, setAudioReady] = useState(false);

  // Mic
  const [micActive, setMicActive]   = useState(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micSrcRef    = useRef<MediaStreamAudioSourceNode | null>(null);

  // Test tone
  const [toneActive, setToneActive] = useState(false);
  const oscRef = useRef<OscillatorNode | null>(null);

  // Scrollable fader strip ref
  const stripRef = useRef<HTMLDivElement>(null);

  const selectedCh = channels.find(c => c.id === selectedId)!;

  // ── Init Web Audio ─────────────────────────
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      return;
    }
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const audio = new Audio();
    audio.preload = 'auto';
    audio.loop = true;
    audio.addEventListener('playing', () => { setIsLoading(false); setIsPlaying(true); });
    audio.addEventListener('pause',   () => setIsPlaying(false));
    audio.addEventListener('waiting', () => setIsLoading(true));
    audio.addEventListener('canplay', () => setIsLoading(false));

    const src = ctx.createMediaElementSource(audio);
    const hpf = ctx.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 80;
    const eqL  = ctx.createBiquadFilter(); eqL.type  = 'lowshelf'; eqL.frequency.value  = 100;
    const eqML = ctx.createBiquadFilter(); eqML.type = 'peaking';  eqML.frequency.value = 400;
    const eqMH = ctx.createBiquadFilter(); eqMH.type = 'peaking';  eqMH.frequency.value = 2500;
    const eqH  = ctx.createBiquadFilter(); eqH.type  = 'highshelf'; eqH.frequency.value = 8000;
    const pan  = ctx.createStereoPanner();
    const gain = ctx.createGain();
    const analyser = ctx.createAnalyser(); analyser.fftSize = 64;
    src.connect(hpf); hpf.connect(eqL); eqL.connect(eqML); eqML.connect(eqMH);
    eqMH.connect(eqH); eqH.connect(pan); pan.connect(gain); gain.connect(analyser);
    analyser.connect(ctx.destination);

    audioCtxRef.current = ctx; audioElRef.current = audio;
    gainNodeRef.current = gain; analyserRef.current = analyser;
    hpfRef.current = hpf; panRef.current = pan;
    eqRefs.current = { L: eqL, ML: eqML, MH: eqMH, H: eqH };
    if (ctx.state === 'suspended') ctx.resume();
    setAudioReady(true);
  }, []);

  // ── Sync nodes ────────────────────────────
  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'closed') return;
    const t = ctx.currentTime;
    const chGain = selectedCh.muted ? 0 : Math.pow(10, (selectedCh.fader - 70) / 20);
    const mGain  = Math.pow(10, (masterFader - 80) / 20);
    gainNodeRef.current?.gain.setTargetAtTime(chGain * mGain, t, 0.05);
    hpfRef.current?.frequency.setTargetAtTime(selectedCh.hpf ? 80 : 20, t, 0.05);
    panRef.current?.pan.setTargetAtTime(selectedCh.pan / 100, t, 0.05);
    if (eqRefs.current) {
      eqRefs.current.L.gain.setTargetAtTime(selectedCh.eq.low,     t, 0.05);
      eqRefs.current.ML.gain.setTargetAtTime(selectedCh.eq.midLow,  t, 0.05);
      eqRefs.current.MH.gain.setTargetAtTime(selectedCh.eq.midHigh, t, 0.05);
      eqRefs.current.H.gain.setTargetAtTime(selectedCh.eq.high,    t, 0.05);
    }
  }, [selectedCh, masterFader]);

  // ── VU Meter ──────────────────────────────
  useEffect(() => {
    let raf: number;
    const tick = () => {
      if (isPlaying) {
        if (currentSong.type === 'file' && analyserRef.current) {
          const d = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(d);
          setMasterMeter((d.reduce((a, b) => a + b, 0) / d.length / 255) * 100);
        } else {
          setMasterMeter(38 + Math.random() * 22 + (Math.random() > 0.88 ? 18 : 0));
        }
      } else {
        setMasterMeter(prev => Math.max(0, prev - 4));
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, currentSong]);

  // ── Cleanup ───────────────────────────────
  useEffect(() => () => {
    audioElRef.current?.pause();
    audioCtxRef.current?.close().catch(() => {});
    micStreamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  // ── Dismiss info on outside click ────────
  useEffect(() => {
    const h = () => setInfo(null);
    window.addEventListener('pointerdown', h);
    return () => window.removeEventListener('pointerdown', h);
  }, []);

  // ─────────────────────────────────────────
  // Transport
  // ─────────────────────────────────────────
  const togglePlay = async () => {
    if (currentSong.type === 'youtube') { setIsPlaying(p => !p); return; }
    initAudio();
    const ctx = audioCtxRef.current; const audio = audioElRef.current;
    if (!ctx || !audio) return;
    if (isPlaying) { audio.pause(); return; }
    if (ctx.state === 'suspended') await ctx.resume();
    if (audio.src !== currentSong.url) { audio.src = currentSong.url; audio.load(); }
    setIsLoading(true);
    audio.play().catch(err => {
      setIsLoading(false);
      console.error('Play error:', err);
    });
  };

  const selectSong = async (song: Song) => {
    const wasPlaying = isPlaying;
    audioElRef.current?.pause();
    setIsPlaying(false); setCurrentSong(song); setShowPlaylist(false);
    if (song.type === 'file') {
      initAudio();
      const audio = audioElRef.current; const ctx = audioCtxRef.current;
      if (!audio) return;
      audio.src = song.url; audio.load();
      if (wasPlaying) {
        if (ctx?.state === 'suspended') await ctx?.resume();
        setIsLoading(true);
        audio.play().catch(() => setIsLoading(false));
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    initAudio();
    const url = URL.createObjectURL(file);
    const newSong: Song = { id: 'file-' + Date.now(), title: file.name.replace(/\.\w+$/, ''), url, type: 'file' };
    setCurrentSong(newSong);
    const audio = audioElRef.current;
    if (audio) {
      audio.src = url; audio.load();
      audioCtxRef.current?.resume();
      audio.play().catch(() => {});
    }
  };

  const addYouTubeSong = async () => {
    const url = ytInputUrl.trim(); if (!url) return;
    const vid = getYouTubeVideoId(url);
    if (!vid) { setYtInputError('Paste a valid YouTube URL (youtube.com or youtu.be)'); return; }
    if (songs.some(s => s.url.includes(vid))) { setYtInputError('Already in playlist.'); return; }
    setYtInputError(''); setYtInputLoading(true);
    const { title, author } = await fetchYouTubeTitle(url);
    setSongs(prev => [...prev, { id: 'yt-' + vid, title, artist: author, url: `https://www.youtube.com/watch?v=${vid}`, type: 'youtube' }]);
    setYtInputUrl(''); setYtInputLoading(false); setShowAddInput(false);
  };

  const deleteSong = (id: string) => {
    setSongs(prev => {
      const next = prev.filter(s => s.id !== id);
      if (currentSong.id === id && next.length > 0) selectSong(next[0]);
      return next;
    });
  };

  const toggleSoundCheck = () => {
    initAudio();
    const ctx = audioCtxRef.current; if (!ctx) return;
    ctx.resume();
    if (toneActive) { oscRef.current?.stop(); setToneActive(false); return; }
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.frequency.value = 1000; g.gain.value = 0.12;
    osc.connect(g); g.connect(ctx.destination); osc.start();
    oscRef.current = osc; setToneActive(true);
    setTimeout(() => { osc.stop(); setToneActive(false); }, 800);
  };

  const toggleMic = async () => {
    if (micActive) {
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      micSrcRef.current?.disconnect();
      micStreamRef.current = null; micSrcRef.current = null; setMicActive(false);
    } else {
      try {
        initAudio();
        await audioCtxRef.current?.resume();
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

  // ─────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────
  const updateCh = (id: number, u: Partial<ChannelData>) =>
    setChannels(prev => prev.map(c => c.id === id ? { ...c, ...u } : c));

  // Theme tokens
  const T = skin === 'dark' ? {
    bg:       'bg-[#12141a]',
    surface:  'bg-[#1c1f28]',
    surface2: 'bg-[#22262f]',
    border:   'border-white/6',
    text:     'text-white',
    textMid:  'text-slate-400',
    textDim:  'text-slate-600',
    strip:    'bg-[#0d0f14]',
    meter:    'bg-green-400',
    accent:   'bg-blue-600',
  } : {
    bg:       'bg-[#e8eaef]',
    surface:  'bg-[#d4d7df]',
    surface2: 'bg-[#c8cbd4]',
    border:   'border-black/10',
    text:     'text-slate-900',
    textMid:  'text-slate-600',
    textDim:  'text-slate-400',
    strip:    'bg-[#b8bbc4]',
    meter:    'bg-green-500',
    accent:   'bg-blue-600',
  };

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
  return (
    <div className={`${T.bg} flex flex-col h-full min-h-screen rounded-2xl overflow-hidden border ${T.border} select-none`}>

      {/* ════════════════════════════════════
          TOP BAR — Row 1: Logo + Skin + Status
      ════════════════════════════════════ */}
      <div className={`${T.surface} border-b ${T.border} px-3 py-2 flex items-center gap-3 shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center">
            <Logo size={20} />
          </div>
          <div className="hidden sm:block">
            <div className={`text-[11px] font-black uppercase tracking-widest ${T.text}`}>
              Sound <span className="text-blue-500">Shepherd</span>
            </div>
            <div className={`text-[7px] font-bold uppercase tracking-[0.2em] ${T.textDim}`}>Training Console</div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Skin toggle */}
        <div className={`flex rounded-lg overflow-hidden border ${T.border} shrink-0`}>
          <button onClick={() => setSkin('dark')}
            className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest transition-all ${skin === 'dark' ? 'bg-blue-600 text-white' : `${T.surface2} ${T.textDim}`}`}>
            Dark
          </button>
          <button onClick={() => setSkin('light')}
            className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest transition-all ${skin === 'light' ? 'bg-slate-700 text-white' : `${T.surface2} ${T.textDim}`}`}>
            Light
          </button>
        </div>

        {/* Audio Engine status */}
        {!audioReady && (
          <button onClick={initAudio}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white rounded-lg text-[8px] font-black uppercase animate-pulse shrink-0">
            <Power size={10} /> Engine Off
          </button>
        )}
        {audioReady && (
          <div className="flex items-center gap-1 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className={`text-[7px] font-bold uppercase ${T.textDim}`}>Live</span>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════
          TOP BAR — Row 2: Transport + Media
      ════════════════════════════════════ */}
      <div className={`${T.surface2} border-b ${T.border} px-3 py-1.5 flex items-center gap-2 shrink-0 overflow-x-auto`}
           style={{ scrollbarWidth: 'none' }}>

        {/* Play / Stop */}
        <button onClick={togglePlay} disabled={isLoading}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[9px] font-black uppercase transition-all ${
            isLoading ? 'bg-slate-700 cursor-wait' :
            isPlaying  ? 'bg-orange-600 hover:bg-orange-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
          {isLoading ? <Activity size={13} className="animate-spin" /> :
           isPlaying  ? <Square size={13} fill="white" />  : <Play size={13} fill="white" />}
          <span className="hidden xs:inline">{isLoading ? 'Loading' : isPlaying ? 'Stop' : 'Play'}</span>
        </button>

        {/* Check (test tone) */}
        <button onClick={toggleSoundCheck}
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${
            toneActive ? 'bg-green-600 border-green-400 text-white' :
            `${T.surface} ${T.border} ${T.textMid} hover:text-white`}`}>
          <Volume2 size={13} />
          <span>Check</span>
        </button>

        {/* Mic */}
        <button onClick={toggleMic}
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${
            micActive ? 'bg-red-600 border-red-400 text-white animate-pulse' :
            `${T.surface} ${T.border} ${T.textMid} hover:text-white`}`}>
          {micActive ? <MicOff size={13} /> : <Mic size={13} />}
          <span className="hidden sm:inline">{micActive ? 'Mic On' : 'Mic'}</span>
        </button>

        {/* Upload */}
        <label className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase border cursor-pointer transition-all ${T.surface} ${T.border} ${T.textMid} hover:text-white`}>
          <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
          <Music size={13} />
          <span className="hidden sm:inline">Upload</span>
        </label>

        <div className={`h-5 w-px ${T.border} shrink-0 mx-1`} />

        {/* Current track + playlist toggle */}
        <div className="relative shrink-0">
          <button onClick={() => setShowPlaylist(p => !p)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left transition-all ${T.surface} ${T.border}`}>
            <Music size={12} className={isPlaying ? 'text-blue-400' : T.textDim} />
            <div>
              <div className={`text-[8px] ${T.textDim} uppercase font-bold tracking-widest leading-none`}>Now Playing</div>
              <div className={`text-[10px] font-black uppercase ${T.text} max-w-[140px] truncate`}>{currentSong.title}</div>
            </div>
            <ChevronDown size={11} className={`${T.textDim} transition-transform ${showPlaylist ? 'rotate-180' : ''}`} />
          </button>

          {/* Playlist dropdown */}
          <AnimatePresence>
            {showPlaylist && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className={`absolute top-full mt-1 left-0 w-80 ${skin === 'dark' ? 'bg-[#1c1f28]' : 'bg-white'} border ${T.border} rounded-xl shadow-2xl z-50 overflow-hidden`}>

                {/* Header */}
                <div className={`flex items-center justify-between px-3 py-2 border-b ${T.border}`}>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${T.textMid}`}>Playlist</span>
                  <button onClick={() => { setShowAddInput(p => !p); setYtInputError(''); }}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${T.accent} text-white text-[8px] font-black uppercase`}>
                    <Plus size={10} /> Add YouTube
                  </button>
                </div>

                {/* Add URL input */}
                <AnimatePresence>
                  {showAddInput && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <div className={`p-2.5 border-b ${T.border} space-y-1.5`}>
                        <div className="flex gap-1.5">
                          <input
                            type="text" value={ytInputUrl} autoFocus
                            onChange={e => { setYtInputUrl(e.target.value); setYtInputError(''); }}
                            onKeyDown={e => e.key === 'Enter' && addYouTubeSong()}
                            placeholder="Paste YouTube URL..."
                            className={`flex-1 rounded-lg px-2.5 py-1.5 text-[10px] border outline-none focus:border-blue-500 min-w-0 ${
                              skin === 'dark' ? 'bg-[#0d0f14] border-slate-700 text-white placeholder-slate-600'
                                              : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'}`} />
                          <button onClick={addYouTubeSong} disabled={ytInputLoading || !ytInputUrl.trim()}
                            className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-[9px] font-black uppercase">
                            {ytInputLoading ? '…' : 'Add'}
                          </button>
                        </div>
                        {ytInputError && <p className="text-[8px] text-red-400 font-bold">{ytInputError}</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Song list */}
                <div className="max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {songs.length === 0 && (
                    <div className={`py-8 text-center text-[10px] font-bold ${T.textDim}`}>
                      No tracks — add a YouTube URL above
                    </div>
                  )}
                  {songs.map(s => (
                    <div key={s.id}
                      className={`flex items-center gap-2 group px-2 py-2 transition-all border-b ${T.border} last:border-0 ${
                        currentSong.id === s.id
                          ? skin === 'dark' ? 'bg-blue-600/10' : 'bg-blue-50'
                          : skin === 'dark' ? 'hover:bg-white/4' : 'hover:bg-slate-50'}`}>
                      <button onClick={() => selectSong(s)} className="flex-1 flex items-center gap-2.5 min-w-0 text-left">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          currentSong.id === s.id ? 'bg-blue-500 text-white' : `${skin === 'dark' ? 'bg-slate-800' : 'bg-slate-200'} ${T.textMid}`}`}>
                          {currentSong.id === s.id && isPlaying
                            ? <Activity size={12} className="animate-pulse" />
                            : <Music size={12} />}
                        </div>
                        <div className="min-w-0">
                          <div className={`text-[10px] font-black uppercase truncate ${currentSong.id === s.id ? 'text-blue-400' : T.text}`}>{s.title}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`text-[7px] font-bold uppercase px-1 rounded border ${
                              s.type === 'youtube' ? 'text-red-400 border-red-800' : 'text-green-400 border-green-800'}`}>
                              {s.type === 'youtube' ? 'YT' : 'MP3'}
                            </span>
                            <span className={`text-[7px] font-bold truncate ${T.textDim}`}>{s.artist}</span>
                          </div>
                        </div>
                      </button>
                      <button onClick={() => deleteSong(s.id)}
                        className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600/20 hover:text-red-400 ${T.textDim}`}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className={`px-3 py-2 border-t ${T.border}`}>
                  <p className={`text-[7px] font-bold uppercase tracking-widest ${T.textDim} text-center`}>
                    YT = video only &nbsp;·&nbsp; Upload MP3 for full console control
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Master meter (compact, top bar) */}
        <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
          <span className={`text-[7px] font-black uppercase ${T.textDim} hidden sm:block shrink-0`}>Master</span>
          <div className="flex gap-0.5 items-end h-5 shrink-0">
            {[0, 1].map(i => (
              <div key={i} className={`w-1.5 h-full rounded-sm ${skin === 'dark' ? 'bg-slate-800' : 'bg-slate-300'} relative overflow-hidden`}>
                <motion.div animate={{ height: `${masterMeter * (i === 0 ? 1 : 0.92)}%` }}
                  transition={{ duration: 0.08 }}
                  className={`absolute bottom-0 w-full ${masterMeter > 85 ? 'bg-red-500' : masterMeter > 65 ? 'bg-yellow-400' : T.meter}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          MAIN BODY
      ════════════════════════════════════ */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* ── STAGE MONITOR (always visible at top on mobile) ── */}
        <div className={`${T.surface} border-b ${T.border} shrink-0`}>
          <div className={`aspect-video max-h-40 sm:max-h-52 md:max-h-64 relative overflow-hidden`}>
            {currentSong.type === 'youtube' ? (
              <>
                <iframe key={currentSong.id}
                  src={getYouTubeEmbedUrl(currentSong.url)}
                  className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen
                  title={currentSong.title} />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1 text-center pointer-events-none">
                  <span className="text-[8px] text-blue-300 font-bold uppercase tracking-widest">
                    ▶ Press Play inside the video
                  </span>
                </div>
              </>
            ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${skin === 'dark' ? 'bg-slate-900' : 'bg-slate-200'}`}>
                <Waves size={28} className={isPlaying ? 'text-blue-500 animate-pulse' : 'text-blue-500/20'} />
                <span className={`text-[8px] font-black uppercase tracking-widest ${T.textDim}`}>
                  {isPlaying ? 'Audio Playing' : 'Audio Only'}
                </span>
                {isPlaying && (
                  <div className="flex gap-0.5 items-end h-5">
                    {[...Array(14)].map((_, i) => (
                      <motion.div key={i}
                        animate={{ height: [`${15 + Math.random() * 85}%`, `${15 + Math.random() * 85}%`] }}
                        transition={{ duration: 0.25 + Math.random() * 0.3, repeat: Infinity, repeatType: 'reverse' }}
                        className="w-1 bg-blue-500/50 rounded-full" style={{ height: '15%' }} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── MIXER STRIP + CHANNEL DETAIL ── */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

          {/* ─── LEFT: Fader Strips (horizontal scroll) ─── */}
          <div className="lg:flex-1 flex flex-col overflow-hidden">

            {/* Scrollable strip area */}
            <div
              ref={stripRef}
              className="flex-1 overflow-x-auto overflow-y-hidden"
              style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin',
                       scrollbarColor: skin === 'dark' ? '#334155 transparent' : '#94a3b8 transparent' }}>
              <div className={`flex h-full gap-0 min-w-max p-2 ${T.bg}`} style={{ minHeight: 260 }}>

                {/* Channel Strips */}
                {channels.map(ch => {
                  const active = ch.id === selectedId;
                  return (
                    <div key={ch.id}
                      className={`flex flex-col items-center w-[72px] sm:w-[84px] h-full rounded-xl transition-all mx-0.5 ${
                        active ? `${skin === 'dark' ? 'bg-slate-800/70' : 'bg-white/60'} ring-1 ring-white/10` : ''}`}>

                      {/* Channel label (tap to select) */}
                      <button onClick={() => setSelectedId(ch.id)}
                        className={`w-full h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center mb-1 border-2 transition-all ${
                          active ? 'border-white/60 scale-105' : 'border-transparent opacity-70 hover:opacity-90'}`}
                        style={{ backgroundColor: ch.color }}>
                        <span className="text-[7px] font-black text-white/50 uppercase">{ch.id}</span>
                        <span className="text-[9px] sm:text-[11px] font-black text-white truncate px-1 w-full text-center leading-tight">
                          {ch.name}
                        </span>
                      </button>

                      {/* VU meter */}
                      <div className={`w-3 sm:w-4 rounded-md overflow-hidden mb-1 ${skin === 'dark' ? 'bg-black' : 'bg-slate-800'}`}
                           style={{ height: 80 }}>
                        <div className="w-full h-full flex flex-col-reverse p-0.5">
                          <motion.div
                            animate={{ height: ch.muted ? '0%' : `${masterMeter * (active ? 1 : 0.5 + Math.random() * 0.3)}%` }}
                            transition={{ duration: 0.09 }}
                            className={`w-full rounded-sm ${ch.muted ? 'bg-transparent' : 'bg-green-400'}`}
                            style={{ boxShadow: ch.muted ? 'none' : '0 0 6px rgba(74,222,128,0.5)' }} />
                        </div>
                      </div>

                      {/* Solo / Mute */}
                      <div className="flex flex-col gap-1 w-full px-1 mb-1">
                        <button onClick={() => updateCh(ch.id, { solo: !ch.solo })}
                          className={`w-full py-0.5 rounded-md text-[8px] font-black uppercase transition-all border ${
                            ch.solo ? 'bg-yellow-500 border-yellow-300 text-black'
                                    : `${skin === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-300 border-slate-400 text-slate-600'}`}`}>
                          Solo
                        </button>
                        <button onClick={() => updateCh(ch.id, { muted: !ch.muted })}
                          className={`w-full py-0.5 rounded-md text-[8px] font-black uppercase transition-all border ${
                            ch.muted ? 'bg-red-600 border-red-400 text-white'
                                     : `${skin === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-300 border-slate-400 text-slate-600'}`}`}>
                          Mute
                        </button>
                      </div>

                      {/* Fader */}
                      <div className={`relative flex-1 w-7 sm:w-8 rounded-lg border mb-1 overflow-visible ${
                        skin === 'dark' ? 'bg-[#0a0c10] border-slate-800/60' : 'bg-slate-700 border-slate-800'}`}
                           style={{ minHeight: 100 }}>
                        {/* tick marks */}
                        <div className="absolute inset-y-3 inset-x-0 flex flex-col justify-between pointer-events-none px-1">
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className={`h-px w-full ${skin === 'dark' ? 'bg-slate-700/40' : 'bg-slate-500/40'}`} />
                          ))}
                        </div>
                        {/* invisible range input */}
                        <input type="range" min="0" max="100" value={ch.fader}
                          onChange={e => updateCh(ch.id, { fader: +e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          style={{ writingMode: 'vertical-lr', direction: 'rtl' } as any} />
                        {/* fader cap */}
                        <motion.div
                          animate={{ bottom: `${ch.fader}%` }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          className="absolute left-0 right-0 h-8 sm:h-10 rounded-md pointer-events-none z-0 flex flex-col items-center justify-center"
                          style={{ transform: 'translateY(50%)', background: active ? '#e2e8f0' : '#94a3b8',
                                   boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
                          <div className="w-4 h-0.5 rounded-full bg-red-500" style={{ boxShadow: '0 0 6px rgba(239,68,68,0.8)' }} />
                        </motion.div>
                      </div>

                      {/* Fader value */}
                      <span className={`text-[7px] font-mono font-bold ${T.textDim}`}>{ch.fader}</span>
                    </div>
                  );
                })}

                {/* ─ Master Strip ─ */}
                <div className={`flex flex-col items-center w-[72px] sm:w-[84px] h-full ml-1 pl-2 border-l ${T.border}`}>
                  <div className="w-full h-10 sm:h-12 rounded-xl bg-red-700 flex items-center justify-center mb-1 border-2 border-red-500">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Main</span>
                  </div>

                  {/* Dual master meter */}
                  <div className="flex gap-0.5 mb-1" style={{ height: 80 }}>
                    {[1, 0.92].map((scale, i) => (
                      <div key={i} className={`w-2.5 sm:w-3 rounded-md overflow-hidden ${skin === 'dark' ? 'bg-black' : 'bg-slate-800'}`}>
                        <div className="w-full h-full flex flex-col-reverse p-0.5">
                          <motion.div animate={{ height: `${masterMeter * scale}%` }}
                            transition={{ duration: 0.08 }}
                            className={`w-full rounded-sm ${masterMeter > 85 ? 'bg-red-500' : masterMeter > 65 ? 'bg-yellow-400' : 'bg-green-400'}`} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 relative w-7 sm:w-8 rounded-lg border overflow-visible bg-[#0a0c10] border-red-900/40"
                       style={{ minHeight: 100 }}>
                    <div className="absolute inset-y-3 inset-x-0 flex flex-col justify-between pointer-events-none px-1">
                      {[...Array(9)].map((_, i) => <div key={i} className="h-px w-full bg-red-900/30" />)}
                    </div>
                    <input type="range" min="0" max="100" value={masterFader}
                      onChange={e => setMasterFader(+e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl' } as any} />
                    <motion.div
                      animate={{ bottom: `${masterFader}%` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="absolute left-0 right-0 h-8 sm:h-10 rounded-md pointer-events-none z-0 flex items-center justify-center"
                      style={{ transform: 'translateY(50%)', background: '#dc2626',
                               boxShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 12px rgba(220,38,38,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                      <div className="w-4 h-0.5 rounded-full bg-white" style={{ boxShadow: '0 0 8px white' }} />
                    </motion.div>
                  </div>
                  <span className={`text-[7px] font-mono font-bold ${T.textDim}`}>{masterFader}</span>
                </div>

              </div>
            </div>
          </div>

          {/* ─── RIGHT: Channel Detail Panel (collapsible) ─── */}
          <div className={`lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l ${T.border} flex flex-col shrink-0 transition-all`}>

            {/* Panel header (tap to collapse on mobile) */}
            <button
              onClick={() => setPanelOpen(p => !p)}
              className={`flex items-center justify-between px-3 py-2 border-b ${T.border} ${T.surface} w-full`}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-black"
                     style={{ backgroundColor: selectedCh.color }}>
                  {selectedCh.id}
                </div>
                <span className={`text-[10px] font-black uppercase ${T.text}`}>{selectedCh.name}</span>
                <span className={`text-[7px] font-bold uppercase ${T.textDim}`}>— Channel Detail</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={e => { e.stopPropagation(); updateCh(selectedId, { ...INITIAL_CHANNELS.find(c => c.id === selectedId)! }); }}
                  className={`px-2 py-0.5 rounded border text-[7px] font-black uppercase ${T.surface2} ${T.border} ${T.textMid} hover:text-white`}>
                  Reset
                </button>
                <ChevronDown size={14} className={`${T.textMid} transition-transform ${panelOpen ? '' : '-rotate-90'}`} />
              </div>
            </button>

            {/* Panel content */}
            <AnimatePresence initial={false}>
              {panelOpen && (
                <motion.div
                  key="panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden flex-1">
                  <div className="p-3 space-y-4 overflow-y-auto h-full" style={{ scrollbarWidth: 'thin' }}>

                    {/* ── Gain ── */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${T.textMid}`}>Gain</span>
                        <button onClick={() => setInfo(HELP.gain)}
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${T.surface2} ${T.textDim} hover:text-blue-400`}>
                          <HelpCircle size={9} />
                        </button>
                        <span className={`ml-auto text-[9px] font-mono font-bold text-blue-400`}>{selectedCh.gain}</span>
                      </div>
                      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: skin === 'dark' ? '#1e2330' : '#cbd5e1' }}>
                        <div className="absolute left-0 top-0 h-full rounded-full bg-blue-500 transition-all"
                             style={{ width: `${selectedCh.gain}%` }} />
                        <input type="range" min="0" max="100" value={selectedCh.gain}
                          onChange={e => updateCh(selectedId, { gain: +e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                    </div>

                    {/* ── HPF + Pan ── */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* HPF toggle */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                          <span className={`text-[8px] font-black uppercase tracking-widest ${T.textMid}`}>HPF</span>
                          <button onClick={() => setInfo(HELP.hpf)}
                            className={`w-4 h-4 rounded-full flex items-center justify-center ${T.surface2} ${T.textDim} hover:text-blue-400`}>
                            <HelpCircle size={9} />
                          </button>
                        </div>
                        <button onClick={() => updateCh(selectedId, { hpf: !selectedCh.hpf })}
                          className={`w-full py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${
                            selectedCh.hpf ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20'
                                           : `${T.surface2} ${T.border} ${T.textDim}`}`}>
                          {selectedCh.hpf ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      {/* Pan */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                          <span className={`text-[8px] font-black uppercase tracking-widest ${T.textMid}`}>Pan</span>
                          <button onClick={() => setInfo(HELP.pan)}
                            className={`w-4 h-4 rounded-full flex items-center justify-center ${T.surface2} ${T.textDim} hover:text-blue-400`}>
                            <HelpCircle size={9} />
                          </button>
                          <span className={`ml-auto text-[9px] font-mono font-bold text-blue-400`}>
                            {selectedCh.pan === 0 ? 'C' : `${Math.abs(selectedCh.pan)}${selectedCh.pan < 0 ? 'L' : 'R'}`}
                          </span>
                        </div>
                        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: skin === 'dark' ? '#1e2330' : '#cbd5e1' }}>
                          <div className="absolute top-0 h-full rounded-full bg-blue-500 transition-all"
                               style={{
                                 left: selectedCh.pan < 0 ? `${50 + selectedCh.pan / 2}%` : '50%',
                                 width: `${Math.abs(selectedCh.pan) / 2}%`,
                               }} />
                          <div className="absolute left-1/2 top-0 h-full w-px bg-white/20" />
                          <input type="range" min="-100" max="100" value={selectedCh.pan}
                            onChange={e => updateCh(selectedId, { pan: +e.target.value })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    {/* ── EQ ── */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${T.textMid}`}>Equalizer</span>
                        <button onClick={() => setInfo(HELP.eq)}
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${T.surface2} ${T.textDim} hover:text-blue-400`}>
                          <HelpCircle size={9} />
                        </button>
                      </div>

                      {/* EQ mini curve */}
                      <div className={`h-8 rounded-lg overflow-hidden border ${T.border}`}
                           style={{ background: skin === 'dark' ? '#0a0c10' : '#1e293b' }}>
                        <svg width="100%" height="100%" viewBox="0 0 200 32" preserveAspectRatio="none">
                          <polyline
                            fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.7"
                            points={`0,${16 - selectedCh.eq.low * 1.2} 50,${16 - selectedCh.eq.midLow * 1.2} 100,16 150,${16 - selectedCh.eq.midHigh * 1.2} 200,${16 - selectedCh.eq.high * 1.2}`} />
                          <line x1="0" y1="16" x2="200" y2="16" stroke="#334155" strokeWidth="0.5" />
                        </svg>
                      </div>

                      {/* 4 band sliders */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['high', 'midHigh', 'midLow', 'low'] as const).map(band => (
                          <div key={band} className="flex flex-col items-center gap-1">
                            <span className={`text-[7px] font-black uppercase ${T.textDim}`}>
                              {band === 'high' ? 'Hi' : band === 'midHigh' ? 'mHi' : band === 'midLow' ? 'mLo' : 'Lo'}
                            </span>
                            <div className="relative flex items-center justify-center" style={{ height: 72, width: 10 }}>
                              <div className={`absolute w-0.5 h-full rounded-full ${skin === 'dark' ? 'bg-slate-800' : 'bg-slate-400'}`} />
                              <input type="range" min="-12" max="12" value={selectedCh.eq[band]}
                                onChange={e => updateCh(selectedId, { eq: { ...selectedCh.eq, [band]: +e.target.value } })}
                                className="absolute opacity-0 cursor-pointer z-10"
                                style={{ width: 72, height: 10, writingMode: 'vertical-lr', direction: 'rtl' } as any} />
                              <motion.div
                                animate={{ top: `${((12 - selectedCh.eq[band]) / 24) * 100}%` }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="absolute w-4 h-3 rounded pointer-events-none"
                                style={{ transform: 'translateY(-50%)',
                                         background: selectedCh.eq[band] !== 0 ? '#3b82f6' : skin === 'dark' ? '#475569' : '#94a3b8',
                                         boxShadow: selectedCh.eq[band] !== 0 ? '0 0 6px rgba(59,130,246,0.5)' : 'none' }} />
                            </div>
                            <span className={`text-[7px] font-mono font-bold ${selectedCh.eq[band] !== 0 ? 'text-blue-400' : T.textDim}`}>
                              {selectedCh.eq[band] > 0 ? '+' : ''}{selectedCh.eq[band]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── Gate / Comp (placeholder) ── */}
                    <div className="grid grid-cols-2 gap-2">
                      {(['GATE', 'COMP'] as const).map(label => (
                        <div key={label} className={`rounded-xl p-2.5 border ${T.surface2} ${T.border}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[8px] font-black ${T.textDim}`}>{label}</span>
                            <CircleDot size={8} className={T.textDim} />
                          </div>
                          <div className={`h-1 rounded-full ${skin === 'dark' ? 'bg-slate-900' : 'bg-slate-400'}`}>
                            <div className={`h-full rounded-full w-[${label === 'COMP' ? '40' : '0'}%] ${label === 'COMP' ? 'bg-orange-500/40' : ''}`} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Next channel button */}
                    <button onClick={() => setSelectedId(selectedId < 4 ? selectedId + 1 : 1)}
                      className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-blue-600 hover:bg-blue-500 text-white`}>
                      Next Channel <ChevronRight size={12} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* ── Info Tooltip Modal ── */}
      <AnimatePresence>
        {info && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onPointerDown={() => setInfo(null)}>
            <motion.div
              initial={{ y: 40, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-[#1e293b] border border-white/20 rounded-2xl p-4 max-w-xs w-full shadow-2xl"
              onPointerDown={e => e.stopPropagation()}>
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 rounded-lg p-2 shrink-0"><HelpCircle size={16} className="text-white" /></div>
                <div className="flex-1">
                  <h3 className="text-[11px] font-black uppercase text-blue-400 tracking-wider mb-1.5">{info.title}</h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{info.desc}</p>
                </div>
                <button onClick={() => setInfo(null)} className="text-slate-500 hover:text-white transition-colors shrink-0">
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
