const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/devices', (req, res) => {
  res.json({ devices: [] });
});

const PORT = 5000;
const server = http.createServer(app);

// WebSocket server setup
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (message) => {
    // Log the raw message for debugging
    
    try {
      // Ensure message is a string and trim any whitespace
      const messageStr = message.toString('utf8').trim();
      console.log('Trimmed message:', messageStr);

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

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));