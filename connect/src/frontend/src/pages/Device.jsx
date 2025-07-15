import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileSend from './FileSend';
const Device = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [audioStreaming, setAudioStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDeviceInfo();
  }, [deviceId]);

  const fetchDeviceInfo = async () => {
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
      setMessage('Failed to get device information');
    } finally {
      setLoading(false);
    }
  };

  const handleAudioToggle = async () => {
    try {
      if (audioStreaming) {
        await window.electronAPI.stopAudioStream(deviceId);
        setAudioStreaming(false);
        setMessage('Audio stream stopped');
      } else {
        await window.electronAPI.startAudioStream(deviceId);
        setAudioStreaming(true);
        setMessage('Audio stream started');
      }
    } catch (err) {
      setMessage('Failed to toggle audio stream: ' + err);
    }
  };

  const handleReconnect = async () => {
    try {
      setMessage('Reconnecting...');
      await window.electronAPI.adbReconnect(deviceId);
      setMessage('Device reconnected successfully');
      fetchDeviceInfo();
    } catch (err) {
      setMessage('Failed to reconnect: ' + err);
    }
  };

  const featureCards = [
    {
      title: 'Shell Commands',
      description: 'Execute ADB shell commands on your device',
      icon: '⚡',
      action: () => navigate(`/commands/${deviceId}`),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'File Explorer',
      description: 'Browse device files and download to PC',
      icon: '📁',
      action: () => navigate(`/explorer/${deviceId}`),
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Audio Stream',
      description: audioStreaming ? 'Stop streaming device audio' : 'Stream device audio to PC',
      icon: audioStreaming ? '🔇' : '🎵',
      action: handleAudioToggle,
      color: audioStreaming ? 'from-red-500 to-pink-500' : 'from-purple-500 to-violet-500'
    },
    {
      title: 'Send Files',
      description: 'Transfer files from PC to device',
      icon: '📤',
      action: () => setMessage('File send feature - Coming soon!'),
      color: 'from-orange-500 to-yellow-500'
    },
    {
      title: 'Screen Mirror',
      description: 'Mirror device screen (requires scrcpy)',
      icon: '📱',
      action: () => setMessage('Screen mirror - Coming soon!'),
      color: 'from-indigo-500 to-blue-500'
    },
    {
      title: 'Device Info',
      description: 'View detailed device information',
      icon: 'ℹ️',
      action: () => setMessage('Detailed info - Coming soon!'),
      color: 'from-gray-500 to-slate-500'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/home_bg.jpg')] bg-cover bg-top bg-no-repeat py-8 px-4">
      <div className="w-full max-w-4xl">
        {/* Header Card */}
        <div className="rounded-2xl border border-white/20 shadow-emerald-800 shadow-lg mb-8 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-emerald-800/10"
            style={{ backdropFilter: 'blur(15px)' }}
          ></div>
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#04806b]/20 text-emerald-300 hover:bg-[#04806b]/30 transition backdrop-blur-sm"
              >
                <span>←</span> Back
              </button>
              <button
                onClick={handleReconnect}
                className="px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 transition backdrop-blur-sm"
              >
                Reconnect
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#04806b] to-emerald-600 flex items-center justify-center text-2xl text-white shadow-lg">
                📱
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
                      <span className="inline-block text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                        🎵 Audio Streaming
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-600">Device information unavailable</div>
                )}
              </div>
            </div>
            
            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                message.includes('Failed') || message.includes('Error') 
                  ? 'bg-red-100/80 text-red-700 border border-red-200' 
                  : 'bg-emerald-100/80 text-emerald-700 border border-emerald-200'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feature, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/20 shadow-emerald-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden group"
              onClick={feature.action}
            >
              <div
                className="absolute inset-0 bg-emerald-800/10 group-hover:bg-emerald-800/15 transition-all duration-300"
                style={{ backdropFilter: 'blur(10px)' }}
              ></div>
              <div className="relative z-10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl shadow-lg`}>
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
        <div className="mt-8 rounded-2xl border border-white/20 shadow-emerald-800 shadow-md relative overflow-hidden">
          <div
            className="absolute inset-0 bg-emerald-800/10"
            style={{ backdropFilter: 'blur(15px)' }}
          ></div>
          <div className="relative z-10 p-4">
            <h3 className="text-lg font-semibold text-[#FFF6F5] mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/commands/${deviceId}`)}
                className="px-4 py-2 rounded-lg bg-[#04806b]/20 text-emerald-300 hover:bg-emerald-500/30 transition backdrop-blur-sm text-sm"
              >
                Terminal
              </button>
              <button
                onClick={() => navigate(`/explorer/${deviceId}`)}
                className="px-4 py-2 rounded-lg bg-[#04806b]/20 text-emerald-300 hover:bg-emerald-500/30 transition backdrop-blur-sm text-sm"
              >
                Files
              </button>
              <button
                onClick={handleAudioToggle}
                className={`px-4 py-2 rounded-lg transition backdrop-blur-sm text-sm ${
                  audioStreaming 
                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                    : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                }`}
              >
                {audioStreaming ? 'Stop Audio' : 'Start Audio'}
              </button>
              <button
                onClick={handleReconnect}
                className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition backdrop-blur-sm text-sm"
              >
                Reconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Device;