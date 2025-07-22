import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiCpu, 
  FiHardDrive, 
  FiZap, 
  FiMonitor, 
  FiDatabase,
  FiRefreshCw,
  FiInfo,
  FiX,
  FiActivity
} from 'react-icons/fi';
import { useNotification } from '../hooks/useNotification';
import { getErrorMessage } from '../utils/errorHandler';

const DeviceInfo = ({ deviceId, onClose }) => {
  const [deviceInfo, setDeviceInfo] = useState({
    cpu: null,
    gpu: null,
    ram: null,
    storage: null,
    battery: null,
    display: null,
    system: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showError } = useNotification();

  const fetchDeviceInfo = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch CPU information
      const cpuInfo = await window.electronAPI.adbShell(deviceId, 'cat /proc/cpuinfo');
      
      // Fetch GPU information
      const gpuInfo = await window.electronAPI.adbShell(deviceId, `getprop ro.hardware.egl && adb -s ${deviceId} shell getprop ro.hardware.vulkan`);
      
      // Fetch RAM information
      const ramInfo = await window.electronAPI.adbShell(deviceId, 'cat /proc/meminfo');
      
      // Fetch Storage information
      const storageInfo = await window.electronAPI.adbShell(deviceId, `df /data && adb -s ${deviceId} shell df /system`);

      // Fetch Battery information
      const batteryInfo = await window.electronAPI.adbShell(deviceId, 'dumpsys battery');
      
      // Fetch Display information
      const displayInfo = await window.electronAPI.adbShell(deviceId, `wm size && adb -s ${deviceId} shell wm density`);

      // Fetch System information
      const systemInfo = await window.electronAPI.adbShell(deviceId, `getprop ro.build.version.release && adb -s ${deviceId} shell getprop ro.product.model && adb -s ${deviceId} shell getprop ro.product.manufacturer && adb -s ${deviceId} shell getprop ro.build.version.sdk && adb -s ${deviceId} shell getprop ro.product.cpu.abi && adb -s ${deviceId} shell  getprop ro.build.id`);

      setDeviceInfo({
        cpu: parseCpuInfo(cpuInfo),
        gpu: parseGpuInfo(gpuInfo),
        ram: parseRamInfo(ramInfo),
        storage: parseStorageInfo(storageInfo),
        battery: parseBatteryInfo(batteryInfo),
        display: parseDisplayInfo(displayInfo),
        system: parseSystemInfo(systemInfo)
      });
    } catch (err) {
      console.error('Error fetching device info:', err);
      showError(getErrorMessage(err.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [deviceId, showError]);

  const parseCpuInfo = (cpuInfo) => {
    const lines = cpuInfo.split('\n').filter(line => line.trim());
    const processor = lines.find(line => 
      line.toLowerCase().includes('processor') || 
      line.toLowerCase().includes('model name') || 
      line.toLowerCase().includes('hardware')
    );
    const architecture = lines.find(line => line.toLowerCase().includes('cpu architecture'));
    
    let cpuName = 'Unknown';
    if (processor) {
      cpuName = processor.split(':')[1]?.trim() || 'Unknown';
    }
    
    // Count processor entries to get core count
    const processorCount = lines.filter(line => line.toLowerCase().startsWith('processor')).length;
    const coreInfo = processorCount > 0 ? `${processorCount} cores` : 'Unknown';
    
    return {
      name: cpuName,
      cores: coreInfo,
      architecture: architecture ? architecture.split(':')[1]?.trim() : 'Unknown'
    };
  };

  const parseGpuInfo = (gpuInfo) => {
    const lines = gpuInfo.split('\n').filter(line => line.trim());
    return {
      egl: lines[0] || 'Unknown',
      vulkan: lines[1] || 'Not supported'
    };
  };

  const parseRamInfo = (ramInfo) => {
    const lines = ramInfo.split('\n');
    const total = lines.find(line => line.toLowerCase().includes('memtotal'));
    const available = lines.find(line => line.toLowerCase().includes('memavailable'));
    
    const totalMB = total ? Math.round(parseInt(total.match(/\d+/)[0]) / 1024) : 0;
    const availableMB = available ? Math.round(parseInt(available.match(/\d+/)[0]) / 1024) : 0;
    const usedMB = totalMB - availableMB;
    
    return {
      total: `${(totalMB / 1024).toFixed(1)} GB`,
      used: `${(usedMB / 1024).toFixed(1)} GB`,
      available: `${(availableMB / 1024).toFixed(1)} GB`,
      usagePercent: totalMB > 0 ? Math.round((usedMB / totalMB) * 100) : 0
    };
  };

  const parseStorageInfo = (storageInfo) => {
    const lines = storageInfo.split('\n').filter(line => line.trim());
    
    // Find data and system partition lines
    const dataLineIndex = lines.findIndex(line => line.includes('/data'));
    const systemLineIndex = lines.findIndex(line => line.includes('/system'));
    
    const parseStorageLine = (lineIndex) => {
      if (lineIndex === -1 || !lines[lineIndex]) return { total: 'Unknown', used: 'Unknown', available: 'Unknown' };
      const line = lines[lineIndex];
      const parts = line.split(/\s+/);
      
      // Convert to human readable format
      const formatSize = (sizeStr) => {
        if (!sizeStr || sizeStr === 'Unknown') return 'Unknown';
        const size = parseInt(sizeStr);
        if (isNaN(size)) return sizeStr;
        
        if (size > 1024 * 1024) {
          return `${(size / (1024 * 1024)).toFixed(1)} GB`;
        } else if (size > 1024) {
          return `${(size / 1024).toFixed(1)} MB`;
        } else {
          return `${size} KB`;
        }
      };
      
      return {
        total: formatSize(parts[1]),
        used: formatSize(parts[2]),
        available: formatSize(parts[3])
      };
    };
    
    return {
      data: parseStorageLine(dataLineIndex),
      system: parseStorageLine(systemLineIndex)
    };
  };

  const parseBatteryInfo = (batteryInfo) => {
    const lines = batteryInfo.split('\n');
    const level = lines.find(line => line.toLowerCase().includes('level:'));
    const temperature = lines.find(line => line.toLowerCase().includes('temperature:'));
    const voltage = lines.find(line => line.toLowerCase().includes('voltage:'));
    const status = lines.find(line => line.toLowerCase().includes('status:'));
    const health = lines.find(line => line.toLowerCase().includes('health:'));
    
    return {
      level: level ? level.split(':')[1]?.trim() + '%' : 'Unknown',
      temperature: temperature ? (parseInt(temperature.split(':')[1]?.trim()) / 10) + '°C' : 'Unknown',
      voltage: voltage ? (parseInt(voltage.split(':')[1]?.trim()) / 1000).toFixed(2) + 'V' : 'Unknown',
      status: status ? status.split(':')[1]?.trim() : 'Unknown',
      health: health ? health.split(':')[1]?.trim() : 'Unknown'
    };
  };

  const parseDisplayInfo = (displayInfo) => {
    const lines = displayInfo.split('\n').filter(line => line.trim());
    const sizeLine = lines.find(line => line.includes('Physical size:') || line.includes('size:'));
    const densityLine = lines.find(line => line.includes('density:'));
    
    return {
      resolution: sizeLine ? sizeLine.split(':')[1]?.trim() || 'Unknown' : 'Unknown',
      density: densityLine ? densityLine.split(':')[1]?.trim() || 'Unknown' : 'Unknown'
    };
  };

  const parseSystemInfo = (systemInfo) => {
    const lines = systemInfo.split('\n').filter(line => line.trim());
    return {
      androidVersion: lines[0] || 'Unknown',
      model: lines[1] || 'Unknown',
      manufacturer: lines[2] || 'Unknown',
      apiLevel: lines[3] || 'Unknown',
      architecture: lines[4] || 'Unknown',
      buildId: lines[5] || 'Unknown'
    };
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDeviceInfo();
  };

  useEffect(() => {
    fetchDeviceInfo();
  }, [fetchDeviceInfo]);

  const InfoCard = ({ title, icon, children, gradient = "from-emerald-500 to-teal-500" }) => (
    <div className="rounded-xl border border-emerald-400/40 shadow-emerald-800 shadow-md relative overflow-hidden">
      <div
        className="absolute inset-0 bg-emerald-900/10 rounded-xl"
        style={{ backdropFilter: 'blur(12px)' }}
      ></div>
      <div className="relative z-10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm shadow-lg`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-[#FFF6F5]">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );

  const InfoRow = ({ label, value, highlight = false }) => (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-emerald-300">{label}:</span>
      <span className={`text-sm font-medium ${highlight ? 'text-emerald-400' : 'text-[#FFF6F5]'}`}>
        {value}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="rounded-2xl border border-emerald-400/40 shadow-emerald-800 shadow-lg relative overflow-hidden">
          <div
            className="absolute inset-0 bg-emerald-900/20 rounded-2xl"
            style={{ backdropFilter: 'blur(12px)' }}
          ></div>
          <div className="relative z-10 p-8">
            <div className="flex items-center justify-center space-x-2">
              <FiRefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
              <span className="text-emerald-300 text-lg">Loading device information...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="rounded-2xl border border-emerald-400/40 shadow-emerald-800 shadow-lg relative overflow-hidden">
        <div
          className="absolute inset-0 bg-emerald-900/20 rounded-2xl"
          style={{ backdropFilter: 'blur(12px)' }}
        ></div>
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                <FiInfo className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-white text-transparent bg-clip-text">
                  Device Information
                </h2>
                <p className="text-emerald-300 text-sm">{deviceId}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 transition backdrop-blur-sm border border-emerald-400/30"
              >
                <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 transition backdrop-blur-sm border border-red-400/30"
                >
                  <FiX className="w-4 h-4" />
                  Close
                </button>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* System Info */}
            <InfoCard title="System" icon={<FiMonitor />} gradient="from-blue-500 to-cyan-500">
              <div className="space-y-2">
                <InfoRow label="Manufacturer" value={deviceInfo.system?.manufacturer} />
                <InfoRow label="Model" value={deviceInfo.system?.model} />
                <InfoRow label="Android" value={deviceInfo.system?.androidVersion} highlight />
                <InfoRow label="API Level" value={deviceInfo.system?.apiLevel} />
                <InfoRow label="Architecture" value={deviceInfo.system?.architecture} />
                <InfoRow label="Build ID" value={deviceInfo.system?.buildId} />
              </div>
            </InfoCard>

            {/* CPU Info */}
            <InfoCard title="Processor" icon={<FiCpu />} gradient="from-purple-500 to-violet-500">
              <div className="space-y-2">
                <InfoRow label="CPU" value={deviceInfo.cpu?.name} highlight />
                <InfoRow label="Cores" value={deviceInfo.cpu?.cores} />
                <InfoRow label="Architecture" value={deviceInfo.cpu?.architecture} />
              </div>
            </InfoCard>

            {/* GPU Info */}
            <InfoCard title="Graphics" icon={<FiActivity />} gradient="from-orange-500 to-red-500">
              <div className="space-y-2">
                <InfoRow label="EGL" value={deviceInfo.gpu?.egl} highlight />
                <InfoRow label="Vulkan" value={deviceInfo.gpu?.vulkan} />
              </div>
            </InfoCard>

            {/* RAM Info */}
            <InfoCard title="Memory" icon={<FiDatabase />} gradient="from-green-500 to-emerald-500">
              <div className="space-y-2">
                <InfoRow label="Total RAM" value={deviceInfo.ram?.total} highlight />
                <InfoRow label="Used" value={deviceInfo.ram?.used} />
                <InfoRow label="Available" value={deviceInfo.ram?.available} />
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-emerald-300 mb-1">
                    <span>Usage</span>
                    <span>{deviceInfo.ram?.usagePercent}%</span>
                  </div>
                  <div className="w-full bg-emerald-900/30 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${deviceInfo.ram?.usagePercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </InfoCard>

            {/* Storage Info */}
            <InfoCard title="Storage" icon={<FiHardDrive />} gradient="from-indigo-500 to-blue-500">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-emerald-400 mb-1">Data Partition</h4>
                  <InfoRow label="Total" value={deviceInfo.storage?.data?.total} />
                  <InfoRow label="Used" value={deviceInfo.storage?.data?.used} />
                  <InfoRow label="Available" value={deviceInfo.storage?.data?.available} highlight />
                </div>
                
              </div>
            </InfoCard>

            {/* Battery Info */}
            <InfoCard title="Battery" icon={<FiZap />} gradient="from-yellow-500 to-orange-500">
              <div className="space-y-2">
                <InfoRow label="Level" value={deviceInfo.battery?.level} highlight />
                <InfoRow label="Status" value={deviceInfo.battery?.status} />
                <InfoRow label="Health" value={deviceInfo.battery?.health} />
                <InfoRow label="Temperature" value={deviceInfo.battery?.temperature} />
                <InfoRow label="Voltage" value={deviceInfo.battery?.voltage} />
              </div>
            </InfoCard>

            {/* Display Info */}
            <InfoCard title="Display" icon={<FiMonitor />} gradient="from-pink-500 to-rose-500">
              <div className="space-y-2">
                <InfoRow label="Resolution" value={deviceInfo.display?.resolution} highlight />
                <InfoRow label="Density" value={deviceInfo.display?.density} />
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceInfo;
