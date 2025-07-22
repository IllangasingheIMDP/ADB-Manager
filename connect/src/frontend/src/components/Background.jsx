import React from 'react';
import LightRays from './LightRays';

const Background = ({ children }) => {
  return (
    <div className="relative w-full min-h-screen bg-black overflow-y-auto hide-scrollbar">
      {/* Background - fixed position */}
      <div className="fixed inset-0 z-0">
        <LightRays
    raysOrigin="top-center"
    raysColor="#2ab566"
    raysSpeed={1.5}
    lightSpread={1.8}
    rayLength={2.0}
    followMouse={true}
    mouseInfluence={0.1}
    noiseAmount={0.1}
    distortion={0.05}
    className="custom-rays"
  />
      </div>
      
      {/* Content wrapper - allows scrolling */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen py-8">
        {children}
      </div>
    </div>
  );
};

export default Background;
