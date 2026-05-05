import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, Square, Play, Pause, Trash2, Volume2, Sparkles } from 'lucide-react';

export const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
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
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied. Please enable it to use the Virtual Soundcheck.");
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
