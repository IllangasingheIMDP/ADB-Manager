const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  adbDevices: () => ipcRenderer.invoke('adb-devices'),
  adbConnect: (ip, port) => ipcRenderer.invoke('adb-connect', ip, port),
  adbShell: (deviceId, command) => ipcRenderer.invoke('adb:shell', deviceId, command)
});