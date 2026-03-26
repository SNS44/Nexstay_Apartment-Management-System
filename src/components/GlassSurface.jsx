import React from 'react';

export default function GlassSurface({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`backdrop-blur-xl bg-white/60 border border-white/50 shadow-2xl rounded-3xl ${onClick ? 'cursor-pointer hover:border-violet-300/50 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

