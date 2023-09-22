const express = require('express');
const CameraManager = require('./CameraManager');
const path = require('path');
const { getIPAddress } = require('./utils');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const cameraManager = new CameraManager();

console.log(cameraManager.cameras);

cameraManager.cameras.forEach((camera) => {
  const { port } = camera;
  app.use(`/camera${port}`, (req, res) => {
    const ip = getIPAddress();
    res.redirect(`http://${ip}:${port}`);
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  const ip = getIPAddress();
  console.log(`Server is running at http://${ip}:${PORT}`);
});
