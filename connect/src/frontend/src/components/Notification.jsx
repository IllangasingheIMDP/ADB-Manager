import React, { useState, useEffect } from 'react';

const Notification = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose,
  showIcon = true 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = React.useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    setIsAnimating(true);
    
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, handleClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          borderColor: 'border-emerald-400/40',
          backgroundColor: 'bg-emerald-900/20',
          textColor: 'text-emerald-100',
          iconColor: 'text-emerald-400',
          shadowColor: 'shadow-emerald-800'
        };
      case 'error':
        return {
          borderColor: 'border-red-400/40',
          backgroundColor: 'bg-red-900/20',
          textColor: 'text-red-100',
          iconColor: 'text-red-400',
          shadowColor: 'shadow-red-800'
        };
      case 'warning':
        return {
          borderColor: 'border-yellow-400/40',
          backgroundColor: 'bg-yellow-900/20',
          textColor: 'text-yellow-100',
          iconColor: 'text-yellow-400',
          shadowColor: 'shadow-yellow-800'
        };
      case 'info':
      default:
        return {
          borderColor: 'border-teal-400/40',
          backgroundColor: 'bg-teal-900/20',
          textColor: 'text-teal-100',
          iconColor: 'text-teal-400',
          shadowColor: 'shadow-teal-800'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (!isVisible) return null;

  const styles = getTypeStyles();

  return (
    <div className="relative z-100">
      <div
        className={`
          min-w-80 max-w-md rounded-2xl border ${styles.borderColor} ${styles.shadowColor} shadow-lg 
          relative overflow-hidden transition-all duration-300 ease-in-out
          ${isAnimating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'}
        `}
      >
        {/* Glassmorphism background */}
        <div
          className={`absolute rounded-2xl inset-0 ${styles.backgroundColor}`}
          style={{ backdropFilter: 'blur(12px)' }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 p-4">
          <div className="flex items-start gap-3">
            {showIcon && (
              <div className={`flex-shrink-0 ${styles.iconColor} mt-0.5`}>
                {getIcon()}
              </div>
            )}
            
            <div className="flex-1">
              <p className={`text-sm font-medium ${styles.textColor} leading-relaxed`}>
                {message}
              </p>
            </div>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className={`
                flex-shrink-0 ${styles.iconColor} hover:opacity-70 
                transition-opacity duration-200 ml-2 mt-0.5
              `}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 rounded-b-2xl overflow-hidden">
          <div
            className={`h-full ${styles.iconColor.replace('text-', 'bg-')} transition-all ease-linear`}
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`
            }}
          ></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Notification;
