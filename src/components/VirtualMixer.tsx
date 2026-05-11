import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, SlidersHorizontal, Activity, Power, VolumeX, Headphones, CircleDot, ChevronRight, Play, Square, Music, AudioLines, Waves, Youtube } from 'lucide-react';
import ReactPlayer from 'react-player';
import { Logo } from './Logo';

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
  eq: {
    high: number;
    midHigh: number;
    midLow: number;
    low: number;
  };
}

interface Song {
  id: string;
  title: string;
  url: string;
  type: 'file' | 'youtube';
  artist?: string;
}

const SONGS: Song[] = [
  { id: 'y1', title: 'Anugrako Inar', artist: 'Adrian Dewan', url: 'https://www.youtube.com/watch?v=BLJcYljOq-U', type: 'youtube' },
  { id: 'y2', title: 'All I Want for Christmas Is You', artist: 'Mariah Carey', url: 'https://www.youtube.com/watch?v=aAkMkVFwAoo', type: 'youtube' },
  { id: 'y3', title: 'Last Christmas', artist: 'Wham!', url: 'https://www.youtube.com/watch?v=KhqNTjbQ71A', type: 'youtube' },
  { id: 'y4', title: 'Golden', artist: 'KPop Demon Hunters', url: 'https://www.youtube.com/watch?v=yebNIHKAC4A', type: 'youtube' },
  { id: 'y5', title: 'Dynamite', artist: 'BTS', url: 'https://www.youtube.com/watch?v=gdZLi9oWNZg', type: 'youtube' },
  { id: '1', title: 'Soul Piano (Practice)', artist: 'Worship', url: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d1be8e046a.mp3', type: 'file' },
  { id: '2', title: 'Acoustic Guitar', artist: 'Warm', url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f694b.mp3', type: 'file' }
];

const INITIAL_CHANNELS: ChannelData[] = [
  { id: 1, name: 'Lead Voc', color: 'bg-blue-500', gain: 45, pan: 0, fader: 75, muted: false, solo: false, hpf: true, eq: { high: 2, midHigh: 1, midLow: 0, low: -3 } },
  { id: 2, name: 'Back Voc', color: 'bg-blue-400', gain: 40, pan: -15, fader: 65, muted: false, solo: false, hpf: true, eq: { high: 0, midHigh: 0, midLow: 0, low: -3 } },
  { id: 3, name: 'Acoustic', color: 'bg-orange-500', gain: 35, pan: 15, fader: 60, muted: false, solo: false, hpf: true, eq: { high: 3, midHigh: 1, midLow: -2, low: -5 } },
  { id: 4, name: 'Keys L', color: 'bg-green-500', gain: 30, pan: -30, fader: 70, muted: false, solo: false, hpf: false, eq: { high: 0, midHigh: 0, midLow: 0, low: 0 } },
  { id: 5, name: 'Keys R', color: 'bg-green-500', gain: 30, pan: 30, fader: 70, muted: false, solo: false, hpf: false, eq: { high: 0, midHigh: 0, midLow: 0, low: 0 } },
  { id: 6, name: 'Drum Mix', color: 'bg-purple-500', gain: 25, pan: 0, fader: 35, muted: false, solo: false, hpf: false, eq: { high: 3, midHigh: 0, midLow: 2, low: 5 } },
];

export const VirtualMixer = () => {
  const [channels, setChannels] = useState<ChannelData[]>(INITIAL_CHANNELS);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [info, setInfo] = useState<{title: string, desc: string, x: number, y: number} | null>(null);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSong, setCurrentSong] = useState(SONGS[0]);
  const [masterMeter, setMasterMeter] = useState(0);
  const [masterFader, setMasterFader] = useState(80);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [skin, setSkin] = useState<'modern' | 'analog'>('modern');

  // Audio Engine Refs
  const audioCtx = useRef<AudioContext | null>(null);
  const audioTag = useRef<HTMLAudioElement | null>(null);
  const [audioContextState, setAudioContextState] = useState<AudioContextState>('suspended');
  const [ytPlaying, setYtPlaying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (audioCtx.current) {
        setAudioContextState(audioCtx.current.state);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const sourceNode = useRef<MediaElementAudioSourceNode | null>(null);
  const nodes = useRef<{
    hpf: BiquadFilterNode;
    gain: GainNode;
    pan: StereoPannerNode;
    eqL: BiquadFilterNode;
    eqML: BiquadFilterNode;
    eqMH: BiquadFilterNode;
    eqH: BiquadFilterNode;
    analyser: AnalyserNode;
  } | null>(null);

  const selectedChannel = channels.find(c => c.id === selectedId)!;

  const HELP_DATABASE: Record<string, { title: string, desc: string }> = {
    gain: { title: 'Input Gain (Sensitivity)', desc: 'Think of this as the "volume" coming INTO the mixer. In a church setting, set this so the loudest parts of the praise don\'t hit the red. If it\'s too low, you\'ll hear hiss; too high, and it will distort (clip).' },
    hpf: { title: 'High-Pass Filter (80Hz)', desc: 'Church Audio Tip #1: Turn this ON for every vocal and instrument EXCEPT kick drums and bass guitars. It removes foot stomps and rumble from the stage, making your stream sound professional and clear.' },
    eq: { title: 'Equalizer (EQ)', desc: 'Used to fix "room boom" or make voices clearer. Tip: Use High-Pass Filters to cut low-end rumble from vocal mics, and boost high-mids slightly to help words be more intelligible in the back of the sanctuary.' },
    pan: { title: 'Panning (Stereo)', desc: 'Positions sound Left or Right. For church, we usually keep the Worship Leader in the center. Panning instruments slightly (like Keys L/R) creates space so everything sounds clearer without being louder.' },
    fader: { title: 'Volume Fader (Mixer)', desc: 'This is your main tool during the service. Start with Gain set correctly, then use these faders to balance the instruments. The goal is a "transparent" mix where you can hear everyone clearly.' },
    solo: { title: 'Solo (PFL)', desc: 'Pre-Fader Listen. This lets you hear a specific channel through the sound booth headphones without the congregation hearing it. Essential for checking if someone\'s mic is actually on!' },
    mute: { title: 'Mute / Silence', desc: 'Instantly silences the channel. Always mute mics when they aren\'t being used to prevent feedback or hearing private conversations between songs.' }
  };

  useEffect(() => {
    return () => {
      if (audioTag.current) {
        audioTag.current.pause();
        audioTag.current.src = "";
      }
      if (audioCtx.current && audioCtx.current.state !== 'closed') {
        audioCtx.current.close().catch(console.error);
      }
    };
  }, []);

  const initAudio = () => {
    if (audioCtx.current) {
        if (audioCtx.current.state === 'suspended') {
            audioCtx.current.resume();
        }
        return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      
      const audio = new Audio();
      audio.crossOrigin = "anonymous"; 
      audio.preload = "auto";
      audio.loop = true;
      if (currentSong.type === 'file') {
        audio.src = currentSong.url;
      }
      
      // Event Listeners for robust state tracking
      const handleStart = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };
      
      audio.addEventListener('waiting', () => setIsLoading(true));
      audio.addEventListener('canplay', () => setIsLoading(false));
      audio.addEventListener('playing', handleStart);
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('error', (e) => {
        console.error("Audio error:", e);
        setIsLoading(false);
      });

      const source = ctx.createMediaElementSource(audio);
      const hpf = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner();
      const eqL = ctx.createBiquadFilter();
      const eqML = ctx.createBiquadFilter();
      const eqMH = ctx.createBiquadFilter();
      const eqH = ctx.createBiquadFilter();
      const ana = ctx.createAnalyser();

      hpf.type = 'highpass'; hpf.frequency.value = 80;
      eqL.type = 'lowshelf'; eqL.frequency.value = 100;
      eqML.type = 'peaking'; eqML.frequency.value = 400;
      eqMH.type = 'peaking'; eqMH.frequency.value = 2500;
      eqH.type = 'highshelf'; eqH.frequency.value = 8000;
      ana.fftSize = 64;

      source.connect(hpf);
      hpf.connect(eqL);
      eqL.connect(eqML);
      eqML.connect(eqMH);
      eqMH.connect(eqH);
      eqH.connect(pan);
      pan.connect(gain);
      gain.connect(ana);
      ana.connect(ctx.destination);

      audioCtx.current = ctx;
      audioTag.current = audio;
      sourceNode.current = source;
      nodes.current = { hpf, gain, pan, eqL, eqML, eqMH, eqH, analyser: ana };
      
      setAudioContextState(ctx.state);
      updateNodes();

      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (e) {
      console.error("Failed to init audio:", e);
    }
  };

  const updateNodes = () => {
    if (!nodes.current || !audioCtx.current || audioCtx.current.state === 'closed') return;
    const ch = selectedChannel;
    
    try {
      const time = audioCtx.current.currentTime;
      const channelGain = ch.muted ? 0 : Math.pow(10, (ch.fader - 70) / 20);
      const masterGain = Math.pow(10, (masterFader - 80) / 20);
      
      nodes.current.hpf.frequency.setTargetAtTime(ch.hpf ? 80 : 20, time, 0.05);
      nodes.current.gain.gain.setTargetAtTime(channelGain * masterGain, time, 0.05);
      nodes.current.pan.pan.setTargetAtTime(ch.pan / 100, time, 0.05);
      nodes.current.eqL.gain.setTargetAtTime(ch.low, time, 0.05);
      nodes.current.eqML.gain.setTargetAtTime(ch.midLow, time, 0.05);
      nodes.current.eqMH.gain.setTargetAtTime(ch.midHigh, time, 0.05);
      nodes.current.eqH.gain.setTargetAtTime(ch.high, time, 0.05);
    } catch (e) {
      // Ignore update errors
    }
  };

  useEffect(() => {
    updateNodes();
  }, [selectedChannel, isPlaying, masterFader]);

  useEffect(() => {
    let ani: number;
    const loop = () => {
      if (isPlaying) {
        if (currentSong.type === 'file' && nodes.current && nodes.current.analyser) {
          const data = new Uint8Array(nodes.current.analyser.frequencyBinCount);
          nodes.current.analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          setMasterMeter((avg / 255) * 100);
        } else if (currentSong.type === 'youtube') {
          // Virtual meter for YouTube (Simulated peaks)
          const base = 40 + Math.random() * 20;
          const peak = Math.random() > 0.9 ? 15 : 0;
          setMasterMeter(base + peak);
        }
      } else {
        setMasterMeter(0);
      }
      ani = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(ani);
  }, [isPlaying, currentSong]);

  const togglePlay = async () => {
    try {
      if (currentSong.type === 'file') {
        if (!audioCtx.current || !audioTag.current) {
          initAudio();
        }
        
        if (audioTag.current && audioCtx.current) {
          if (isPlaying) {
            audioTag.current.pause();
          } else {
            try {
              if (audioCtx.current.state === 'suspended') {
                await audioCtx.current.resume();
              }
              
              if (!audioTag.current.src || audioTag.current.src === "") {
                 audioTag.current.src = currentSong.url;
              }
              
              const playPromise = audioTag.current.play();
              if (playPromise !== undefined) {
                 playPromise.catch(() => {
                   if (audioTag.current) {
                     audioTag.current.load();
                     audioTag.current.play().catch(() => {});
                   }
                 });
              }
            } catch (err) {}
          }
        }
      } else {
        // YouTube toggle
        if (!isPlaying) {
            // If starting YouTube, make sure audio context is resumed for simulated meters
            if (audioCtx.current?.state === 'suspended') {
                audioCtx.current.resume();
            }
        }
        setYtPlaying(!isPlaying);
        setIsPlaying(!isPlaying);
      }
    } catch (e) {
      console.error("Playback error:", e);
    }
  };

  const selectSong = async (song: Song) => {
    try {
      const wasPlaying = isPlaying;
      setIsPlaying(false);
      setYtPlaying(false);
      setCurrentSong(song);
      setShowPlaylist(false);
      
      if (song.type === 'file') {
        if (!audioCtx.current || !audioTag.current) {
          initAudio();
        }

        if (audioTag.current) {
          audioTag.current.pause();
          audioTag.current.crossOrigin = "anonymous";
          audioTag.current.src = song.url;
          audioTag.current.load();
          
          if (wasPlaying) {
            if (audioCtx.current?.state === 'suspended') {
              await audioCtx.current.resume();
            }
            audioTag.current.play().catch(() => {});
            setIsPlaying(true);
          }
        }
      } else {
        // YouTube track selected
        if (wasPlaying) {
          setYtPlaying(true);
          setIsPlaying(true);
        }
      }
    } catch (e) {
      console.error("Song selection failed:", e);
    }
  };

  const updateChannel = (id: number, updates: Partial<ChannelData>) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (audioCtx.current?.state === 'suspended') {
        audioCtx.current.resume();
      }
      const url = URL.createObjectURL(file);
      const newSong = { id: 'custom-' + Date.now(), title: file.name, url };
      setCurrentSong(newSong);
      
      // Auto-load it
      if (audioTag.current) {
        audioTag.current.src = url;
        audioTag.current.load();
        if (isPlaying) audioTag.current.play().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleGlobalClick = () => {
      if (info) setInfo(null);
    };
    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, [info]);

  const showInfo = (e: React.MouseEvent, title: string, desc: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // Anchor to exactly above the mouse pointer or triggering element
    setInfo({ title, desc, x: rect.left + rect.width / 2, y: rect.top - 10 });
  };

  return (
    <div className={`transition-all duration-500 flex flex-col h-full min-h-[480px] md:min-h-[700px] relative overflow-hidden rounded-[1rem] md:rounded-[2rem] shadow-2xl border-2 md:border-4 ${
      skin === 'modern' 
      ? 'bg-[#1a1c23] border-[#252833] p-1.5 md:p-3' 
      : 'bg-[#d1d5db] border-[#9ca3af] p-2 md:p-4 text-slate-900'
    }`}>
      {/* Top Console Bar */}
      <div className={`flex items-center justify-between mb-1 md:mb-3 pb-1 border-b shrink-0 ${
        skin === 'modern' ? 'border-white/5' : 'border-black/10'
      }`}>
        <div className="flex items-center gap-2 md:gap-4">
          <div className={`${
            skin === 'modern' 
              ? 'bg-slate-900 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
              : 'bg-slate-700 border border-slate-600 shadow-xl'
          } p-2 md:p-2.5 rounded-2xl flex items-center justify-center relative group overflow-hidden`}>
            {skin === 'modern' && (
              <div className="absolute inset-0 bg-blue-600/5 blur-xl group-hover:bg-blue-600/10 transition-colors" />
            )}
            <Logo size={24} />
          </div>
          <div>
            <h2 className={`text-[12px] md:text-xl font-black tracking-tighter uppercase italic leading-none flex items-center gap-2 ${
              skin === 'modern' ? 'text-white' : 'text-slate-800'
            }`}>
              SHEPHERD <span className={skin === 'modern' ? 'text-blue-500' : 'text-slate-500'}>CORE</span>
            </h2>
            <div className="flex items-center gap-1 mt-1">
                <span className={`w-1 h-1 rounded-full animate-pulse ${skin === 'modern' ? 'bg-green-500' : 'bg-red-600'}`}></span>
                <span className={`text-[6px] md:text-[9px] font-bold uppercase tracking-[0.2em] leading-none ${
                  skin === 'modern' ? 'text-slate-500' : 'text-slate-600'
                }`}>
                  {skin === 'modern' ? 'PRECISION DSP ACTIVE' : 'VINTAGE SIGNAL PATH'}
                </span>
            </div>
          </div>
        </div>
        
        <div className={`flex gap-2 md:gap-3 items-center p-1 md:p-1.5 rounded-xl border relative ${
          skin === 'modern' ? 'bg-black/40 border-white/5' : 'bg-white/40 border-black/10'
        }`}>
            {/* Console Settings Tab */}
            <div className={`flex p-1 rounded-lg border shadow-inner ${skin === 'modern' ? 'bg-[#0f1115] border-white/5' : 'bg-slate-400 border-slate-500'}`}>
              <button 
                onClick={() => setSkin('modern')}
                className={`px-3 py-1.5 text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${skin === 'modern' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-slate-400'}`}
              >
                CORE-X
              </button>
              <button 
                onClick={() => setSkin('analog')}
                className={`px-3 py-1.5 text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${skin === 'analog' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-600'}`}
              >
                ANALOG-800
              </button>
            </div>

            {audioContextState === 'suspended' && (
              <button 
                onClick={async () => {
                   if (!audioCtx.current) initAudio();
                   if (audioCtx.current?.state === 'suspended') {
                     await audioCtx.current.resume();
                   }
                }}
                className="animate-pulse px-3 py-1.5 bg-red-600 text-white text-[8px] md:text-[10px] font-black uppercase rounded shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center gap-2 border border-red-400"
              >
                <Power size={12} className="text-white" /> Audio Engine: Offline
              </button>
            )}

            {isLoading && (
              <div className="absolute -bottom-6 left-0 right-0 text-[7px] text-blue-400 font-bold uppercase tracking-widest animate-pulse text-center">
                Waiting for audio source...
              </div>
            )}
            <div className="flex gap-2 items-center px-1 md:px-2 border-x border-white/5 mx-1 md:mx-2">
                <label className={`cursor-pointer group flex items-center justify-center p-1.5 md:p-2 rounded-lg border transition-all ${
                  skin === 'modern' ? 'bg-slate-800 border-slate-700 hover:bg-blue-600 hover:border-blue-400' : 'bg-slate-300 border-slate-400 hover:bg-slate-400'
                }`}>
                  <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                  <Music size={14} className={skin === 'modern' ? 'text-slate-400 group-hover:text-white' : 'text-slate-700'} title="Upload File" />
                </label>
            </div>

            <div className="flex gap-2 items-center px-2 md:px-4 border-r border-white/5">
                <button 
                  onClick={togglePlay} 
                  disabled={isLoading}
                  className={`p-2 rounded-lg text-white transition-all shadow-lg ${isLoading ? 'bg-slate-700 cursor-wait' : (isPlaying ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20')}`}
                >
                    {isLoading ? <Activity size={16} className="animate-spin" /> : (isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />)}
                </button>
                <div className="hidden sm:block">
                    <div className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Transport</div>
                    <div className={`text-[10px] font-black uppercase italic ${isLoading ? 'text-blue-400 animate-pulse' : (isPlaying ? 'text-green-500 animate-pulse' : 'text-slate-600')}`}>
                      {isLoading ? 'Loading' : (isPlaying ? 'Live' : 'Stop')}
                    </div>
                </div>
            </div>
            
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
                        {currentSong.title}
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
                    className="absolute top-full mt-2 right-0 md:left-0 md:right-auto w-72 bg-[#1a1c23] border border-slate-700/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-xl"
                  >
                    <div className="p-4 border-b border-slate-800 bg-black/40 flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Training Tracks</h4>
                      <Activity size={12} className={isPlaying ? 'text-blue-500' : 'text-slate-600'} />
                    </div>
                    <div className="p-1 max-h-80 overflow-y-auto">
                      {SONGS.map(song => (
                        <button
                          key={song.id}
                          onClick={() => selectSong(song)}
                          className={`w-full p-4 text-left flex items-center gap-4 rounded-xl hover:bg-blue-600/20 group transition-all mb-1 ${currentSong.id === song.id ? 'bg-blue-600/10' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${currentSong.id === song.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-600 group-hover:bg-slate-700'}`}>
                             {currentSong.id === song.id && isPlaying ? <Activity size={14} className="animate-pulse" /> : <Music size={14} />}
                          </div>
                            <div className="flex-1">
                              <div className={`text-[10px] md:text-xs font-black uppercase tracking-tight ${currentSong.id === song.id ? 'text-blue-400' : 'text-slate-300 group-hover:text-white'}`}>
                                {song.title}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {song.type === 'youtube' && <Youtube size={8} className="text-red-500" />}
                                <div className="text-[7px] md:text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                                  {song.artist || 'Sample'}
                                </div>
                              </div>
                            </div>
                          {currentSong.id === song.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="p-3 bg-black/40 border-t border-slate-800">
                        <p className="text-[8px] text-slate-500 font-medium text-center uppercase tracking-widest">Select a source to practice your mix</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row landscape:flex-row gap-2 md:gap-6 flex-1 h-full overflow-hidden">
        {/* Main Mixer Surface (Left Scrolls) */}
        <div className="flex-1 overflow-x-auto pb-1 custom-scrollbar lg:max-w-[65%] xl:max-w-[72%] landscape:max-w-[65%] order-2 lg:order-1 landscape:order-1">
          <div className={`flex gap-1 min-w-max p-1 rounded-2xl h-full ${
            skin === 'modern' ? 'bg-black/10' : 'bg-slate-300 shadow-inner'
          }`}>
            {channels.map((ch) => (
              <div 
                key={ch.id} 
                className={`w-[68px] md:w-[82px] flex flex-col items-center gap-1 transition-all p-1 rounded-xl ${
                  selectedId === ch.id 
                  ? (skin === 'modern' ? 'bg-slate-800/60 ring-1 ring-white/5' : 'bg-white/60 shadow-lg ring-1 ring-black/10') 
                  : ''
                }`}
              >
                {/* Scribble Strip */}
                <button 
                  onClick={() => setSelectedId(ch.id)}
                  className={`w-full h-10 md:h-12 rounded-lg ${ch.color} flex flex-col items-center justify-center p-1 border-2 transition-all ${selectedId === ch.id ? 'border-white scale-105 shadow-lg' : 'border-black/50'}`}
                >
                  <span className="text-[8px] font-black text-black/40 uppercase leading-none">{ch.id}</span>
                  <span className="text-[9px] md:text-[11px] font-bold text-white truncate w-full text-center">{ch.name}</span>
                </button>

                {/* Metering */}
                <div className="h-28 md:h-44 w-2.5 md:w-3.5 bg-black rounded flex flex-col-reverse p-0.5 overflow-hidden">
                    <motion.div 
                        animate={{ height: ch.muted ? '0%' : (ch.id === selectedId ? `${masterMeter}%` : `${masterMeter * (0.5 + Math.random() * 0.3)}%`) }}
                        transition={{ duration: 0.1 }}
                        className="w-full bg-green-500 rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                    />
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-1 w-full p-0.5">
                    <button 
                        onClick={(e) => {
                          updateChannel(ch.id, { solo: !ch.solo });
                          if (!ch.solo) showInfo(e, HELP_DATABASE.solo.title, HELP_DATABASE.solo.desc);
                        }}
                        className={`w-full py-1 rounded font-black text-[8px] md:text-[9px] uppercase border transition-all ${
                          ch.solo 
                          ? 'bg-yellow-500 border-yellow-300 text-black shadow-lg shadow-yellow-500/20' 
                          : (skin === 'modern' ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-400 border-slate-500 text-slate-700')
                        }`}
                    >
                        Solo
                    </button>
                    <button 
                        onClick={(e) => {
                          updateChannel(ch.id, { muted: !ch.muted });
                          if (!ch.muted) showInfo(e, HELP_DATABASE.mute.title, HELP_DATABASE.mute.desc);
                        }}
                        className={`w-full py-1 rounded font-black text-[8px] md:text-[9px] uppercase border transition-all ${
                          ch.muted 
                          ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/20' 
                          : (skin === 'modern' ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-400 border-slate-500 text-slate-700')
                        }`}
                    >
                        Mute
                    </button>
                </div>

                {/* Fader Track */}
                <div className={`relative h-40 md:h-60 w-6 md:w-8 rounded-lg border mb-1 flex items-center justify-center p-0.5 ${
                  skin === 'modern' ? 'bg-[#0d0f14] border-slate-800/50' : 'bg-slate-800 border-slate-900 shadow-inner'
                }`}>
                    <div className={`absolute inset-0 flex flex-col justify-between py-4 px-0.5 pointer-events-none ${
                      skin === 'modern' ? 'opacity-10' : 'opacity-30'
                    }`}>
                        {[...Array(11)].map((_, i) => <div key={i} className={`h-[1px] w-full ${skin === 'modern' ? 'bg-slate-500' : 'bg-slate-400'}`} />)}
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={ch.fader}
                      onChange={(e) => updateChannel(ch.id, { fader: parseInt(e.target.value) })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl' } as any}
                    />
                    <motion.div 
                        animate={{ bottom: `${ch.fader}%` }} 
                        className="absolute w-6 md:w-8 h-8 md:h-12 bg-[#e0e0e0] border-y-2 md:border-y-4 border-[#888] rounded-sm shadow-xl z-0 pointer-events-none flex items-center justify-center"
                        style={{ transform: 'translateY(50%)' }}
                    >
                        <div className="w-full h-[1px] md:h-0.5 bg-red-600 shadow-[0_0_8px_rgba(255,0,0,0.5)]" />
                    </motion.div>
                </div>
              </div>
            ))}

            {/* Main Fader Section */}
            <div className="w-[75px] md:w-[95px] border-l border-white/5 pl-2 md:pl-3 ml-1 md:ml-3 flex flex-col items-center gap-1 bg-black/5 rounded-2xl p-1 md:p-2 self-stretch">
                <button 
                  onClick={(e) => {
                    if (audioCtx.current?.state === 'suspended') {
                      audioCtx.current.resume();
                    }
                    showInfo(e, 'Master Output', 'Tip: If you hear no sound, click this button or the Play button again to ensure your browser allows the audio context to start.');
                  }}
                  className="w-full h-9 md:h-11 bg-red-600 rounded-lg flex flex-col items-center justify-center border-2 border-red-400 shadow-lg shadow-red-600/20 mb-1 hover:bg-red-500 transition-colors"
                >
                  <span className="text-[8px] md:text-[9px] font-black text-white uppercase italic leading-none">MAIN</span>
                </button>
                <div className="flex gap-0.5 md:gap-1 h-28 md:h-44 w-5 md:w-7 bg-black rounded p-0.5 md:p-1 mb-1">
                    <div className="flex-1 bg-green-500/10 rounded-sm relative overflow-hidden">
                        <motion.div 
                          animate={{ height: `${masterMeter}%` }}
                          className="absolute bottom-0 w-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                        />
                    </div>
                    <div className="flex-1 bg-green-500/10 rounded-sm relative overflow-hidden">
                        <motion.div 
                          animate={{ height: `${masterMeter * 0.9}%` }}
                          className="absolute bottom-0 w-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                        />
                    </div>
                </div>
                <div className="relative h-40 md:h-60 w-7 md:w-9 bg-[#0a0a0a] rounded-lg border-2 border-slate-700 flex items-center justify-center p-0.5 md:p-1 mt-auto group">
                    <div className="absolute inset-x-0 top-0 bottom-0 z-10 opacity-0 cursor-pointer">
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={masterFader}
                        onChange={(e) => setMasterFader(parseInt(e.target.value))}
                        className="w-full h-full cursor-pointer"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl' } as any}
                      />
                    </div>
                    <motion.div 
                        animate={{ bottom: `${masterFader}%` }}
                        className="absolute w-7 md:w-9 h-10 md:h-14 bg-red-700 border-y-2 md:border-y-4 border-red-500 rounded-sm shadow-2xl flex items-center justify-center pointer-events-none z-0"
                        style={{ transform: 'translateY(50%)' }}
                    >
                        <div className="w-full h-[1px] md:h-0.5 bg-white shadow-[0_0_10px_white]"></div>
                    </motion.div>
                </div>
                <div className="text-[7px] md:text-[9px] font-black text-slate-700 mt-1 uppercase italic leading-none">Master</div>
            </div>
          </div>
        </div>

        {/* Detailed Processing View (Right) */}
        <div className={`lg:w-[35%] xl:w-[30%] landscape:w-[40%] rounded-[1.5rem] border overflow-hidden flex flex-col min-w-full lg:min-w-[300px] landscape:min-w-[300px] order-1 lg:order-2 landscape:order-2 mb-2 lg:mb-0 transition-colors ${
          skin === 'modern' ? 'bg-slate-800/40 border-white/5' : 'bg-slate-200 border-black/10'
        }`}>
          <div className={`p-2 md:p-3 border-b flex items-center justify-between shrink-0 ${
            skin === 'modern' ? 'bg-slate-900 border-white/5' : 'bg-slate-400 border-black/10'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg ${selectedChannel.color} flex items-center justify-center text-white font-black text-xs md:text-sm shadow-inner shrink-0`}>
                {selectedChannel.id}
              </div>
              <div>
                 <h3 className={`text-[10px] md:text-sm font-bold uppercase italic truncate max-w-[100px] md:max-w-[120px] ${
                   skin === 'modern' ? 'text-white' : 'text-slate-900'
                 }`}>{selectedChannel.name}</h3>
                 <p className={`text-[7px] md:text-[10px] font-black tracking-widest leading-none ${
                   skin === 'modern' ? 'text-slate-500' : 'text-slate-700'
                 }`}>SHAPE</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => {
                  const initial = INITIAL_CHANNELS.find(c => c.id === selectedId)!;
                  updateChannel(selectedId, { ...initial });
                }}
                className={`px-1.5 py-0.5 rounded border text-[7px] font-black uppercase transition-all ${
                  skin === 'modern' ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-white/5' : 'bg-slate-300 hover:bg-slate-400 text-slate-600 border-black/10 shadow-sm'
                }`}
              >
                Reset
              </button>
              <button className={`p-1 rounded-full transition-colors ${
                skin === 'modern' ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-400 text-slate-700'
              }`} onClick={(e) => showInfo(e, 'Channel View', 'This section shows detailed processing for the selected channel.')}>
                <HelpCircle size={14} />
              </button>
            </div>
          </div>

          <div className="p-2 md:p-4 space-y-3 md:space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* Input Gain & Pan Section */}
            <div className="grid grid-cols-2 gap-2 md:gap-5">
                {/* Gain Knob */}
                <div className="flex flex-col items-center gap-1 md:gap-2">
                    <div className="flex items-center gap-1">
                        <span className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Gain</span>
                        <button 
                          onClick={(e) => showInfo(e, HELP_DATABASE.gain.title, HELP_DATABASE.gain.desc)}
                          className="w-3.5 h-3.5 md:w-5 md:h-5 flex items-center justify-center bg-slate-700/50 hover:bg-blue-600 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                          <HelpCircle size={8} />
                        </button>
                    </div>
                    <div className="relative w-10 h-10 md:w-16 md:h-16">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="20" cy="20" r="16" className="md:cx-[32] md:cy-[32] md:r-[28]" fill="none" stroke="#2d3748" strokeWidth="3" />
                            <circle cx="20" cy="20" r="16" className="md:cx-[32] md:cy-[32] md:r-[28]" fill="none" stroke="#3182ce" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset={100.5 - (selectedChannel.gain / 100 * 100.5)} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[10px] md:text-sm font-mono font-bold text-white">{selectedChannel.gain}</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={selectedChannel.gain}
                          onChange={(e) => updateChannel(selectedId, { gain: parseInt(e.target.value) })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Pan Slider */}
                <div className="flex flex-col items-center gap-1 md:gap-2">
                    <div className="flex items-center gap-1">
                        <span className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Pan</span>
                        <button 
                          onClick={(e) => showInfo(e, HELP_DATABASE.pan.title, HELP_DATABASE.pan.desc)}
                          className="w-3.5 h-3.5 md:w-5 md:h-5 flex items-center justify-center bg-slate-700/50 hover:bg-blue-600 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                          <HelpCircle size={8} />
                        </button>
                    </div>
                    <div className="w-full flex flex-col gap-0.5">
                        <div className="flex justify-between text-[6px] md:text-[8px] font-bold text-slate-600 px-1">
                            <span>L</span>
                            <span>R</span>
                        </div>
                        <div className="relative h-4 md:h-7 bg-black rounded-lg border border-white/5 flex items-center p-0.5 px-1">
                            <div className="absolute left-1/2 w-0.5 h-2 md:h-3.5 bg-slate-700/50 -translate-x-1/2" />
                            <input 
                              type="range"
                              min="-100"
                              max="100"
                              value={selectedChannel.pan}
                              onChange={(e) => updateChannel(selectedId, { pan: parseInt(e.target.value) })}
                              className="w-full h-1.5 accent-blue-500 relative z-10"
                            />
                        </div>
                        <div className="text-center text-[7px] md:text-[9px] font-mono text-blue-400/80">
                            {selectedChannel.pan === 0 ? 'C' : `${Math.abs(selectedChannel.pan)}${selectedChannel.pan < 0 ? 'L' : 'R'}`}
                        </div>
                    </div>
                </div>
            </div>

            {/* EQ Section */}
            <div className="space-y-2 md:space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1">
                         <span className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">DSP Shape</span>
                         <button 
                            onClick={(e) => showInfo(e, HELP_DATABASE.eq.title, HELP_DATABASE.eq.desc)}
                            className="w-3.5 h-3.5 md:w-5 md:h-5 flex items-center justify-center bg-slate-700/50 hover:bg-blue-600 rounded-full transition-colors text-slate-400 hover:text-white"
                          >
                            <HelpCircle size={8} />
                          </button>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => {
                          updateChannel(selectedId, { hpf: !selectedChannel.hpf });
                          if (!selectedChannel.hpf) showInfo(e, HELP_DATABASE.hpf.title, HELP_DATABASE.hpf.desc);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[6px] md:text-[8px] font-black uppercase transition-all border ${selectedChannel.hpf ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                      >
                        HPF
                      </button>
                      <button className="bg-slate-700/30 p-0.5 rounded-md border border-white/5">
                          <Power size={8} className="text-green-500" />
                      </button>
                    </div>
                </div>

                {/* Visual EQ Curve Mirroring */}
                <div className="h-10 md:h-14 bg-black/40 rounded-lg border border-white/5 overflow-hidden flex items-end relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-full w-[1px] bg-slate-800 absolute left-1/4" />
                        <div className="h-full w-[1px] bg-slate-800 absolute left-2/4" />
                        <div className="h-full w-[1px] bg-slate-800 absolute left-3/4" />
                    </div>
                    <div className="w-full h-full flex items-end px-1.5 z-10">
                        <div className="flex-1 h-full flex items-end gap-1">
                            <div className="w-full bg-blue-500/20 rounded-t-xs transition-all" style={{ height: `${50 + (selectedChannel.hpf ? -30 : selectedChannel.eq.low * 3)}%` }} />
                            <div className="w-full bg-blue-500/20 rounded-t-xs transition-all" style={{ height: `${50 + (selectedChannel.eq.midLow * 3)}%` }} />
                            <div className="w-full bg-blue-500/20 rounded-t-xs transition-all" style={{ height: `${50 + (selectedChannel.eq.midHigh * 3)}%` }} />
                            <div className="w-full bg-blue-500/20 rounded-t-xs transition-all" style={{ height: `${50 + (selectedChannel.eq.high * 3)}%` }} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                    {(['high', 'midHigh', 'midLow', 'low'] as const).map(band => (
                        <div key={band} className="flex flex-col items-center gap-0.5">
                            <span className="text-[6px] md:text-[8px] font-black text-slate-500 uppercase leading-none">{band.replace('mid', 'm')}</span>
                            <div className="relative h-14 md:h-20 w-0.5 bg-slate-800 rounded-full flex items-center justify-center">
                                <input 
                                    type="range"
                                    min="-12"
                                    max="12"
                                    value={selectedChannel.eq[band]}
                                    onChange={(e) => updateChannel(selectedId, { eq: { ...selectedChannel.eq, [band]: parseInt(e.target.value) } })}
                                    className="absolute w-14 md:w-20 h-4 -rotate-90 opacity-0 cursor-pointer z-10"
                                />
                                <motion.div 
                                    animate={{ bottom: `${((selectedChannel.eq[band] + 12) / 24) * 100}%` }}
                                    className="absolute w-3 h-4 md:w-4 md:h-5 bg-slate-700 border border-slate-500 rounded-sm shadow-xl flex flex-col justify-between py-1"
                                    style={{ transform: 'translateY(50%)' }}
                                >
                                    <div className="w-full h-[0.5px] bg-blue-400 opacity-50"></div>
                                </motion.div>
                            </div>
                            <span className="text-[6px] md:text-[8px] font-mono font-bold text-blue-400 leading-none">
                                {selectedChannel.eq[band] > 0 ? '+' : ''}{selectedChannel.eq[band]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dynamics / Gating Indicators */}
            <div className="grid grid-cols-2 gap-2 pt-1 uppercase">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[8px] font-black text-slate-600 tracking-widest">GATE</span>
                        <CircleDot size={8} className="text-slate-800" />
                    </div>
                    <div className="h-1 w-full bg-black rounded-full overflow-hidden">
                        <div className="h-full bg-blue-950 w-full"></div>
                    </div>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[8px] font-black text-slate-600 tracking-widest">COMP</span>
                        <CircleDot size={8} className="text-slate-800" />
                    </div>
                    <div className="h-1 w-full bg-black rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500/20 w-[40%]"></div>
                    </div>
                </div>
            </div>
          </div>
          
          <div className={`p-2 md:p-4 border-t shrink-0 ${
            skin === 'modern' ? 'bg-slate-900/100 border-white/5' : 'bg-slate-400 border-black/10'
          }`}>
             <button 
                onClick={() => setSelectedId(selectedId < 6 ? selectedId + 1 : 1)}
                className={`w-full py-2.5 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                  skin === 'modern' 
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20' 
                  : 'bg-slate-800 text-white hover:bg-slate-900 shadow-black/20'
                }`}
            >
                Next <ChevronRight size={12} />
             </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {info && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed z-[9999] pointer-events-none"
            style={{ 
              left: `${info.x}px`, 
              top: `${info.y}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-[#1e293b] text-white p-3 rounded-lg shadow-2xl border border-white/20 pointer-events-auto w-[220px]">
              <div className="flex items-start gap-2">
                <div className="bg-blue-600 p-1 rounded-md shrink-0">
                  <HelpCircle size={14} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-[10px] uppercase tracking-wider mb-1 text-blue-400">
                    {info.title}
                  </h3>
                  <p className="text-slate-200 text-[10px] leading-snug font-medium">{info.desc}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setInfo(null); }}
                  className="p-0.5 hover:bg-white/10 rounded-md transition-all self-start"
                >
                  <Square size={8} className="text-slate-500" />
                </button>
              </div>
              {/* Tooltip arrow down */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1e293b]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none overflow-hidden">
        {currentSong.type === 'youtube' && (
          <ReactPlayer
            url={currentSong.url}
            playing={ytPlaying}
            volume={masterFader / 100}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onBuffer={() => setIsLoading(true)}
            onBufferEnd={() => setIsLoading(false)}
            onError={(e) => {
              console.error("YouTube Player Error:", e);
              setIsPlaying(false);
              setYtPlaying(false);
            }}
            config={{
              youtube: {
                playerVars: { 
                  autoplay: 1, 
                  modestbranding: 1,
                  controls: 0,
                  showinfo: 0,
                  rel: 0
                }
              }
            }}
          />
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

