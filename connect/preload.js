const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  adbDevices: () => ipcRenderer.invoke('adb-devices'),
  adbTcpip: (deviceId, port) => ipcRenderer.invoke('tcpip', deviceId,port),
  adbConnect: (ip, port) => ipcRenderer.invoke('adb-connect', ip, port),
  adbShell: (deviceId, command) => ipcRenderer.invoke('adb:shell', deviceId, command),
  adbPush: (deviceId,filepath)=>ipcRenderer.invoke('adb-push',deviceId,filepath)
});