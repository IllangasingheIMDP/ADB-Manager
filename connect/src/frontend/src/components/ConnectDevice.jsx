import { useState, useEffect } from 'react';

function extractIpFromIpAddr(output) {
  // Handle new format: "inet 10.10.28.76/19 brd ..."
  const match = output.match(/inet\s+(\d+\.\d+\.\d+\.\d+)\/\d+/);
  if (match) {
    const ip = match[1];
    // Filter out localhost and only accept private network ranges
    if (!ip.startsWith('127.') && (ip.startsWith('192.') || ip.startsWith('10.') || ip.startsWith('172.'))) {
      return ip;
    }
  }
  
  // Fallback to old format for compatibility
  const matches = output.match(/inet (\d+\.\d+\.\d+\.\d+)/g) || [];
  const ips = matches
    .map(m => m.replace('inet ', ''))
    .filter(ip => !ip.startsWith('127.') && (ip.startsWith('192.') || ip.startsWith('10.') || ip.startsWith('172.')));
  return ips[0] || '';
}

function ConnectDevice() {
  const [method, setMethod] = useState('');
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('5555');
  const [message, setMessage] = useState('');
  const [usbDevices, setUsbDevices] = useState([]);

  useEffect(() => {
    if (method === 'usb') {
      const fetchDevices = async () => {
        try {
          const result = await window.electronAPI.adbDevices();
          const devicesList = result
            .split('\n')
            .slice(1)
            .filter(line => {
              const id = line.split('\t')[0];
              return (
                line.trim() !== '' &&
                line.includes('device') &&
                !/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(id)
              );
            })
            .map(line => line.split('\t')[0]);
          setUsbDevices(devicesList);
        } catch (err) {
          setUsbDevices([]);
        }
      };
      fetchDevices();
    }
  }, [method]);

  const handleConnect = async (e) => {
    e.preventDefault();
    try {
      const result = await window.electronAPI.adbConnect(ip, port);
      setMessage(result);
    } catch (err) {
      setMessage(`Connection failed: ${err.message}`);
    }
  };

  const delay = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleUsbDeviceClick = async (deviceId) => {
    setMessage('Switching device to TCP/IP mode...');
    try {
      await window.electronAPI.adbTcpip(deviceId, 5555);
      setMessage('Getting device IP from WiFi interface...');
      await delay(5000);
      const ipAddrOutput = await window.electronAPI.adbShell(deviceId, 'ip -f inet addr show wlan0');
      const deviceIp = extractIpFromIpAddr(ipAddrOutput);
      if (!deviceIp) {
        setMessage('Could not find a valid IP address for this device.');
        return;
      }
      setMessage(`Connecting to ${deviceIp}:5555 ...`);
      const connectResult = await window.electronAPI.adbConnect(deviceIp, '5555');
      setMessage(connectResult);
    } catch (err) {
      setMessage(`Failed: ${err.message}`);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#029078] via-white text-transparent bg-clip-text"
      style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}
      >Connect to device</h2>
      {!method && (
        <div className="space-y-4 flex flex-col items-center">
          <button
            className="w-1/2 p-2 bg-emerald-700/70  text-white rounded hover:bg-teal-700 hover:scale-105 transition-transform duration-200"
            onClick={() => setMethod('wifi')}
          >
            Connect via WiFi
          </button>
          <button
            className="w-1/2 p-2 bg-emerald-800/70 text-white rounded   hover:bg-teal-700 hover:scale-105 transition-transform duration-200"
            onClick={() => setMethod('usb')}
          >
            Connect via USB
          </button>
        </div>
      )}

      {method === 'wifi' && (
        <form onSubmit={handleConnect} className="space-y-4 mt-4">
          <input
            type="text"
            placeholder="IP Address"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="w-full p-2 border bg-emerald-100/50 border-[#04806b] rounded focus:ring-2 focus:ring-[#04806b] focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full p-2 border bg-emerald-100/50 border-[#04806b] rounded focus:ring-2 focus:ring-[#04806b] focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full p-2 bg-[#04806b] text-white rounded hover:bg-emerald-700 transition"
          >
            Connect
          </button>
          <button
            type="button"
            className="w-full p-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            onClick={() => setMethod('')}
          >
            Back
          </button>
        </form>
      )}

      {method === 'usb' && (
        <div className="mt-4">
          <div className="font-semibold mb-2 text-[#04806b]">USB connected devices</div>
          <div>
            {usbDevices.length === 0 && (
              <div className="text-gray-500 text-center">No USB devices found</div>
            )}
            {usbDevices.map(deviceId => (
              <button
                key={deviceId}
                className="block w-full text-left p-2 mb-1 bg-white border border-[#04806b] rounded hover:bg-emerald-50 hover:border-emerald-700 transition"
                onClick={() => handleUsbDeviceClick(deviceId)}
              >
                <span className="text-[#04806b]">{deviceId}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="w-full p-2 mt-4 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            onClick={() => setMethod('')}
          >
            Back
          </button>
        </div>
      )}

      {message && <p className="mt-4 text-lg text-emerald-300">{message}</p>}
    </div>
  );
}

export default ConnectDevice;