const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const os = require('os');
const { stderr, stdout } = require('process');
const fs = require('fs').promises; // Use promises for async fs operations
const WebSocket = require('ws');



function getWiFiIPv4() {
  const interfaces = os.networkInterfaces();
  const wifiInterfaces = ['Wi-Fi', 'Wireless LAN adapter Wi-Fi', 'wlan0']; // common WiFi interface names
  for (const name of wifiInterfaces) {
    if (interfaces[name]) {
      for (const config of interfaces[name]) {
        if (config.family === 'IPv4' && !config.internal) {
          return config.address;
        }
      }
    }
  }
  return '127.0.0.1';
}

// Load environment variables
const isDev = !app.isPackaged;
if (isDev) {
  // In development, load from .env file
  require('dotenv').config();
} else {
  // In production, try to load .env from the app directory
  const envPath = path.join(__dirname, '.env');
  require('dotenv').config({ path: envPath });
}


const downloadsPath = path.join(os.homedir(), 'Downloads');

// Store active scrcpy processes for each device
const activeAudioStreams = new Map();
const activeVideoStreams = new Map();

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

const PORT = 8383; // Match your ws-config.json port
const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (message) => {
    // Log the raw message for debugging
    
    try {
      // Ensure message is a string and trim any whitespace
      const messageStr = message.toString('utf8').trim();
      

      const data = JSON.parse(messageStr);

      if (data.type === 'notification') {

        // Decode and parse notification data
        const notificationData = JSON.parse(Buffer.from(data.data, 'base64').toString('utf8'));
        console.log('Parsed notification:', notificationData);
        // Broadcast notification to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'notification',
              data: notificationData
            }));
          }
        });


        ws.send(JSON.stringify({
          status: 'success',
          message: 'Notification received'
        }));
      } else {
        // Handle file upload
        const { filename, filedata } = data;
        const buffer = Buffer.from(filedata, 'base64');
        const savePath = path.join(os.homedir(), 'Downloads', filename);
        fs.mkdirSync(path.dirname(savePath), { recursive: true });
        fs.writeFileSync(savePath, buffer);
        ws.send(JSON.stringify({
          status: 'success',
          message: 'File received'
        }));
        console.log(`Received and saved file: ${filename}`);
      }
    } catch (err) {
      console.error('Error processing message:', err.message, err.stack);
      ws.send(JSON.stringify({
        status: 'error',
        message: `Error processing message: ${err.message}`
      }));
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
});
console.log(`WebSocket server running on ws://localhost:${PORT}`);

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    resizable: true,
    icon: path.join(__dirname, 'src/frontend/public/logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      webSecurity: true,
    },
    backgroundColor: '#000000',
    show: false, // Don't show until ready
  });

  const isDev = !app.isPackaged;

  // Show window when ready to prevent flash
  win.once('ready-to-show', () => {
    win.show();
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, 'src/frontend/dist/index.html')}`
  );

  // Optional: Open DevTools in development
  
}
ipcMain.handle('save-temp-image', async (event, base64Data) => {
  const fs =require('fs')
  try {
    const tempDir = path.join(app.getPath('temp'), 'connect-temp');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create temp file path
    const tempFilePath = path.join(tempDir, `clipboard_${Date.now()}.png`);
    
    // Write the base64 data to file
    fs.writeFileSync(tempFilePath, Buffer.from(base64Data, 'base64'));
    
    return tempFilePath;
  } catch (error) {
    throw new Error(`Failed to save clipboard image: ${error.message}`);
  }
});




ipcMain.handle('chatbot:ask', async (event, userMessage) => {
  try {
    // Debug: Check if API key is loaded
    console.log('GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
    console.log('GROQ_API_KEY length:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 'undefined');
    
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not found in environment variables');
    }
    
    // Use global fetch (available in Node.js 18+ and Electron)
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'system',
          content: `You are an expert ADB (Android Debug Bridge) assistant integrated into a comprehensive ADB Manager desktop application. Your role is to help users with:

**Core ADB Operations:**
- Device connection and management (USB/WiFi)
- File transfer operations (push/pull) to/from Android devices
- Shell command execution and troubleshooting
- Device debugging and development workflows
- Network ADB setup and wireless connections

**Application-Specific Features:**
- This application includes scrcpy integration for screen mirroring and control
- Audio and video streaming capabilities between devices
- File explorer functionality for Android device file systems
- Device reconnection and connection management
- TCP/IP mode switching for wireless debugging

**Your Expertise Covers:**
- ADB command syntax and best practices
- Common connection issues and their solutions
- Android file system navigation and permissions
- Developer options and USB debugging setup
- Network configuration for wireless ADB
- Troubleshooting device detection problems
- Performance optimization for file transfers
- Security considerations when using ADB

**Response Guidelines:**
- Provide clear, step-by-step instructions
- Include relevant ADB commands with proper syntax
- Explain potential issues and how to resolve them
- Consider both USB and wireless connection scenarios
- Reference the application's built-in features when relevant
- Prioritize safety and security in your recommendations
- Offer alternative solutions when primary methods fail

