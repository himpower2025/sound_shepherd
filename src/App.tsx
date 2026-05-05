/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
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
  Activity
} from 'lucide-react';
import { AppState } from './types';
import { GUIDE_SECTIONS, GLOSSARY } from './constants';
import { askSoundAssistant } from './services/geminiService';
import { VirtualMixer } from './components/VirtualMixer';
import { AudioRecorder } from './components/AudioRecorder';
import { FrequencyReference } from './components/FrequencyReference';

export default function App() {
  const [activeState, setActiveState] = useState<AppState>('home');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const selectedSection = GUIDE_SECTIONS.find(s => s.id === selectedSectionId);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeState !== 'home' && (
              <button 
                onClick={() => {
                  setActiveState('home');
                  setSelectedSectionId(null);
                }}
                className="p-1 hover:bg-slate-800 rounded-full transition-colors"
                id="back-button"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h1 className="text-xl font-black tracking-tighter italic">SOUND SHEPHERD</h1>
            <span className="text-[8px] font-bold text-blue-500/60 uppercase tracking-widest hidden sm:block">by HIMPOWER</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveState('mixer')}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 ${activeState === 'mixer' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105' : 'hover:bg-slate-800 text-slate-400'}`}
              title="Virtual Mixer"
            >
              <Sliders size={20} />
              <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">Console</span>
            </button>
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
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 pb-32">
        <AnimatePresence mode="wait">
          {activeState === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12"
              id="home-content"
            >
              <section className="bg-gradient-to-br from-slate-900 to-indigo-950 p-10 md:p-16 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 px-4 py-1.5 rounded-full mb-6">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Training Mode Active</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-none italic">MASTER THE<br /><span className="text-blue-500">SANCTUARY</span> SOUND.</h2>
                    <p className="text-slate-400 max-w-md mb-10 text-lg leading-relaxed">The ultimate companion for church sound engineers. Practice, troubleshoot, and learn with a pro-grade virtual environment.</p>
                    <div className="flex flex-wrap gap-4">
                        <button onClick={() => setActiveState('mixer')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95">Enter Console</button>
                        <button onClick={() => setActiveState('recorder')} className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700 active:scale-95">Virtual Check</button>
                    </div>
                </div>
                <div className="absolute right-[-10%] bottom-[-10%] opacity-10 pointer-events-none rotate-12">
                    <Sliders size={400} />
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="home-grid">
                {/* Reference Tools */}
                <button
                  onClick={() => setActiveState('frequency')}
                  className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl border border-slate-800 text-left hover:shadow-blue-500/10 hover:-translate-y-1 transition-all group flex flex-col gap-6"
                >
                  <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/40 group-hover:scale-105 transition-transform">
                    <Activity size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black mb-2 uppercase italic tracking-tighter text-white">Frequency IQ</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">Master the frequency spectrum and instrument footprints at a glance.</p>
                  </div>
                </button>

                {GUIDE_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      setActiveState('guide');
                    }}
                    className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 text-left hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all group flex flex-col gap-6"
                    id={`section-${section.id}`}
                  >
                    <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner group-hover:scale-105">
                      {section.icon === 'Sliders' && <Sliders size={28} />}
                      {section.icon === 'Mic2' && <Mic2 size={28} />}
                      {section.icon === 'Wrench' && <Wrench size={28} />}
                      {section.icon === 'Zap' && <Zap size={28} />}
                      {section.icon === 'CheckSquare' && <CheckSquare size={28} />}
                    </div>
                    <div>
                      <h2 className="text-xl font-black mb-2 uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">{section.title}</h2>
                      <p className="text-slate-500 text-sm leading-relaxed">{section.description}</p>
                    </div>
                  </button>
                ))}

                <button
                  onClick={() => setActiveState('glossary')}
                  className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 text-left hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all group flex flex-col gap-6"
                  id="section-glossary"
                >
                  <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner group-hover:scale-105">
                    <BookText size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black mb-2 uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">Audio Lexicon</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">Expert technical terminology and deep-dive audio guides for beginners.</p>
                  </div>
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
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden p-0.5 relative group">
                    <img src="/artifacts/shepherd_app_logo.png" alt="AI Agent Logo" className="w-full h-full object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl tracking-tighter uppercase italic flex items-center gap-2">
                       Senior Sound Engineer <span className="bg-blue-600 text-[10px] not-italic px-2 py-0.5 rounded-full shadow-lg shadow-blue-500/40">AI AGENT</span>
                    </h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">20+ Years Field Experience • Church Audio Expert</p>
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
                    샬롬! 20년 현업 경력의 시니어 엔지니어입니다. 예배 음향 세팅, 믹싱 노하우, 혹은 장비 트러블슈팅에 대해 무엇이든 물어보세요. 실전 팁을 바탕으로 도와드리겠습니다.
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
                    placeholder="엔지니어에게 질문하기 (예: '보컬 피드백 잡는 방법', '컴프레서 세팅법'...)" 
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

      <footer className="max-w-5xl mx-auto p-12 text-center">
        <div className="flex flex-col items-center gap-2 opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">HIMPOWER PVT. LTD.</p>
          <p className="text-[9px] font-bold tracking-[0.1em]">© 2026 SOUND SHEPHERD • ALL RIGHTS RESERVED</p>
        </div>
      </footer>
    </div>
  );
}

