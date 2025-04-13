import React from "react";

interface WaveDividerProps {
  className?: string;
}

const WaveDivider: React.FC<WaveDividerProps> = ({ className = "" }) => {
  return (
    <div className={`relative w-full h-16 overflow-hidden ${className}`}>
      <svg
        className="w-full h-full"
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6C3FC9" />
            <stop offset="40%" stopColor="#8D5ED6" />
            <stop offset="70%" stopColor="#E0A93A" />
            <stop offset="90%" stopColor="#F9A825" />
          </linearGradient>
        </defs>
        <path
          d="M0,20 C150,60 350,0 500,30 C650,60 850,10 1000,30 L1000,0 L0,0 Z"
          fill="#6C3FC9"
        />
        <path
          d="M0,40 C200,80 350,20 500,40 C650,60 800,20 1000,50 L1000,20 C850,0 650,50 500,20 C350,-10 150,40 0,0 Z"
          fill="url(#waveGradient)"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};

export default WaveDivider;
