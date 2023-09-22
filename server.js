const express = require('express');
const CameraManager = require('./CameraManager');
const path = require('path');
const { getIPAddress } = require('./utils');

const PORT = process.env.PORT || 8080;
const ipAddress = getIPAddress();
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const cameraManager = new CameraManager(PORT);

// Expose a GET endpoint to list all available cameras
app.get('/cameras', (req, res) => {
  try {
    const cameras = cameraManager.cameras.map(camera => {
      return {
        url: `${ipAddress}:${camera.port}`,
        resolution: camera.resolution,
        fps: camera.fps
      };
    });
    res.json(cameras);
  } catch (error) {
    console.error('Failed to list cameras:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://${ipAddress}:${PORT}`);
});
