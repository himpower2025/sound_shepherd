import React from 'react';
import { Waves, AudioLines } from 'lucide-react';

export const Logo = ({ size = 24, className = "" }: { size?: number, className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
      
      {/* Wave Lines (Bottom/Sides) */}
      <div className="absolute inset-x-0 bottom-0 top-1/2 flex items-center justify-center">
        <Waves size={size * 0.8} className="text-blue-500/40" />
      </div>

      {/* Main Signal Icon (Forms a Cross structure) */}
      <div className="relative z-10 flex items-center justify-center">
        <AudioLines size={size * 0.9} className="text-blue-500" strokeWidth={2.5} />
        
        {/* Subtle Horizontal cross bar */}
        <div className="absolute w-[60%] h-[15%] bg-blue-400/80 rounded-full blur-[1px] top-[40%] shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
      </div>
    </div>
  );
};
