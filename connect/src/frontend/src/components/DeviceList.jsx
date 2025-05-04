import { useState, useEffect } from 'react';

function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState('');

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
      setError('Failed to fetch devices');
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Connected Devices</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul className="list-disc pl-5">
        {devices.map((device, index) => (
          <li key={index} className="text-lg">{device}</li>
        ))}
      </ul>
      <button
        onClick={fetchDevices}
        className="mt-4 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh Devices
      </button>
    </div>
  );
}

export default DeviceList;