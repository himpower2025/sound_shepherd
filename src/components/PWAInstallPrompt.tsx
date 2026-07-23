import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay if not dismissed previously
      const isDismissed = localStorage.getItem('sound_shepherd_pwa_dismissed');
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('sound_shepherd_pwa_dismissed', 'true');
  };

  if (isInstalled || (!showPrompt && !isIOS)) return null;

  return (
    <>
      {/* Install App Floating Banner */}
      {showPrompt && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 bg-slate-900/95 backdrop-blur-md text-slate-100 p-4 rounded-2xl border border-blue-500/30 shadow-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
              <Smartphone size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black uppercase tracking-wider text-white truncate">
                Install Sound Shepherd
              </h4>
              <p className="text-[11px] text-slate-300 font-medium truncate">
                Get full-screen offline access & sound tools
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Download size={14} />
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* iOS Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Smartphone size={24} />
              </div>
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                Add to Home Screen
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Install Sound Shepherd on iOS Safari
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-blue-400 shrink-0 font-bold">
                  1
                </div>
                <div className="flex items-center gap-2">
                  <span>Tap the <strong>Share</strong> button in Safari</span>
                  <Share size={16} className="text-blue-400 shrink-0" />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-blue-400 shrink-0 font-bold">
                  2
                </div>
                <div className="flex items-center gap-2">
                  <span>Select <strong>Add to Home Screen</strong></span>
                  <PlusSquare size={16} className="text-blue-400 shrink-0" />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-green-400 shrink-0 font-bold">
                  3
                </div>
                <div className="flex items-center gap-2">
                  <span>Launch Sound Shepherd from your Home Screen</span>
                  <CheckCircle size={16} className="text-green-400 shrink-0" />
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
