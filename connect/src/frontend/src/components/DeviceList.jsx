import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileSend from './FileSend';

function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [fileSendDevice, setFileSendDevice] = useState(null);

  const navigate = useNavigate();

  const fetchDevices = async () => {
    try {
      const result = await window.electronAPI.adbDevices();
      const devicesList = result
        .split('\n')
        .slice(1)
        .filter(line => line.trim() !== '')
        .map(line => line.split('\t')[0]);
      setDevices(devicesList);
      setError('');
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Failed to fetch devices');
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMenuClick = (deviceId) => {
    setActiveMenu(activeMenu === deviceId ? null : deviceId);
  };

  const handleReconnectClick = async (deviceId) => {
    try{

      await window.electronAPI.adbReconnect(deviceId);
      setActiveMenu(null);
      fetchDevices();
    }catch (err) {
      console.error('Error reconnecting device:', err);
      setError('Failed to reconnect device');
    }

  }

  const handleCommandsClick = (deviceId) => {
    navigate(`/commands/${deviceId}`);
  };
  const handleExplorerClick = (deviceId) => {
    navigate(`/explorer/${deviceId}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#029078] via-white text-transparent bg-clip-text"
      style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}
      >
        Connected Devices
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div>
        {devices.length === 0 && (
          <div className="text-[#04806b] mb-4">No devices connected</div>
        )}
        <ul className="space-y-2">
          {devices.map((device, index) => (
            <li
              key={index}
              className="flex items-center justify-between bg-white/70 border rounded p-2 hover:bg-emerald-100 transition-transform duration-200 transform "
            >
              <span className="font-mono text-gray-800">{device}</span>
              <div className="relative">
                <button
                  onClick={() => handleMenuClick(device)}
                  className="p-1 hover:bg-emerald-100 rounded transition"
                  title="Show actions"
                >
                  <span className="dots text-xl">⋮</span>
                </button>
                {activeMenu === device && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-emerald-200/90 ring-1 ring-black ring-opacity-5 z-50 overflow-y-auto">
                    <div className="py-1">
                      <button
                        onClick={() => handleCommandsClick(device)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-100 w-full text-left transition"
                      >
                        Execute Shell Commands
                      </button>
                      <button
                        onClick={() => {
                          setFileSendDevice(device);
                          setActiveMenu(null);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-100 w-full text-left transition"
                      >
                        Send files
                      </button>
                      <button
                        onClick={() => handleReconnectClick(device)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-100 w-full text-left transition"
                      >
                        Reconnect
                      </button>
                      <button
                        onClick={() => handleExplorerClick(device)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-100 w-full text-left transition"
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