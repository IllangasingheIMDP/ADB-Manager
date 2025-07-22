const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  adbDevices: () => ipcRenderer.invoke('adb-devices'),
  adbTcpip: (deviceId, port) => ipcRenderer.invoke('tcpip', deviceId,port),
  adbConnect: (ip, port) => ipcRenderer.invoke('adb-connect', ip, port),
  adbShell: (deviceId, command) => ipcRenderer.invoke('adb:shell', deviceId, command),
  adbPush: (deviceId,filepath)=>ipcRenderer.invoke('adb-push',deviceId,filepath),
  adbReconnect:(deviceId)=>ipcRenderer.invoke('adb-reconnect',deviceId),
  adbPull:(deviceId,filepath)=>ipcRenderer.invoke('adb-pull',deviceId,filepath),
  startAudioStream: (deviceId) => ipcRenderer.invoke('start-audio-stream', deviceId),
  startVideoStream: (deviceId) => ipcRenderer.invoke('start-vidoe-stream', deviceId),
  stopAudioStream: (deviceId) => ipcRenderer.invoke('stop-audio-stream', deviceId),
  checkScrcpy: () => ipcRenderer.invoke('check-scrcpy'),
  chatbotAsk:(userMessage)=>ipcRenderer.invoke('chatbot:ask',userMessage),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog')

});