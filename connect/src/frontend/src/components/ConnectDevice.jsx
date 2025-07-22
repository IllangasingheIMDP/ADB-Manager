import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../hooks/useNotification';
import { getErrorMessage, getSuccessMessage } from '../utils/errorHandler';

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
  const [usbDevices, setUsbDevices] = useState([]);

  const { showSuccess, showError } = useNotification();

  const fetchUsbDevices = useCallback(async () => {
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
      showError(getErrorMessage(err.message));
    }
  }, [showError]);

  useEffect(() => {
    if (method === 'usb') {
      fetchUsbDevices();
    }
  }, [method, fetchUsbDevices]);

  const handleConnect = async (e) => {
    e.preventDefault();
    try {
      const result = await window.electronAPI.adbConnect(ip, port);
      showSuccess(getSuccessMessage('connect', result));
    } catch (err) {
      const errorMsg = getErrorMessage(err.message);
      showError(errorMsg);
    }
  };

  const delay = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleUsbDeviceClick = async (deviceId) => {
    showSuccess('Switching device to TCP/IP mode...');
    try {
      await window.electronAPI.adbTcpip(deviceId, 5555);
      showSuccess('Getting device IP address...');
      await delay(5000);
      
      // First try the specific wlan0 interface (for external WiFi networks)
      let ipAddrOutput = await window.electronAPI.adbShell(deviceId, 'ip -f inet addr show wlan0');
      let deviceIp = extractIpFromIpAddr(ipAddrOutput);
      
      // If no IP found on wlan0, try all interfaces (for hotspot scenarios)
      if (!deviceIp) {
        showSuccess('Checking all network interfaces...');
        ipAddrOutput = await window.electronAPI.adbShell(deviceId, 'ip addr');
        deviceIp = extractIpFromIpAddr(ipAddrOutput);
      }
      
      if (!deviceIp) {
        const errorMsg = 'Could not find a valid IP address for this device.';
        showError(errorMsg);
        return;
      }
      showSuccess(`Connecting to ${deviceIp}:5555 ...`);
      const connectResult = await window.electronAPI.adbConnect(deviceIp, '5555');
      showSuccess(getSuccessMessage('tcpip', connectResult));
    } catch (err) {
      const errorMsg = getErrorMessage(err.message);
      showError(errorMsg);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#029078] to-emerald-400 text-transparent bg-clip-text"
      style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}
      >Connect to device</h2>
      {!method && (
        <div className="space-y-4 flex flex-col items-center">
          <button
            className="relative w-1/2 p-4 rounded-2xl border border-emerald-400/40 text-emerald-100 font-medium hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-emerald-800/20 overflow-hidden"
            onClick={() => setMethod('wifi')}
          >
            {/* Glassmorphism background */}
            <div 
              className="absolute inset-0 bg-emerald-700/20 rounded-2xl"
              style={{ backdropFilter: 'blur(12px)' }}
            ></div>
            <span className="relative z-10">Connect via WiFi</span>
          </button>
          <button
            className="relative w-1/2 p-4 rounded-2xl border border-emerald-400/40 text-emerald-100 font-medium hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-emerald-800/20 overflow-hidden"
            onClick={() => setMethod('usb')}
          >
            {/* Glassmorphism background */}
            <div 
              className="absolute inset-0 bg-emerald-800/20 rounded-2xl"
              style={{ backdropFilter: 'blur(12px)' }}
            ></div>
            <span className="relative z-10">Connect via USB</span>
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
            className="w-full p-3 border border-emerald-400/40 rounded-2xl bg-emerald-900/10 text-emerald-100 placeholder-emerald-300/70 focus:ring-2 focus:ring-emerald-400/50 focus:outline-none transition-all duration-200 backdrop-blur-sm"
            required
          />
          <input
            type="text"
            placeholder="Port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full p-3 border border-emerald-400/40 rounded-2xl bg-emerald-900/10 text-emerald-100 placeholder-emerald-300/70 focus:ring-2 focus:ring-emerald-400/50 focus:outline-none transition-all duration-200 backdrop-blur-sm"
            required
          />
          <button
            type="submit"
            className="relative w-full p-4 rounded-2xl border border-emerald-400/40 text-emerald-100 font-medium hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-emerald-800/20 overflow-hidden"
          >
            {/* Glassmorphism background */}
            <div 
              className="absolute inset-0 bg-emerald-600/20 rounded-2xl"
              style={{ backdropFilter: 'blur(12px)' }}
            ></div>
            <span className="relative z-10">Connect</span>
          </button>
          <button
            type="button"
            className="relative w-full p-4 rounded-2xl border border-gray-400/40 text-gray-300 font-medium hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-gray-800/20 overflow-hidden"
            onClick={() => setMethod('')}
          >
            {/* Glassmorphism background */}
            <div 
              className="absolute inset-0 bg-gray-600/20 rounded-2xl"
              style={{ backdropFilter: 'blur(12px)' }}
            ></div>
            <span className="relative z-10">Back</span>
          </button>
        </form>
      )}

      {method === 'usb' && (
        <div className="mt-4">
          <div className="font-semibold mb-4 text-emerald-100 text-lg">USB connected devices</div>
          <div>
            {usbDevices.length === 0 && (
              <div className="text-emerald-300/70 text-center py-8 rounded-2xl border border-emerald-400/40 bg-emerald-900/10 backdrop-blur-sm">No USB devices found</div>
            )}
            {usbDevices.map(deviceId => (
              <button
                key={deviceId}
                className="relative block w-full text-left p-4 mb-2 border border-emerald-400/40 rounded-2xl hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-emerald-800/20 overflow-hidden"
                onClick={() => handleUsbDeviceClick(deviceId)}
              >
                {/* Glassmorphism background */}
                <div 
                  className="absolute inset-0 bg-emerald-900/10 rounded-2xl"
                  style={{ backdropFilter: 'blur(12px)' }}
                ></div>
                <span className="relative z-10 text-emerald-100 font-mono font-medium">{deviceId}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="relative w-full p-4 mt-4 rounded-2xl border border-gray-400/40 text-gray-300 font-medium hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-gray-800/20 overflow-hidden"
            onClick={() => setMethod('')}
          >
            {/* Glassmorphism background */}
            <div 
              className="absolute inset-0 bg-gray-600/20 rounded-2xl"
              style={{ backdropFilter: 'blur(12px)' }}
            ></div>
            <span className="relative z-10">Back</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ConnectDevice;