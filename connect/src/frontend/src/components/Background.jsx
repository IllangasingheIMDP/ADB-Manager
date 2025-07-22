import React from 'react';

const Background = ({ children }) => {
  return (
    <div className="relative flex flex-col h-full w-full items-center justify-center overflow-y-auto min-h-screen bg-[url('/home_bg.jpg')] bg-cover bg-top bg-no-repeat hide-scrollbar">
      {/* Base dark overlay - fixed to viewport */}
      <div className="fixed inset-0 bg-black/40 z-0"></div>
      
      {/* Animated gradient waves - fixed to viewport */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))',
          backgroundSize: '400% 400%',
          animation: 'gradientWave 8s ease-in-out infinite'
        }}
      ></div>
      
      {/* Floating particles - fixed to viewport */}
      <div className="fixed inset-0 z-0">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>
      </div>
      
      {/* Animated border lines - fixed to viewport */}
      <div className="fixed inset-0 z-0">
        <div className="border-line border-line-top"></div>
        <div className="border-line border-line-right"></div>
        <div className="border-line border-line-bottom"></div>
        <div className="border-line border-line-left"></div>
      </div>
      
      {/* Pulsing center glow - fixed to viewport */}
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 z-0"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
          animation: 'pulse 3s ease-in-out infinite'
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full w-full items-center justify-center">
        {children}
      </div>
      
      {/* CSS animations */}
      <style jsx>{`
        @keyframes gradientWave {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-30px) rotate(120deg);
          }
          66% {
            transform: translateY(30px) rotate(240deg);
          }
        }
        
        @keyframes borderMove {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100vw);
          }
        }
        
        @keyframes borderMoveVertical {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }
        
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(59, 130, 246, 0.6);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }
        
        .particle-1 {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 8s;
        }
        
        .particle-2 {
          top: 60%;
          left: 20%;
          animation-delay: -2s;
          animation-duration: 6s;
          background: rgba(147, 51, 234, 0.6);
        }
        
        .particle-3 {
          top: 30%;
          left: 70%;
          animation-delay: -4s;
          animation-duration: 10s;
          background: rgba(236, 72, 153, 0.6);
        }
        
        .particle-4 {
          top: 80%;
          left: 80%;
          animation-delay: -1s;
          animation-duration: 7s;
        }
        
        .particle-5 {
          top: 10%;
          left: 60%;
          animation-delay: -3s;
          animation-duration: 9s;
          background: rgba(34, 197, 94, 0.6);
        }
        
        .particle-6 {
          top: 70%;
          left: 40%;
          animation-delay: -5s;
          animation-duration: 5s;
          background: rgba(251, 191, 36, 0.6);
        }
        
        .border-line {
          position: absolute;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
        }
        
        .border-line-top {
          top: 0;
          left: 0;
          width: 100px;
          height: 2px;
          animation: borderMove 4s linear infinite;
        }
        
        .border-line-bottom {
          bottom: 0;
          right: 0;
          width: 100px;
          height: 2px;
          animation: borderMove 4s linear infinite reverse;
          animation-delay: -2s;
        }
        
        .border-line-left {
          left: 0;
          top: 0;
          width: 2px;
          height: 100px;
          background: linear-gradient(0deg, transparent, rgba(147, 51, 234, 0.5), transparent);
          animation: borderMoveVertical 5s linear infinite;
        }
        
        .border-line-right {
          right: 0;
          bottom: 0;
          width: 2px;
          height: 100px;
          background: linear-gradient(0deg, transparent, rgba(236, 72, 153, 0.5), transparent);
          animation: borderMoveVertical 5s linear infinite reverse;
          animation-delay: -2.5s;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};

export default Background;
