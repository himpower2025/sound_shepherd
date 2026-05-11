import React from 'react';
import { Waves, AudioLines } from 'lucide-react';

export const Logo = ({ size = 24, className = "" }: { size?: number, className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Deep Background glow for premium feel */}
      <div className="absolute inset-0 bg-blue-600/10 blur-2xl rounded-full" />
      
      {/* Main Signal Icon (Strong White bars) */}
      <div className="relative z-10 flex items-center justify-center">
        <AudioLines size={size * 0.85} className="text-white group-hover:text-blue-400 transition-colors" strokeWidth={2.5} />
        
        {/* Neon horizontal cross bar (The 'Shepherd' signature) */}
        <div className="absolute w-[70%] h-[12%] bg-blue-500 rounded-full top-[42%] shadow-[0_0_10px_rgba(59,130,246,0.9)] animate-pulse" />
      </div>
    </div>
  );
};
