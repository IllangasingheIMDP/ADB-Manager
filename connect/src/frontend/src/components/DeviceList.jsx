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
              className="flex items-center justify-between bg-white/70 border rounded p-2 hover:bg-emerald-100 transition-transform duration-200 transform cursor-pointer"
              onClick={() => handleDeviceClick(device)}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-800">{device}</span>
                {audioStreaming[device] && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">🎵 Audio On</span>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={(e) => handleMenuClick(device, e)}
                  className="p-1 hover:bg-emerald-100 rounded transition"
                  title="Show actions"
                >
                  <span className="dots text-xl">⋮</span>
                </button>
                {activeMenu === device && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border border-[#04806b]/70 bg-white/90 backdrop-blur-md ring-1 ring-black ring-opacity-10 z-50 max-h-72 overflow-y-auto transition-all duration-200">
                    {/* Caret */}
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-white/70 border-t border-l border-[#04806b]/30 rotate-45 z-10"></div>
                    <div className="py-2">
                      <button
                        onClick={() => handleCommandsClick(device)}
                        className="block w-full px-4 py-2 text-sm text-gray-800 font-medium hover:bg-emerald-200/70 hover:text-[#04806b] rounded-md transition"
                      >
                        Execute Shell Commands
                      </button>
                      <div className="border-t border-emerald-100 my-1" />
                      <button
                        onClick={() => {
                          setFileSendDevice(device);
                          setActiveMenu(null);
                        }}
                        className="block w-full px-4 py-2 text-sm text-gray-800 font-medium hover:bg-emerald-200/70 hover:text-[#04806b] rounded-md transition"
                      >
                        Send files
                      </button>
                      <div className="border-t border-emerald-100 my-1" />
                      <button
                        onClick={() => handleAudioToggle(device)}
                        className={`block w-full px-4 py-2 text-sm font-medium rounded-md transition ${
                          audioStreaming[device] 
                            ? 'text-red-700 hover:bg-red-100' 
                            : 'text-gray-800 hover:bg-emerald-200/70 hover:text-[#04806b]'
                        }`}
                      >
                        {audioStreaming[device] ? ' Stop Audio Stream' : 'Start Audio Stream'}
                      </button>
                      <div className="border-t border-emerald-100 my-1" />
                      <button
                        onClick={() => handleReconnectClick(device)}
                        className="block w-full px-4 py-2 text-sm text-gray-800 font-medium hover:bg-emerald-200/70 hover:text-[#04806b] rounded-md transition"
                      >
                        Reconnect
                      </button>
                      <div className="border-t border-emerald-100 my-1" />
                      <button
                        onClick={() => handleExplorerClick(device)}
                        className="block w-full px-4 py-2 text-sm text-gray-800 font-medium hover:bg-emerald-200/70 hover:text-[#04806b] rounded-md transition"
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
        className="mt-6 w-full p-2 bg-emerald-700/70 text-white rounded hover:bg-teal-700 hover:scale-105 transition-transform duration-200"
      >
        Refresh Devices
      </button>
      {fileSendDevice && (
        <div className="absolute inset-0.5 flex items-center justify-center  ">
          <div className="relative rounded-2xl border border-[#04806b]/30 shadow-emerald-800 shadow-lg bg-white/80 backdrop-blur-lg p-0">
            <button
              onClick={() => setFileSendDevice(null)}
              className="absolute top-2 right-2 text-[#04806b] bg-white/80 rounded-full p-1 hover:bg-emerald-100 transition z-10"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <FileSend
              deviceId={fileSendDevice}
              onClose={() => setFileSendDevice(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DeviceList;