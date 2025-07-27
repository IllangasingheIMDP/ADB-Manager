const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const os =require('os')
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
    // Expecting message as JSON: { filename: '...', filedata: 'base64string' }
    try {
      const { filename, filedata } = JSON.parse(message);
      const buffer = Buffer.from(filedata, 'base64');
      //const savePath = path.join(__dirname, 'uploads', filename);
      const savePath = path.join(os.homedir(), 'Downloads', filename);
      // Ensure uploads directory exists
      fs.mkdirSync(path.dirname(savePath), { recursive: true });

      fs.writeFileSync(savePath, buffer);
      ws.send(JSON.stringify({ status: 'success', message: 'File received' }));
      console.log(`Received and saved file: ${filename}`);
    } catch (err) {
      ws.send(JSON.stringify({ status: 'error', message: err.message }));
    }
  });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));