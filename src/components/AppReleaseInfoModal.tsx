import React from 'react';
import { motion } from 'motion/react';
import { X, Award, ShieldCheck, Mail, Cpu, Sparkles, Layers, Volume2 } from 'lucide-react';

interface AppReleaseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppReleaseInfoModal({ isOpen, onClose }: AppReleaseInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Volume2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white uppercase tracking-wider">
                  Sound Shepherd
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                  v1.0.0 Official Release
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                HIMPOWER PVT. LTD. • Professional Reference
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full transition-colors hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Key Capabilities */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
              <Sparkles size={14} />
              Core Capabilities & Features
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                <div className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                  <Layers size={13} className="text-blue-400" />
                  Interactive Sound Mixer
                </div>
                <p className="text-[11px] text-slate-400">
                  Virtual 24-channel soundboard with real-time Web Audio API EQ, gain staging, aux sends, and compression.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                <div className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                  <Cpu size={13} className="text-indigo-400" />
                  Shepherd AI Assistant
                </div>
                <p className="text-[11px] text-slate-400">
                  Powered by Google Gemini for live acoustics troubleshooting, EQ guidance, and gear recommendations.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                <div className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                  <Award size={13} className="text-cyan-400" />
                  Microphone Catalog
                </div>
                <p className="text-[11px] text-slate-400">
                  Interactive vector polar pattern pickup diagrams, placement guides, and HD frequency curves.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                <div className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  PWA & Offline Reference
                </div>
                <p className="text-[11px] text-slate-400">
                  Standalone installation support, full offline caching, and responsive mobile-first architecture.
                </p>
              </div>
            </div>
          </div>

          {/* Compliance & Store Release */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-2">
              Official Distribution & Compliance
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Sound Shepherd complies with Web App Store standards, PWA specification manifests, Google Firebase authentication guidelines, and GDPR/Privacy rules for official deployment.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                PWA Certified
              </span>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                Web Audio API Engine
              </span>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                Firebase Firestore
              </span>
            </div>
          </div>

          {/* Publisher Info */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-400 text-[11px]">
            <div>
              <p className="font-bold text-slate-300">Published by HIMPOWER PVT. LTD.</p>
              <p className="text-[10px] text-slate-500">Copyright © 2026. All rights reserved.</p>
            </div>
            <a
              href="mailto:himpower2025@gmail.com"
              className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Mail size={12} />
              himpower2025@gmail.com
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
