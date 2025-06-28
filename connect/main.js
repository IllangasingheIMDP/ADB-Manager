const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
<<<<<<< Updated upstream
const isDev = require('electron-is-dev');
=======
const { stdout, stderr } = require('process');
const { rejects } = require('assert');
>>>>>>> Stashed changes

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  const isDev = !app.isPackaged;

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, 'src/frontend/dist/index.html')}`
  );
}

ipcMain.handle('adb-devices', async () => {
  return new Promise((resolve, reject) => {
    exec('adb devices', (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
});

ipcMain.handle('tcpip',async(event,id,port)=>{
  return new Promise((resolve,reject)=>{
    exec(`adb -s ${id} tcpip ${port}`,(error,stdout,stderr)=>{
      if(error){
        reject(error);
      }else{
        resolve(stdout)
      }
    })
  })

})

ipcMain.handle('adb-connect', async (event, ip, port) => {
  return new Promise((resolve, reject) => {
    exec(`adb connect ${ip}:${port}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
});

require('./src/backend/server');

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});