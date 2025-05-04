import { useState } from 'react';

function ConnectDevice() {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [message, setMessage] = useState('');

  const handleConnect = async (e) => {
    e.preventDefault();
    try {
      const result = await window.electronAPI.adbConnect(ip, port);
      setMessage(result);
    } catch (err) {
      setMessage(`Connection failed: ${err.message}`);
    }
  };

  return (
    <div className="p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Connect to Device</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="IP Address"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Port"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleConnect}
          className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Connect
        </button>
      </div>
      {message && <p className="mt-4 text-lg">{message}</p>}
    </div>
  );
}

export default ConnectDevice;