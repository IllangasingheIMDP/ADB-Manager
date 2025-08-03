const { contextBridge, ipcRenderer,webUtils } = require('electron');

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
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  isFile: (path) => ipcRenderer.invoke('is-file', path),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  installClient:(deviceId)=>ipcRenderer.invoke('install-client-apk',deviceId),
  saveTempImage: (base64Data) => ipcRenderer.invoke('save-temp-image', base64Data)

});