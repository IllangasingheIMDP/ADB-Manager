// Error mappings from CSV file
const errorMappings = {
  'device not found': "No device detected. Please ensure your device is connected via USB, drivers are installed, and USB debugging is enabled.",
  'no devices/emulators found': "No device detected. Please ensure your device is connected via USB, drivers are installed, and USB debugging is enabled.",
  'unauthorized': "Device not authorized. Please check your device and authorize the computer when prompted, then reconnect.",
  'offline': "Device is offline. Reconnect the device, check USB cable, and restart ADB server.",
  'adb not recognized': "ADB not recognized. Please ensure platform-tools are installed and the PATH environment variable is set correctly.",
  'failed to install driver': "Driver installation failed. Please update or reinstall your device's drivers and reconnect.",
  'unknown command': "ADB command not recognized. Check the command syntax and ensure ADB is installed properly.",
  'command not found': "ADB command not recognized. Check the command syntax and ensure ADB is installed properly.",
  'failed to connect': "Could not connect to device over WiFi. Ensure PC and device are on the same WiFi network, WiFi debugging is enabled, and the correct IP and port are entered.",
  'connection refused': "Connection refused. The device denied the connection—try restarting the device and ADB, and verify network settings.",
  'mDNS discovery failed': "Device discovery failed. Your network or device might not support mDNS; try manually connecting with device IP and port.",
  'daemon not running': "ADB daemon was not running and is now starting. If connection issues persist, restart your computer and devices.",
  'adb server is out of date': "ADB server is outdated. Please update platform-tools and restart ADB.",
  'permission denied': "Permission denied. Run your command prompt or terminal as administrator and check device USB debugging permissions.",
  'usb port issues': "ADB cannot detect the device on this USB port. Try another USB port or cable, and avoid using USB hubs.",
  'socket read failed': "Network timeout. Ensure both devices have stable network connections and firewalls are not blocking ADB ports.",
  'connection timed out': "Network timeout. Ensure both devices have stable network connections and firewalls are not blocking ADB ports.",
  'no such file or directory': "The specified file or directory was not found on the device.",
  'access denied': "Access denied. The operation requires elevated permissions or the file is protected.",
  'network unreachable': "Network connection failed. Check your WiFi connection and network settings.",
  'host unreachable': "Cannot reach the device. Verify the IP address and ensure the device is on the same network."
};

export const getErrorMessage = (errorText) => {
  if (!errorText) return "An unknown error occurred.";
  
  const lowerError = errorText.toLowerCase();
  
  // Check for exact matches first
  for (const [key, message] of Object.entries(errorMappings)) {
    if (lowerError.includes(key.toLowerCase())) {
      return message;
    }
  }
  
  // Handle specific IP connection errors
  if (lowerError.match(/failed to connect to.*:\d+/)) {
    return "Could not connect to device over WiFi. Ensure PC and device are on the same WiFi network, WiFi debugging is enabled, and the correct IP and port are entered.";
  }
  
  // Handle connection refused with port numbers
  if (lowerError.includes('connection refused') && lowerError.includes('10061')) {
    return "Connection refused. The device denied the connection—try restarting the device and ADB, and verify network settings.";
  }
  
  // Handle offline status after WiFi connect
  if (lowerError.includes('offline') && (lowerError.includes('wifi') || lowerError.includes('tcp'))) {
    return "Device shows offline after WiFi connection attempt. Try reconnecting, restarting ADB, or toggling WiFi and developer options.";
  }
  
  // Return the original error if no match found, but clean it up
  return `Error: ${errorText}`;
};

export const getSuccessMessage = (operation, details = '') => {
  const messages = {
    connect: `Device connected successfully! ${details}`,
    disconnect: `Device disconnected successfully.`,
    command: `Command executed successfully.`,
    file_transfer: `File transfer completed successfully.`,
    audio_start: `Audio streaming started successfully.`,
    audio_stop: `Audio streaming stopped.`,
    reconnect: `Device reconnected successfully.`,
    tcpip: `Device switched to TCP/IP mode successfully.`,
    discovery: `Device discovered and connected.`,
    download: `File downloaded successfully.`,
    upload: `File uploaded successfully.`
  };
  
  return messages[operation] || `Operation completed successfully. ${details}`;
};
