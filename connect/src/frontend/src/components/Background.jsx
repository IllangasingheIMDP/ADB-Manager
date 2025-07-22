import React from 'react';
import Beams from './Beams';

const Background = ({ children }) => {
  return (
    <div className="relative w-full min-h-screen overflow-y-auto hide-scrollbar">
      {/* Background - fixed position */}
      <div className="fixed inset-0 z-0">
        <Beams
    beamWidth={2}
    beamHeight={15}
    beamNumber={12}
    lightColor="#2ab566"
    speed={2}
    noiseIntensity={1.75}
    scale={0.2}
    rotation={45}
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