Always be concise but thorough, and tailor your responses to both beginners and advanced users based on their questions.`
        },
        {
          role: 'user',
          content: userMessage
        }]
      })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} - ${data.error?.message || 'Unknown error'}`);
    }
    
    return data.choices?.[0]?.message?.content || 'No response received';
  } catch (error) {
    console.error('Groq Chatbot API error:', error);
    
    // Return different error messages based on the error type
    if (error.message.includes('GROQ_API_KEY not found')) {
      return 'Error: API key not configured. Please check your environment variables.';
    } else if (error.message.includes('API Error: 401')) {
      return 'Error: Invalid API key. Please check your GROQ API key.';
    } else if (error.message.includes('API Error: 429')) {
      return 'Error: Rate limit exceeded. Please try again later.';
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Error: Network connection failed. Please check your internet connection.';
    } else {
      return `Error: ${error.message}. Please check your internet connection or API key.`;
    }
  }
});
ipcMain.handle('is-file', async (_, path) => {
  const fs =require('fs')
  return fs.lstatSync(path).isFile();
})

ipcMain.handle('start-vidoe-stream',async(event,deviceId)=>{
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
        if (activeVideoStreams.has(deviceId)) {
          resolve('Video stream started successfully');
        } else {
          reject('Failed to start video stream');
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
    const destPath = '/sdcard/ADB_Client';
    
    // First create the directory if it doesn't exist
    const mkdirCommand = `adb -s ${deviceId} shell mkdir -p ${destPath}`;
    exec(mkdirCommand, (mkdirError) => {
      if (mkdirError) {
        reject(`Failed to create directory: ${mkdirError.message}`);
        return;
      }

      // Then push the file
      const adbCommand = `adb -s ${deviceId} push "${filepath}" "${destPath}"`;
      exec(adbCommand, (error, stdout, stderr) => {
        if (error) {
          reject(error.message);
          return;
        } 
        if (stderr) {
          reject(stderr);
          return;
        }

        // After successful push, trigger media scanner
        const filename = path.basename(filepath);
        const fullPath = `${destPath}/${filename}`;
        const scanCommand = `adb -s ${deviceId} shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file://${fullPath}`;
        
        exec(scanCommand, (scanError, scanStdout, scanStderr) => {
          if (scanError) {
            console.log(`Media scan error: ${scanError.message}`);
            // Still resolve since file was pushed successfully
            resolve(stdout);
          } else {
            resolve(stdout + '\nMedia scan completed');
          }
        });
      });
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
  
  try {
    await new Promise((resolve, reject) => {
    exec(`adb connect ${ip}:${port}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
   
    let wsConfig = { ip: getWiFiIPv4(), port: 8383 };
    const configPath = path.join(app.getPath('userData'), 'ws-config.json');
    await fs.writeFile(configPath, JSON.stringify(wsConfig, null, 2));
    
    // Step 3: Push config file to Android device
    const devicePath = `/sdcard/Android/data/com.example.adbmobile/files/ADB_Client/ws-config.json`; // Adjust path based on app permissions
    await new Promise((resolve, reject) => {
      exec(`adb -s ${ip}:${port} push ${configPath} ${devicePath}`, (error, stdout, stderr) => {
        if (error) {
          
          reject(error);
        } else {
          
          resolve(stdout);
        }
      });
    });

    return { success: true, message: 'TCP/IP enabled and config pushed' };
  } catch (error) {
    return {success:false, message:error.message}
  }
});

ipcMain.handle('install-client-apk',async(event,deviceId)=>{
  try{
  await new Promise((resolve,reject)=>{
    const apkPath = isDev ? path.join(__dirname, 'app-debug.apk') : path.join(process.resourcesPath, '/app.asar.unpacked/app-debug.apk');
    const adbCommand = `adb -s ${deviceId} install ${apkPath}`
    exec(adbCommand,(error,stdout,stderr)=>{
      if(error){
        reject(error)
      }else{
        resolve(stdout)
      }
    })
  })

  let wsConfig = { ip: getWiFiIPv4(), port: 8383 };
    console.log(wsConfig)
    const fs =require('fs').promises
    const configPath = path.join(app.getPath('userData'), 'ws-config.json');

    

    await fs.writeFile(configPath, JSON.stringify(wsConfig, null, 2));
    
    // Step 3: Push config file to Android device
    const devicePath = `/sdcard/Android/data/com.example.adbmobile/files/ADB_Client/ws-config.json`; // Adjust path based on app permissions
    await new Promise((resolve, reject) => {
      exec(`adb -s ${deviceId} push ${configPath} ${devicePath}`, (error, stdout, stderr) => {
        if (error) {
          
          reject(error);
        } else {
          
          resolve(stdout);
        }
      });
    });
    return { success: true, message: 'App is installed and config pushed' };
}catch(error){
  return {success:false,message:error.message}
}

})

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
  try {
    // Step 1: Enable TCP/IP mode via ADB
    await new Promise((resolve, reject) => {
      exec(`adb -s ${id} tcpip ${port}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });

    

    return { success: true, message: 'TCP/IP enabled ' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle file dialog
ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg', 'bmp', 'webp'] },
      { name: 'Videos', extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'] },
      { name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg'] },
      { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'] },
      { name: 'Archives', extensions: ['zip', 'rar', '7z', 'tar', 'gz'] }
    ]
  });
  return result;
});

// Clean up active streams on app quit
app.on('before-quit', () => {
  wss.close();
  activeAudioStreams.forEach((process, deviceId) => {
    process.kill('SIGTERM');
  });
  activeAudioStreams.clear();
  const tempDir = path.join(app.getPath('temp'), 'connect-temp');
  // Use require('fs') for sync methods
  const fsSync = require('fs');
  if (fsSync.existsSync(tempDir)) {
    fsSync.rmSync(tempDir, { recursive: true, force: true });
  }
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