import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileSend from './FileSend'; // Assuming FileSend is in the same directory
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
    const interval = setInterval(fetchDevices, 10000); // fetch every 10 seconds
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const handleMenuClick = (deviceId) => {
    setActiveMenu(activeMenu === deviceId ? null : deviceId);
  };

  const handleCommandsClick = (deviceId) => {
    navigate(`/commands/${deviceId}`);
  };

  return (
    <div className="p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Connected Devices</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul className="list-none pl-5">
        {devices.map((device, index) => (
          <li key={index} className="text-lg flex items-center justify-between mb-2">
            <span>{device}</span>
            <div className="relative">
              <button
                onClick={() => handleMenuClick(device)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <span className="dots">⋮</span>
              </button>
              {activeMenu === device && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={() => handleCommandsClick(device)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Execute Shell Commands
                    </button>
                     <button
                      onClick={() => {
                        setFileSendDevice(device);
                        setActiveMenu(null);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Send files
                    </button>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
        {}


      <button
        onClick={fetchDevices}
        className="mt-4 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh Devices
      </button>
      {fileSendDevice && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-20">
          <div className="bg-white rounded shadow-lg">
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