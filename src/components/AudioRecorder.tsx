import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, Square, Play, Pause, Trash2, Volume2, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

interface RecordingError {
  type: 'permission' | 'busy' | 'not-found' | 'unsupported' | 'generic';
  title: string;
  subtitle: string;
  steps: string[];
}

export const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recError, setRecError] = useState<RecordingError | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    setRecError(null);
    try {
      // 1. Pre-flight checks for browser API & secure context support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw { 
          name: 'NotSupportedError', 
          message: 'Secure context or browser media devices API is not supported.' 
        };
      }
      
      if (typeof MediaRecorder === 'undefined') {
        throw { 
          name: 'NotSupportedError', 
          message: 'MediaRecorder is not supported on this browser.' 
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        audioChunksRef.current = [];
      };

      audioChunksRef.current = [];
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      
      const errName = err?.name || '';
      const errMessage = err?.message || '';
      
      // Analyze error type
      if (
        errName === 'NotAllowedError' || 
        errName === 'PermissionDeniedError' || 
        errMessage.toLowerCase().includes('permission') || 
        errMessage.toLowerCase().includes('allowed')
      ) {
        setRecError({
          type: 'permission',
          title: 'Microphone Access Denied',
          subtitle: 'The browser is blocked from accessing your microphone.',
          steps: [
            'Click the settings icon (lock/sliders) on the left of the browser address bar and set Microphone to "Allow".',
            'macOS: Go to System Settings > Privacy & Security > Microphone and ensure your browser is turned ON.',
            'Mobile/In-App: If you opened this in KakaoTalk, Instagram, or LINE, tap the top-right menu (...) and select "Open in Default Browser" or "Open in Chrome/Safari".'
          ]
        });
      } else if (
        errName === 'NotReadableError' || 
        errName === 'TrackStartError' || 
        errMessage.toLowerCase().includes('readable') || 
        errMessage.toLowerCase().includes('start track')
      ) {
        setRecError({
          type: 'busy',
          title: 'Microphone is Busy',
          subtitle: 'The microphone is in use or blocked by another application.',
          steps: [
            'Close other apps using the microphone (e.g. Zoom, MS Teams, FaceTime, phone calls).',
            'Ensure no other browser tabs or windows are currently using voice or video.',
            'If the issue persists, restart your browser or reboot your device to unlock the audio interface.'
          ]
        });
      } else if (
        errName === 'NotFoundError' || 
        errName === 'DevicesNotFoundError' || 
        errMessage.toLowerCase().includes('not found')
      ) {
        setRecError({
          type: 'not-found',
          title: 'No Microphone Found',
          subtitle: 'We could not detect any connected audio inputs.',
          steps: [
            'Check that your microphone or external audio interface is securely plugged in.',
            'Verify Bluetooth microphones are turned on, charged, and paired with this device.',
            'Check your operating system sound settings to ensure a default input device is active.'
          ]
        });
      } else if (
        errName === 'NotSupportedError' || 
        errName === 'SecurityError' || 
        errMessage.toLowerCase().includes('support')
      ) {
        setRecError({
          type: 'unsupported',
          title: 'Connection / Browser Unsupported',
          subtitle: 'Your browser environment blocks audio recording capabilities.',
          steps: [
            'Make sure you are using a secure connection (HTTPS). Recording is disabled on insecure (HTTP) sites.',
            'Avoid using in-app webviews (KakaoTalk, Instagram, LINE). Open the link directly in standard Safari (iOS) or Chrome (Android).',
            'Try accessing this page from a fully-featured modern browser like Chrome, Safari, Firefox, or Edge.'
          ]
        });
      } else {
        setRecError({
          type: 'generic',
          title: 'Microphone Setup Failed',
          subtitle: errMessage || 'An unexpected hardware setup error occurred.',
          steps: [
            'Check both browser and OS settings to ensure microphone permissions are granted.',
            'Disconnect and reconnect your audio interface or microphone.',
            'Reload the page and try again, or switch to another supported browser.'
          ]
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (recError) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-md mx-auto">
        <div className="flex flex-col items-center gap-6">
          <div className="bg-red-50 p-4 rounded-2xl text-red-500 animate-pulse">
            <AlertTriangle size={32} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900">{recError.title}</h3>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              {recError.subtitle}
            </p>
          </div>

          <div className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Troubleshooting Steps:
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              {recError.steps.map((step, idx) => (
                <li key={idx} className="flex gap-3 items-start leading-relaxed text-left">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => setRecError(null)}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-200 text-sm active:scale-[0.98] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setRecError(null);
                setTimeout(startRecording, 100);
              }}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-100 hover:shadow-blue-200 transition-all duration-200 text-sm flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw size={14} />
              Retry Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="bg-blue-50 p-4 rounded-2xl">
          <Sparkles className="text-blue-600" size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Virtual Soundcheck</h2>
          <p className="text-slate-500 mt-2 max-w-sm">
            Record a short sample of your vocals or instrument to practice mixing without a live band.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          {!audioURL && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRecording ? (
                <Square className="text-white fill-white" size={24} />
              ) : (
                <Mic className="text-white" size={32} />
              )}
            </motion.button>
          )}

          {isRecording && (
            <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                    {[...Array(6)].map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ height: [10, 30, 15, 25, 10] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                            className="w-1 bg-red-500 rounded-full"
                        />
                    ))}
                </div>
                <span className="text-red-500 font-bold text-xs uppercase animate-pulse">Recording...</span>
            </div>
          )}

          {audioURL && !isRecording && (
            <div className="w-full space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={togglePlayback}
                    className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                  </button>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Practice Clip</h4>
                    <span className="text-xs text-slate-400">Ready for Virtual Mixing</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setAudioURL(null);
                    setIsPlaying(false);
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <audio 
                ref={audioRef} 
                src={audioURL} 
                onEnded={() => setIsPlaying(false)} 
                hidden
              />

              <div className="flex flex-col gap-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Volume2 size={14} />
                    Volume Response
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        animate={{ width: isPlaying ? ['20%', '90%', '40%', '70%'] : '0%' }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="h-full bg-blue-500"
                    />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
