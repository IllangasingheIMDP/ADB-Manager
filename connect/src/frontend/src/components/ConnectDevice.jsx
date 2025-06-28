import { useState, useEffect } from 'react';

function extractIpFromIpAddr(output) {
  // Find all 'inet <ip>' lines, filter out 127.0.0.1, and return the first local IP
  const matches = output.match(/inet (\d+\.\d+\.\d+\.\d+)/g) || [];
  const ips = matches
    .map(m => m.replace('inet ', ''))
    .filter(ip => !ip.startsWith('127.') && (ip.startsWith('192.') || ip.startsWith('10.') || ip.startsWith('172.')));
  return ips[0] || '';
}

function ConnectDevice() {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('5555');
  const [message, setMessage] = useState('');
  const [usbDevices, setUsbDevices] = useState([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const result = await window.electronAPI.adbDevices();
        const devicesList = result
          .split('\n')
          .slice(1)
          .filter(line => line.trim() !== '' && line.includes('device'))
          .map(line => line.split('\t')[0]);
        setUsbDevices(devicesList);
      } catch (err) {
        console.error('Error fetching USB devices:', err);
        setUsbDevices([]);
      }
    };
    fetchDevices();
  }, []);

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
      setMessage('Getting device IP in TCP/IP mode...');
      await delay(5000); // Wait for the device to switch to TCP/IP mode
      const ipAddrOutput = await window.electronAPI.adbShell(deviceId, 'ip addr');
      console.log('IP Address Output:', ipAddrOutput);
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
        <div className='w-full h-fit'>
          <div className="font-semibold mb-2">USB connected devices</div>
          <div>
            {usbDevices.length === 0 && <div className="text-gray-500">No USB devices found</div>}
            {usbDevices.map(deviceId => (
              <button
                key={deviceId}
                className="block w-full text-left p-2 mb-1 bg-white border rounded hover:bg-blue-100"
                onClick={() => handleUsbDeviceClick(deviceId)}
              >
                {deviceId}
              </button>
            ))}
          </div>
        </div>
      </div>
      {message && <p className="mt-4 text-lg">{message}</p>}
    </div>
  );
}

export default ConnectDevice;