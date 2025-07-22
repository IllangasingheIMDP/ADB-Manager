import React from 'react';

const Background = ({ children }) => {
  return (
    <div className="relative flex flex-col h-full w-full items-center justify-center overflow-y-auto min-h-screen bg-[url('/home_bg.jpg')] bg-cover bg-top bg-no-repeat hide-scrollbar">
      {/* Black blur overlay */}
      <div 
        className="absolute inset-0 bg-black/10"
        style={{ backdropFilter: 'blur(2px)' }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default Background;
