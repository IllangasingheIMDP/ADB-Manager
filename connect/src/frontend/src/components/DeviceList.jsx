import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FileSend from './FileSend';
import { useNotification } from '../hooks/useNotification';
import { getErrorMessage, getSuccessMessage } from '../utils/errorHandler';

function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [fileSendDevice, setFileSendDevice] = useState(null);
  const [audioStreaming, setAudioStreaming] = useState({}); // Track audio streaming state per device

  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const fetchDevices = useCallback(async () => {
    try {
      const result = await window.electronAPI.adbDevices();
      const devicesList = result
        .split('\n')
        .slice(1)
        .filter(line => line.trim() !== '')
        .map(line => line.split('\t')[0]);
      setDevices(devicesList);
    } catch (err) {
      console.error('Error fetching devices:', err);
      showError(getErrorMessage(err.message));
    }
  }, [showError]);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  const handleDeviceClick = (deviceId) => {
    navigate(`/device/${deviceId}`);
  };

  const handleMenuClick = (deviceId, event) => {
    event.stopPropagation(); // Prevent device click when clicking menu
    setActiveMenu(activeMenu === deviceId ? null : deviceId);
  };

  const handleReconnectClick = async (deviceId) => {
    try{
      
      await window.electronAPI.adbReconnect(deviceId);
      setActiveMenu(null);
      fetchDevices();
      showSuccess(getSuccessMessage('reconnect'));
    }catch (err) {
      console.error('Error reconnecting device:', err);
      showError(getErrorMessage(err.message));
    }
  }

  const handleCommandsClick = (deviceId) => {
    navigate(`/commands/${deviceId}`);
  };

  const handleExplorerClick = (deviceId) => {
    navigate(`/explorer/${deviceId}`);
  };

  const handleAudioToggle = async (deviceId) => {
    const isCurrentlyStreaming = audioStreaming[deviceId];
    
    try {
      
      if (isCurrentlyStreaming) {
        // Stop audio streaming
        await window.electronAPI.stopAudioStream(deviceId);
        setAudioStreaming(prev => ({ ...prev, [deviceId]: false }));
        showSuccess(getSuccessMessage('audio_stop'));
      } else {
        // Start audio streaming
        await window.electronAPI.startAudioStream(deviceId);
        setAudioStreaming(prev => ({ ...prev, [deviceId]: true }));
        showSuccess(getSuccessMessage('audio_start'));
      }
      setActiveMenu(null);
    } catch (err) {
      console.error('Error toggling audio stream:', err);
      showError(getErrorMessage(err.message));
    }
  };

  return (
    <div className="w-full p-6">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#029078] via-white text-transparent bg-clip-text"
      style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}
      >
        Connected Devices
      </h2>
      <div>
        {devices.length === 0 && (
          <div className="text-[#04806b] mb-4">No devices connected</div>
        )}
        <ul className="space-y-2">
          {devices.map((device, index) => (
            <li
              key={index}
              className="relative flex items-center justify-between border border-emerald-400/40 rounded-2xl p-4 hover:scale-[1.02] transition-all duration-300 transform cursor-pointer shadow-lg shadow-emerald-800/20 overflow-hidden"
              onClick={() => handleDeviceClick(device)}
            >
              {/* Glassmorphism background */}
              <div 
                className="absolute inset-0 bg-emerald-900/10 rounded-2xl"
                style={{ backdropFilter: 'blur(12px)' }}
              ></div>
              
              {/* Content */}
              <div className="relative z-10 flex items-center gap-2">
                <span className="font-mono text-emerald-100 font-medium">{device}</span>
                {audioStreaming[device] && (
                  <span className="text-xs bg-emerald-500/80 text-white px-3 py-1 rounded-full backdrop-blur-sm border border-emerald-400/30">🎵 Audio On</span>
                )}
              </div>
              <div className="relative z-10">
                
                {activeMenu === device && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl border border-emerald-400/40 ring-1 ring-emerald-400/20 z-50 max-h-72 overflow-hidden transition-all duration-300">
                    {/* Glassmorphism background */}
                    <div 
                      className="absolute inset-0 bg-emerald-900/20 rounded-2xl"
                      style={{ backdropFilter: 'blur(12px)' }}
                    ></div>
                    
                    {/* Caret */}
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-emerald-900/20 border-t border-l border-emerald-400/30 rotate-45 z-10" style={{ backdropFilter: 'blur(12px)' }}></div>
                    
                    <div className="relative z-10 py-2">
                      <button
                        onClick={() => handleCommandsClick(device)}
                        className="block w-full px-4 py-3 text-sm text-emerald-100 font-medium hover:bg-emerald-400/20 hover:text-white rounded-xl transition-all duration-200 mx-2"
                      >
                        Execute Shell Commands
                      </button>
                      <div className="border-t border-emerald-400/20 my-1 mx-2" />
                      <button
                        onClick={() => {
                          setFileSendDevice(device);
                          setActiveMenu(null);
                        }}
                        className="block w-full px-4 py-3 text-sm text-emerald-100 font-medium hover:bg-emerald-400/20 hover:text-white rounded-xl transition-all duration-200 mx-2"
                      >
                        Send files
                      </button>
                      <div className="border-t border-emerald-400/20 my-1 mx-2" />
                      <button
                        onClick={() => handleAudioToggle(device)}
                        className={`block w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mx-2 ${
                          audioStreaming[device] 
                            ? 'text-red-300 hover:bg-red-500/20 hover:text-red-100' 
                            : 'text-emerald-100 hover:bg-emerald-400/20 hover:text-white'
                        }`}
                      >
                        {audioStreaming[device] ? ' Stop Audio Stream' : 'Start Audio Stream'}
                      </button>
                      <div className="border-t border-emerald-400/20 my-1 mx-2" />
                      <button
                        onClick={() => handleReconnectClick(device)}
                        className="block w-full px-4 py-3 text-sm text-emerald-100 font-medium hover:bg-emerald-400/20 hover:text-white rounded-xl transition-all duration-200 mx-2"
                      >
                        Reconnect
                      </button>
                      <div className="border-t border-emerald-400/20 my-1 mx-2" />
                      <button
                        onClick={() => handleExplorerClick(device)}
                        className="block w-full px-4 py-3 text-sm text-emerald-100 font-medium hover:bg-emerald-400/20 hover:text-white rounded-xl transition-all duration-200 mx-2"
                      >
                        File Explorer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={fetchDevices}
        className="mt-6 w-full p-4 rounded-2xl border border-emerald-400/40 text-emerald-100 font-medium hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-emerald-800/20 relative overflow-hidden"
      >
        {/* Glassmorphism background */}
        <div 
          className="absolute inset-0 bg-emerald-700/20 rounded-2xl"
          style={{ backdropFilter: 'blur(12px)' }}
        ></div>
        <span className="relative z-10">Refresh Devices</span>
      </button>
      {fileSendDevice && (
        <div className="absolute inset-0.5 flex items-center justify-center">
          <div className="relative rounded-2xl border border-emerald-400/40 shadow-emerald-800 shadow-lg overflow-hidden">
            {/* Glassmorphism background */}
            <div 
              className="absolute inset-0 bg-emerald-900/20 rounded-2xl"
              style={{ backdropFilter: 'blur(12px)' }}
            ></div>
            
            <button
              onClick={() => setFileSendDevice(null)}
              className="absolute top-4 right-4 text-emerald-100 bg-emerald-400/20 rounded-full p-2 hover:bg-emerald-400/30 transition-all duration-200 z-20 backdrop-blur-sm border border-emerald-400/30"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative z-10">
              <FileSend
                deviceId={fileSendDevice}
                onClose={() => setFileSendDevice(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeviceList;