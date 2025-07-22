import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileSend from '../components/FileSend';
import DeviceInfo from '../components/DeviceInfo';
import { useNotification } from '../hooks/useNotification';
import { getErrorMessage, getSuccessMessage } from '../utils/errorHandler';
import { 
  FiArrowLeft, 
  FiRefreshCw, 
  FiSmartphone, 
  FiTerminal, 
  FiFolder, 
  FiVolume2, 
  FiVolumeX, 
  FiUpload, 
  FiMonitor, 
  FiInfo,
  FiX 
} from 'react-icons/fi';

const Device = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [audioStreaming, setAudioStreaming] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [showFileSend, setShowFileSend] = useState(false);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);

  const { showSuccess, showError } = useNotification();

  const fetchDeviceInfo = useCallback(async () => {
    try {
      setLoading(true);
      // Get device information
      const result = await window.electronAPI.adbShell(deviceId, `getprop ro.product.model && adb -s ${deviceId} shell getprop ro.build.version.release && adb -s ${deviceId} shell getprop ro.product.manufacturer`);
      const lines = result.trim().split('\n');
      setDeviceInfo({
        model: lines[0] || 'Unknown',
        androidVersion: lines[1] || 'Unknown',
        manufacturer: lines[2] || 'Unknown'
      });
    } catch (err) {
      console.error('Error fetching device info:', err);
      const errorMsg = getErrorMessage(err.message);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [deviceId, showError]);

  useEffect(() => {
    fetchDeviceInfo();
  }, [fetchDeviceInfo]);

  const handleAudioToggle = async () => {
    try {
      if (audioStreaming) {
        await window.electronAPI.stopAudioStream(deviceId);
        setAudioStreaming(false);
        const successMsg = getSuccessMessage('audio_stop');
        showSuccess(successMsg);
      } else {
        await window.electronAPI.startAudioStream(deviceId);
        setAudioStreaming(true);
        const successMsg = getSuccessMessage('audio_start');
        showSuccess(successMsg);
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err.message);
      showError(errorMsg);
    }
  };

   const handleVideoOn = async()=>{
    try {
        await window.electronAPI.startVideoStream(deviceId);
        showSuccess('Screen mirroring started successfully');
    } catch (error) {
        console.log('Failed to start video stream: ' + error.message);
        showError(getErrorMessage(error.message));
    }
   }

  const handleReconnect = async () => {
    try {
      showSuccess('Reconnecting...');
      await window.electronAPI.adbReconnect(deviceId);
      const successMsg = getSuccessMessage('reconnect');
      showSuccess(successMsg);
      fetchDeviceInfo();
    } catch (err) {
      const errorMsg = getErrorMessage(err.message);
      showError(errorMsg);
    }
  };

  const handleFileSend = () => {
    setShowFileSend(true);
  };

  const handleDeviceInfo = () => {
    setShowDeviceInfo(true);
  };

  const featureCards = [
    {
      title: 'Shell Commands',
      description: 'Execute ADB shell commands on your device',
      icon: <FiTerminal className="w-6 h-6" />,
      action: () => navigate(`/commands/${deviceId}`),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'File Explorer',
      description: 'Browse device files and download to PC',
      icon: <FiFolder className="w-6 h-6" />,
      action: () => navigate(`/explorer/${deviceId}`),
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Audio Stream',
      description: audioStreaming ? 'Stop streaming device audio' : 'Stream device audio to PC',
      icon: audioStreaming ? <FiVolumeX className="w-6 h-6" /> : <FiVolume2 className="w-6 h-6" />,
      action: handleAudioToggle,
      color: audioStreaming ? 'from-red-500 to-pink-500' : 'from-purple-500 to-violet-500'
    },
    {
      title: 'Send Files',
      description: 'Transfer files from PC to device',
      icon: <FiUpload className="w-6 h-6" />,
      action: handleFileSend,
      color: 'from-orange-500 to-yellow-500'
    },
    {
      title: 'Screen Mirror',
      description: 'Mirror device screen',
      icon: <FiMonitor className="w-6 h-6" />,
      action: handleVideoOn,
      color: 'from-indigo-500 to-blue-500'
    },
    {
      title: 'Device Info',
      description: 'View detailed device information',
      icon: <FiInfo className="w-6 h-6" />,
      action: handleDeviceInfo,
      color: 'from-gray-500 to-slate-500'
    }
  ];

  return (
    <div className=" flex font-custom2 items-center justify-center  py-8 px-4 scroll">
      <div className="w-full max-w-4xl">
        {/* Header Card */}
        <div className="rounded-2xl border border-emerald-400/40 shadow-emerald-800 shadow-lg mb-8 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-emerald-900/20 rounded-2xl"
            style={{ backdropFilter: 'blur(12px)' }}
          ></div>
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 transition backdrop-blur-sm border border-emerald-400/30"
              >
                <FiArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleReconnect}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 transition backdrop-blur-sm border border-emerald-400/30"
              >
                <FiRefreshCw className="w-4 h-4" /> Reconnect
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#04806b] to-emerald-600 flex items-center justify-center text-2xl text-white shadow-lg">
                <FiSmartphone className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#029078] to-white text-transparent bg-clip-text"
                  style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
                  {deviceId}
                </h1>
                {loading ? (
                  <div className="text-gray-600">Loading device info...</div>
                ) : deviceInfo ? (
                  <div className="text-gray-400 space-y-1">
                    <p className="text-sm">{deviceInfo.manufacturer} {deviceInfo.model}</p>
                    <p className="text-sm">Android {deviceInfo.androidVersion}</p>
                    {audioStreaming && (
                      <span className="inline-block text-xs bg-emerald-500/80 text-white px-2 py-1 rounded-full border border-emerald-400/30 backdrop-blur-sm">
                        <FiVolume2 className="w-3 h-3 inline mr-1" /> Audio Streaming
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-600">Device information unavailable</div>
                )}
              </div>
            </div>
          </div>
        </div>
            <div className="mt-8 rounded-2xl border border-emerald-400/40 shadow-emerald-800 shadow-md relative overflow-hidden">
          <div
            className="absolute inset-0 bg-emerald-900/20 rounded-2xl"
            style={{ backdropFilter: 'blur(12px)' }}
          ></div>
          <div className="relative z-10 p-4">
            <h3 className="text-lg font-semibold text-[#FFF6F5] mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/commands/${deviceId}`)}
                className="px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-500/30 transition backdrop-blur-sm text-sm border border-emerald-400/30"
              >
                Terminal
              </button>
              <button
                onClick={() => navigate(`/explorer/${deviceId}`)}
                className="px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-500/30 transition backdrop-blur-sm text-sm border border-emerald-400/30"
              >
                Files
              </button>
              <button
                onClick={handleFileSend}
                className="px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-500/30 transition backdrop-blur-sm text-sm border border-emerald-400/30"
              >
                Send Files
              </button>
              <button
                onClick={handleAudioToggle}
                className={`px-4 py-2 rounded-lg transition backdrop-blur-sm text-sm border ${
                  audioStreaming 
                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-400/30' 
                    : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border-purple-400/30'
                }`}
              >
                {audioStreaming ? 'Stop Audio' : 'Start Audio'}
              </button>
              <button
                onClick={handleReconnect}
                className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition backdrop-blur-sm text-sm border border-emerald-400/30"
              >
                Reconnect
              </button>
              <button
                onClick={handleDeviceInfo}
                className="px-4 py-2 rounded-lg bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 transition backdrop-blur-sm text-sm border border-gray-400/30"
              >
                Device Info
              </button>
            </div>
          </div>
        </div>
        {/* Features Grid */}
        <div className="grid grid-cols-1 mt-8 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feature, index) => (
            <div
              key={index}
              className="rounded-2xl border border-emerald-400/40 shadow-emerald-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden group"
              onClick={feature.action}
            >
              <div
                className="absolute inset-0 bg-emerald-900/10 group-hover:bg-emerald-900/15 transition-all duration-300 rounded-2xl"
                style={{ backdropFilter: 'blur(12px)' }}
              ></div>
              <div className="relative z-10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#FFF6F5]">{feature.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-emerald-300 leading-relaxed">{feature.description}</p>
                <div className="mt-4 flex justify-end">
                  <span className="text-[#0d9780] text-sm font-medium group-hover:text-emerald-600 transition-colors">
                    Open →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Bar */}
        

        {/* FileSend Modal */}
        {showFileSend && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="relative rounded-2xl border border-emerald-400/40 shadow-emerald-800 shadow-lg overflow-hidden">
              <div
                className="absolute inset-0 bg-emerald-900/20 rounded-2xl"
                style={{ backdropFilter: 'blur(12px)' }}
              ></div>
              <button
                onClick={() => setShowFileSend(false)}
                className="absolute top-2 right-2 text-emerald-100 bg-emerald-400/20 rounded-full p-1 hover:bg-emerald-400/30 transition z-10 backdrop-blur-sm border border-emerald-400/30"
                title="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
              <div className="relative z-10">
                <FileSend
                  deviceId={deviceId}
                  onClose={() => setShowFileSend(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* DeviceInfo Modal */}
        {showDeviceInfo && (
          <div className="fixed inset-0 flex items-center justify-center  bg-black/40 z-50 p-4">
            <div className="relative w-full h-full overflow-auto">
              <DeviceInfo
                deviceId={deviceId}
                onClose={() => setShowDeviceInfo(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Device;