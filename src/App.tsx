/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  Mic2, 
  Wrench, 
  CheckSquare,
  BookText, 
  MessageSquareText, 
  ChevronLeft,
  Search,
  Info,
  Mic,
  MonitorPlay,
  Zap,
  Activity,
  AudioLines,
  LogIn,
  LogOut,
  Bell,
  BellOff
} from 'lucide-react';
import { 
  signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './lib/firebase';
import { AppState } from './types';
import { GUIDE_SECTIONS, GLOSSARY } from './constants';
import { askSoundAssistant } from './services/geminiService';
import { VirtualMixer } from './components/VirtualMixer';
import { AudioRecorder } from './components/AudioRecorder';
import { FrequencyReference } from './components/FrequencyReference';
import { Logo } from './components/Logo';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function App() {
  const [activeState, setActiveState] = useState<AppState>('home');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const selectedSection = GUIDE_SECTIONS.find(s => s.id === selectedSectionId);

  const dashboardItems = [
    {
      id: 'mixer',
      title: 'Practice Mixer',
      icon: Sliders,
      colorClass: 'from-[#e06d3b] to-[#b34c1b] shadow-orange-750/20',
      action: () => setActiveState('mixer')
    },
    {
      id: 'frequency',
      title: 'Frequency IQ',
      icon: Activity,
      colorClass: 'from-[#4b79b7] to-[#1e3c72] shadow-blue-900/20',
      action: () => setActiveState('frequency')
    },
    {
      id: 'recorder',
      title: 'Virtual Soundcheck',
      icon: Mic,
      colorClass: 'from-[#3b9c7f] to-[#125c45] shadow-emerald-900/20',
      action: () => setActiveState('recorder')
    },
    {
      id: 'mixing',
      title: 'Mixing Basics',
      icon: AudioLines,
      colorClass: 'from-[#c55d8c] to-[#802451] shadow-pink-950/20',
      action: () => { setSelectedSectionId('mixing'); setActiveState('guide'); }
    },
    {
      id: 'mics',
      title: 'Mic Placement',
      icon: Mic2,
      colorClass: 'from-[#785fb3] to-[#432371] shadow-purple-950/20',
      action: () => { setSelectedSectionId('mics'); setActiveState('guide'); }
    },
    {
      id: 'troubleshooting',
      title: 'Feedback Help!',
      icon: Wrench,
      colorClass: 'from-[#499ca8] to-[#1b5d69] shadow-cyan-950/20',
      action: () => { setSelectedSectionId('troubleshooting'); setActiveState('guide'); }
    },
    {
      id: 'hardware',
      title: 'Cable Repair',
      icon: Zap,
      colorClass: 'from-[#cf8d3c] to-[#854d0e] shadow-amber-950/20',
      action: () => { setSelectedSectionId('hardware'); setActiveState('guide'); }
    },
    {
      id: 'checklist',
      title: 'Sanity Kit',
      icon: CheckSquare,
      colorClass: 'from-[#3ea699] to-[#115e55] shadow-teal-950/20',
      action: () => { setSelectedSectionId('checklist'); setActiveState('guide'); }
    }
  ];

  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const response = await askSoundAssistant(userMsg);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const filteredGlossary = GLOSSARY.filter(item => 
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auth logic
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setDoc(doc(db, 'users', u.uid), {
          displayName: u.displayName,
          photoURL: u.photoURL,
          lastLogin: new Date().toISOString()
        }, { merge: true });
      }
    });
    return () => unsub();
  }, []);

  const login = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (e) { console.error("Login failed:", e); }
  };

  const logout = () => signOut(auth);

  // PWA Service Worker & Push Notification Setup
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );

  // Clear badge count on app mount
  useEffect(() => {
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch(err => console.error("Error clearing badge on load:", err));
    }
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('Service Worker registered successfully:', reg.scope))
        .catch((err) => console.error('Service Worker registration failed:', err));
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported in this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          
          // Clear badge immediately upon active consent
          if ('clearAppBadge' in navigator) {
            navigator.clearAppBadge().catch(err => console.error(err));
          }

          // Register push manager subscription
          let sub: PushSubscription | null = null;
          
          // VAPID Public Key - Configured for Sound Shepherd PWA
          const VAPID_PUBLIC_KEY = "BPK_UaJ32VndRn8srT9DoCpe_6MALEj3E15VM4_2rd1ddfUkPKnJKrT2fiADIZARhJ07PyHTeB-kFCdoKY_QYjQ";
          
          try {
            sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
            console.log("Push Subscription successfully generated:", sub.toJSON());
          } catch (subErr) {
            console.warn("Push subscription failed (VAPID key might be placeholder):", subErr);
          }

          // Save subscription and push-ready status to Firestore
          if (user) {
            await setDoc(doc(db, 'users', user.uid), {
              pushSubscription: sub ? sub.toJSON() : null,
              notificationsEnabled: true,
              updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log("Push subscription saved to Firestore for user:", user.uid);
          }

          reg.showNotification("Sound Shepherd", {
            body: "Notifications active! Sound Shepherd is now registered in your iOS Settings.",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: "pwa-registration"
          });
        } else {
          new Notification("Sound Shepherd", {
            body: "Notifications active! Sound Shepherd is now registered in your iOS Settings.",
            icon: "/icon-192.png"
          });
        }
      } else if (permission === 'denied') {
        alert('Notification permission was blocked. Please reset your browser site settings to enable it.');
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-900 font-sans overflow-x-hidden flex flex-col">
      <header className="bg-gradient-to-r from-[#0c1e3d] via-[#102a54] to-[#0c1e3d] text-white p-3 sm:p-4 sticky top-0 z-30 shadow-[0_4px_20px_rgba(30,58,138,0.25)] border-b border-blue-500/20">
        <div className={`${activeState === 'mixer' || activeState === 'frequency' ? 'max-w-7xl' : 'max-w-5xl'} mx-auto flex items-center justify-between transition-all duration-300`}>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {activeState !== 'home' && (
              <button 
                onClick={() => {
                  setActiveState('home');
                  setSelectedSectionId(null);
                }}
                className="p-1 hover:bg-slate-800 rounded-full transition-colors"
                id="back-button"
              >
                <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
              </button>
            )}
            <h1 className="text-lg sm:text-xl font-black tracking-tighter italic flex items-center gap-1.5 sm:gap-2">
              <Logo size={24} className="sm:w-[28px] sm:h-[28px]" />
              <span className="hidden min-[420px]:inline">SOUND SHEPHERD</span>
            </h1>
            <span className="text-[8px] font-bold text-blue-500/60 uppercase tracking-widest hidden md:block">by HIMPOWER</span>
          </div>
          <div className="flex gap-1.5 sm:gap-2 items-center shrink-0">
            {/* Global Connect Button */}
            <div className="flex items-center gap-2 px-2 sm:px-3 border-r border-slate-800">
              {user ? (
                <div className="flex items-center gap-2 group relative">
                  <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-blue-500/50" />
                  <div className="hidden lg:block">
                    <div className="text-[7px] text-slate-500 font-black uppercase">Online</div>
                    <div className="text-[9px] text-white font-bold truncate max-w-[60px]">{user.displayName}</div>
                  </div>
                  <button 
                    onClick={logout}
                    className="absolute -top-1 -right-1 bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Logout"
                  >
                    <LogOut size={10} className="text-white" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={login}
                  className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all"
                >
                  <LogIn size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Connect</span>
                </button>
              )}
            </div>

            <button 
              onClick={() => setActiveState('recorder')}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 ${activeState === 'recorder' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105' : 'hover:bg-slate-800 text-slate-400'}`}
              title="Sound Check"
            >
              <Mic size={20} />
              <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">Check</span>
            </button>
            <button 
              onClick={() => setActiveState('assistant')}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 ${activeState === 'assistant' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105' : 'hover:bg-slate-800 text-slate-400'}`}
              id="nav-assistant"
              title="AI Assistant"
            >
              <MessageSquareText size={20} />
              <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">Ask AI</span>
            </button>
            <button 
              onClick={requestNotificationPermission}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 ${notificationPermission === 'granted' ? 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20' : 'hover:bg-slate-800 text-slate-400'}`}
              title={notificationPermission === 'granted' ? "Notifications Active" : "Enable Notifications"}
            >
              {notificationPermission === 'granted' ? (
                <Bell size={20} className="text-emerald-400 animate-pulse" />
              ) : (
                <BellOff size={20} />
              )}
              <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">
                {notificationPermission === 'granted' ? 'Active' : 'Alerts'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className={`${activeState === 'mixer' || activeState === 'frequency' ? 'max-w-[1440px]' : 'max-w-5xl'} mx-auto p-3 md:p-6 lg:p-8 pb-32 transition-all duration-300`}>
        <AnimatePresence mode="wait">
          {activeState === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-8 sm:space-y-10"
              id="home-content"
            >
              {/* ── Modern Premium Top Banner ── */}
              <section className="bg-gradient-to-br from-[#0c1329] via-[#0d1630] to-[#050b1a] p-6 sm:p-10 md:p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-slate-800/80">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3.5 py-1.5 rounded-full mb-4 sm:mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Professional Audio Suite</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 tracking-tighter leading-[1.05] italic">
                      MASTER THE <br />
                      <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">LIVE STAGE</span> SOUND.
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-md mb-6 leading-relaxed font-semibold">
                      A professional audio engineering companion and interactive training suite tailored for live sound excellence.
                    </p>
                    <div className="flex gap-2.5">
                        <span className="text-[10px] sm:text-xs font-mono font-black text-amber-500/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">
                          🎚️ 8 CORE SESSIONS INTEGRATED
                        </span>
                    </div>
                </div>
                <div className="absolute right-[-5%] bottom-[-5%] opacity-5 pointer-events-none rotate-12">
                    <Sliders size={280} />
                </div>
              </section>

              {/* ── 8 Core Launcher Cockpit Grid ── */}
              <div className="space-y-5">
                <div className="flex items-center justify-between px-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-orange-500 rounded-full animate-pulse" />
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#1e293b] font-mono">Core Dashboard Modules</h3>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">8 Core Sessional Launchers</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6" id="home-grid">
                  {dashboardItems.map((item, idx) => {
                    const IconComp = item.icon;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={item.action}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-[#edf1f5] hover:bg-[#f5f8fa] p-5 sm:p-7 rounded-[2rem] shadow-[0_5px_15px_rgba(15,23,42,0.03)] border border-slate-250 text-center flex flex-col items-center justify-center gap-4 group transition-all cursor-pointer relative overflow-hidden min-h-[140px] sm:min-h-[170px]"
                        id={`dashboard-${item.id}`}
                      >
                        {/* Hover Ambient Circle Backlight */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Tactile Circle Knob Button (업그레이드된 현대적 서클) */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center p-1.5 border border-slate-250 shadow-sm group-hover:border-slate-300 group-hover:shadow-md transition-all shrink-0">
                          <div className={`w-full h-full rounded-full bg-gradient-to-tr ${item.colorClass} flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform duration-300`}>
                            <IconComp size={24} className="sm:w-7 sm:h-7" />
                          </div>
                        </div>

                        {/* Title (Only Header label underneath) */}
                        <div className="flex flex-col justify-center">
                          <h4 className="font-sans font-black text-slate-800 text-xs sm:text-sm md:text-sm group-hover:text-amber-600 transition-colors tracking-wide uppercase leading-tight min-h-[2.5rem] flex items-center justify-center">
                            {item.title}
                          </h4>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* ── Auxiliary Advanced Wordbook link ── */}
              <div className="border-t border-slate-200/60 pt-6">
                <button
                  onClick={() => setActiveState('glossary')}
                  className="w-full bg-gradient-to-r from-slate-900 to-[#101b33] p-5 sm:p-6 rounded-[2rem] border border-slate-800 flex flex-col sm:flex-row items-center justify-between text-left hover:border-blue-500/30 transition-all group gap-4 shadow-xl text-white"
                  id="section-glossary"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600/10 border border-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                      <BookText size={20} />
                    </div>
                    <div>
                      <h4 className="text-white text-sm sm:text-base font-black uppercase tracking-tight italic">AUDIO LEXICON GLOSSARY</h4>
                      <p className="text-slate-400 text-xs font-semibold leading-relaxed mt-0.5">The ultimate technical audio terms and definitions dictionary for worship team engineers.</p>
                    </div>
                  </div>
                  <span className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all self-stretch sm:self-auto text-center shrink-0">
                    Open Lexicon
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {activeState === 'mixer' && (
              <motion.div key="mixer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">Simulation Engine</div>
                  <VirtualMixer />
              </motion.div>
          )}

          {activeState === 'recorder' && (
              <motion.div key="recorder" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
                  <AudioRecorder />
              </motion.div>
          )}

          {activeState === 'frequency' && (
              <motion.div key="frequency" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
                  <FrequencyReference />
              </motion.div>
          )}

          {activeState === 'guide' && selectedSection && (
            <motion.div
              key="guide-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 rounded-[3rem] text-white shadow-xl">
                 <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                    {selectedSection.icon === 'Sliders' && <Sliders size={24} />}
                    {selectedSection.icon === 'Mic2' && <Mic2 size={24} />}
                    {selectedSection.icon === 'Wrench' && <Wrench size={24} />}
                    {selectedSection.icon === 'Zap' && <Zap size={24} />}
                    {selectedSection.icon === 'CheckSquare' && <CheckSquare size={24} />}
                 </div>
                 <h2 className="text-4xl font-black mb-3 italic tracking-tighter uppercase">{selectedSection.title}</h2>
                 <p className="text-blue-100 font-medium leading-relaxed max-w-xl">{selectedSection.description}</p>
              </div>

              <div className="grid gap-6">
                {selectedSection.content.map((block, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className={`bg-white p-8 rounded-[2.5rem] shadow-sm border ${block.type === 'warning' ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {block.type === 'warning' ? (
                         <div className="bg-amber-500 p-1.5 rounded-lg text-white">
                            <Info size={18} />
                         </div>
                      ) : (
                         <div className="bg-blue-600 w-2 h-6 rounded-full" />
                      )}
                      <h3 className="text-xl font-black uppercase italic tracking-tighter">{block.title}</h3>
                    </div>
                    
                    <p className="text-slate-600 leading-relaxed mb-6 font-medium">{block.text}</p>
                    
                    {block.tips && block.tips.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {block.tips.map((tip, tIdx) => (
                          <div key={tIdx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3 items-start group hover:bg-white transition-colors">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                            <span className="text-xs text-slate-500 leading-normal font-bold">{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeState === 'glossary' && (
            <motion.div
              key="glossary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search technical terms or tips..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                    id="glossary-search"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {['All', 'Term', 'Tip', 'Hardware'].map(cat => (
                    <button 
                      key={cat}
                      className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white transition-all border border-slate-200"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {filteredGlossary.map((item, idx) => (
                  <motion.div 
                    layout
                    key={idx} 
                    className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-black text-slate-900 uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">{item.term}</h3>
                      <div className="w-2 h-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500 animate-pulse transition-colors" />
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.definition}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeState === 'assistant' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[75vh] max-w-4xl mx-auto"
            >
              <div className="bg-slate-900 p-6 text-white border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 relative group border border-white/5">
                    <Logo size={40} />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl tracking-tighter uppercase italic flex items-center gap-3">
                       Shepherd AI <span className="bg-blue-600 text-[10px] not-italic px-3 py-1 rounded-full shadow-lg shadow-blue-500/40 tracking-widest">SR EXPERT</span>
                    </h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 20+ Years Field Experience • Senior Consultant
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Consultant Online</span>
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50 custom-scrollbar" id="chat-messages">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="bg-white p-5 rounded-[2rem] rounded-tl-none text-sm text-slate-700 shadow-sm border border-slate-100 leading-relaxed font-medium">
                    Shalom! I'm a senior sound engineer with over 20 years of field experience. How can I help you today? Ask me about live mixing techniques, equipment troubleshooting, or worship sound basics.
                  </div>
                </div>
                {messages.map((msg, mIdx) => (
                  <div key={mIdx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`p-4 px-6 rounded-[2rem] text-sm leading-relaxed font-medium shadow-md ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="bg-white p-4 px-6 rounded-[2rem] rounded-tl-none text-xs text-slate-400 font-black uppercase tracking-widest border border-slate-100 animate-pulse">
                      Analyzing frequencies...
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white border-t border-slate-100">
                <form 
                  onSubmit={handleSendMessage}
                  className="flex gap-3"
                >
                  <input 
                    type="text" 
                    placeholder="Ask the engineer (e.g., 'How to catch vocal feedback', 'Compressor settings'...)" 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
                    id="assistant-input"
                  />
                  <button 
                    disabled={isTyping}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 active:scale-95"
                  >
                    Send
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className={`${activeState === 'mixer' || activeState === 'frequency' ? 'max-w-[1440px]' : 'max-w-5xl'} mx-auto p-12 text-center transition-all duration-300`}>
        <div className="flex flex-col items-center gap-2 opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">HIMPOWER PVT. LTD.</p>
          <p className="text-[9px] font-bold tracking-[0.1em]">© 2026 SOUND SHEPHERD • ALL RIGHTS RESERVED</p>
        </div>
      </footer>
    </div>
  );
}

