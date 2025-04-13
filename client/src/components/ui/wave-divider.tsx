import React from "react";

interface WaveDividerProps {
  className?: string;
}

const WaveDivider: React.FC<WaveDividerProps> = ({ className = "" }) => {
  return (
    <div className={`relative w-full h-20 overflow-hidden ${className}`}>
      <svg
        className="w-full h-full"
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        style={{ transform: "scaleY(-1)" }} // 👈 Flip vertically
      >
        <path
          d="M0,50 C200,100 400,0 600,50 C800,100 1000,0 1000,0 L1000,100 L0,100 Z"
          fill="#F7941E"
          opacity="0.3"
        />
        <path
          d="M0,60 C250,90 400,10 600,60 C750,100 1000,20 1000,20 L1000,100 L0,100 Z"
          fill="#8BC34A"
          opacity="0.4"
        />
        <path
          d="M0,40 C300,80 500,0 700,40 C900,80 1000,20 1000,20 L1000,100 L0,100 Z"
          fill="#9575CD"
          opacity="0.5"
        />
        <path
          d="M0,30 C150,70 450,0 700,30 C900,60 1000,10 1000,10 L1000,100 L0,100 Z"
          fill="#E91E63"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};

export default WaveDivider;
