const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const os = require('os');

const downloadsPath = path.join(os.homedir(), 'Downloads');

// Store active scrcpy processes for each device
const activeAudioStreams = new Map();
const activeVideoStreams=new Map();

// Get the correct scrcpy path based on platform and whether app is packaged
function getScrcpyPath() {
  const platform = process.platform;
  let platformDir;
  
  if (platform === 'win32') {
    platformDir = 'win';
  } else if (platform === 'darwin') {
    platformDir = 'mac';
  } else {
    platformDir = 'linux';
  }
  
  const isDev = !app.isPackaged;
  
  if (isDev) {
    // Development mode
    return path.join(__dirname, 'bin', platformDir, platform === 'win32' ? 'scrcpy.exe' : 'scrcpy');
  } else {
    // Production mode
    return path.join(process.resourcesPath, 'bin', platformDir, platform === 'win32' ? 'scrcpy.exe' : 'scrcpy');
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      experimentalFeatures: true,
    },
    backgroundColor: '#00000000',
    transparent: true,
  });

  const isDev = !app.isPackaged;

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, 'src/frontend/dist/index.html')}`
  );
}

ipcMain.handle('start vidoe-stream',async(event,deviceId)=>{
  return new Promise((resolve,reject)=>{
   try {
       if (activeVideoStreams.has(deviceId)){
        resolve('Video stream already active for this device')
       }
       const scrcpyPath = getScrcpyPath();
       const fs =require('fs')
       if (!fs.existsSync(scrcpyPath)){
        reject('Scrcpy binary not found. Please check installation.');
        return;
       }
       const scrcpyProcess=spawn(scrcpyPath,[
        '--serial', deviceId
        
       ],{
        cwd:path.dirname(scrcpyPath)
       });
       activeVideoStreams.set(deviceId,scrcpyProcess);
       scrcpyProcess.stdout.on('data',(data)=>{
        console.log(`Video stream stdout:${data}`)
       })
       scrcpyProcess.stderr.on('data', (data) => {
        console.log(`Video stream stderr: ${data}`);
      });

      scrcpyProcess.on('close', (code) => {
        console.log(`Video stream process exited with code ${code}`);
        activeVideoStreams.delete(deviceId);
      });
       // Give it a moment to start
      setTimeout(() => {
        if (activeAudioStreams.has(deviceId)) {
          resolve('Audio stream started successfully');
        } else {
          reject('Failed to start audio stream');
        }
      }, 2000);

   } catch (error) {
    reject(`Error starting Video stream: ${error.message}`);
   }
  })

})



// Audio streaming handlers
ipcMain.handle('start-audio-stream', async (event, deviceId) => {
  return new Promise((resolve, reject) => {
    try {
      // Check if already streaming
      if (activeAudioStreams.has(deviceId)) {
        resolve('Audio stream already active for this device');
        return;
      }

      const scrcpyPath = getScrcpyPath();
      
      // Check if scrcpy exists
      const fs = require('fs');
      if (!fs.existsSync(scrcpyPath)) {
        reject('Scrcpy binary not found. Please check installation.');
        return;
      }

      // Start scrcpy with audio only using the bundled binary
      // Use 'playback' instead of 'internal' for device audio output
      const scrcpyProcess = spawn(scrcpyPath, [
        '--serial', deviceId,
        '--no-video',
        '--no-control',
        '--no-window'
      ], {
        // Set the working directory to the scrcpy binary directory
        cwd: path.dirname(scrcpyPath)
      });

      // Store the process
      activeAudioStreams.set(deviceId, scrcpyProcess);

      scrcpyProcess.stdout.on('data', (data) => {
        console.log(`Audio stream stdout: ${data}`);
      });

      scrcpyProcess.stderr.on('data', (data) => {
        console.log(`Audio stream stderr: ${data}`);
      });

      scrcpyProcess.on('close', (code) => {
        console.log(`Audio stream process exited with code ${code}`);
        activeAudioStreams.delete(deviceId);
      });

      scrcpyProcess.on('error', (error) => {
        console.error(`Failed to start audio stream: ${error}`);
        activeAudioStreams.delete(deviceId);
        reject(`Failed to start audio stream: ${error.message}`);
      });

      // Give it a moment to start
      setTimeout(() => {
        if (activeAudioStreams.has(deviceId)) {
          resolve('Audio stream started successfully');
        } else {
          reject('Failed to start audio stream');
        }
      }, 2000);

    } catch (error) {
      reject(`Error starting audio stream: ${error.message}`);
    }
  });
});

ipcMain.handle('stop-audio-stream', async (event, deviceId) => {
  return new Promise((resolve, reject) => {
    try {
      const process = activeAudioStreams.get(deviceId);
      
      if (!process) {
        resolve('No active audio stream found for this device');
        return;
      }

      // Kill the scrcpy process
      process.kill('SIGTERM');
      
      // Remove from active streams
      activeAudioStreams.delete(deviceId);
      
      resolve('Audio stream stopped successfully');
    } catch (error) {
      reject(`Error stopping audio stream: ${error.message}`);
    }
  });
});

// Check if bundled scrcpy is available
ipcMain.handle('check-scrcpy', async () => {
  return new Promise((resolve) => {
    try {
      const scrcpyPath = getScrcpyPath();
      const fs = require('fs');
      
      if (fs.existsSync(scrcpyPath)) {
        // Try to get version
        exec(`"${scrcpyPath}" --version`, { cwd: path.dirname(scrcpyPath) }, (error, stdout, stderr) => {
          if (error) {
            resolve({ available: true, error: 'Scrcpy found but version check failed', path: scrcpyPath });
          } else {
            resolve({ available: true, version: stdout.trim(), path: scrcpyPath });
          }
        });
      } else {
        resolve({ available: false, error: 'Bundled scrcpy not found', expectedPath: scrcpyPath });
      }
    } catch (error) {
      resolve({ available: false, error: error.message });
    }
  });
});

// Existing handlers
ipcMain.handle('adb-reconnect', async (event, deviceId) => {
  return new Promise((resolve, reject) => {
    const adbCommand = `adb disconnect ${deviceId} && adb connect ${deviceId}`;
    exec(adbCommand, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
      } else {
        resolve(stdout);
      }
    });
  });
});

ipcMain.handle('adb-pull', async (event, deviceId, filepath) => {
  return new Promise((resolve, reject) => {
    const adbCommand = `adb -s ${deviceId} pull ${filepath} "${downloadsPath}"`;
    exec(adbCommand, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
      } else if (stderr) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
});

ipcMain.handle('adb-push', async (event, deviceId, filepath) => {
  return new Promise((resolve, reject) => {
    const destPath = '/sdcard/Airdroid';
    const adbCommand = `adb -s ${deviceId} push "${filepath}" "${destPath}"`;
    exec(adbCommand, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
      } else if (stderr) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
});

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

ipcMain.handle('adb:shell', async (event, deviceId, command) => {
  return new Promise((resolve, reject) => {
    const adbCommand = `adb -s ${deviceId} shell ${command}`;
    exec(adbCommand, (error, stdout, stderr) => {
      if (error) {
        console.log(`Error executing command: ${error.message}`);
        reject(error.message);
        return;
      }
      if (stderr) {
        console.log(`Error output: ${stderr}`);
        reject(stderr);
        return;
      }
      resolve(stdout);
    });
  });
});

ipcMain.handle('tcpip', async (event, id, port) => {
  return new Promise((resolve, reject) => {
    exec(`adb -s ${id} tcpip ${port}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
});

// Clean up active streams on app quit
app.on('before-quit', () => {
  activeAudioStreams.forEach((process, deviceId) => {
    process.kill('SIGTERM');
  });
  activeAudioStreams.clear();
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});