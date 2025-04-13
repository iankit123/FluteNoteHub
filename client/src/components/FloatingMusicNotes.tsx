import React from 'react';

const FloatingMusicNotes: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
      <div className="animate-float absolute top-20 left-[10%] text-3xl text-royal-purple">♪</div>
      <div className="animate-float absolute top-[45%] right-[20%] text-3xl text-royal-purple" style={{ animationDelay: '0.15s' }}>♫</div>
      <div className="animate-float absolute bottom-[30%] left-[15%] text-3xl text-royal-purple" style={{ animationDelay: '0.3s' }}>♩</div>
      <div className="animate-float absolute top-[15%] right-[10%] text-3xl text-royal-purple" style={{ animationDelay: '0.7s' }}>♬</div>
    </div>
  );
};

export default FloatingMusicNotes;
