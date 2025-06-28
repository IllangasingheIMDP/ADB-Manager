import { useState, useEffect } from 'react';

function extractIpFromIpAddr(output) {
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
      setMessage('Getting device IP in TCP/IP mode...');
      await delay(5000);
      const ipAddrOutput = await window.electronAPI.adbShell(deviceId, 'ip addr');
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
      {!method && (
        <div className="space-y-4">
          <button
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setMethod('wifi')}
          >
            Connect via WiFi
          </button>
          <button
            className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
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
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Connect
          </button>
          <button
            type="button"
            className="w-full p-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={() => setMethod('')}
          >
            Back
          </button>
        </form>
      )}

      {method === 'usb' && (
        <div className="mt-4">
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
          <button
            type="button"
            className="w-full p-2 mt-4 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={() => setMethod('')}
          >
            Back
          </button>
        </div>
      )}

      {message && <p className="mt-4 text-lg">{message}</p>}
    </div>
  );
}

export default ConnectDevice;