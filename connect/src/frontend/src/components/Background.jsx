import React from 'react';
import Particles from './Particles';

const Background = ({ children }) => {
  return (
    <div className="relative w-full min-h-screen overflow-y-auto hide-scrollbar">
      {/* Background - fixed position */}
      <div className="fixed bg-black inset-0 z-0">
      <Particles
    particleColors={['#086648','#13b07e','#13b062','#18b89d']}
    particleCount={200}
    particleSpread={10}
    speed={0.2}
    particleBaseSize={150}
    moveParticlesOnHover={true}
    alphaParticles={false}
    disableRotation={false}
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
