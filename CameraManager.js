const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class CameraManager {
  constructor() {
    this.cameras = this.detectCameras();
    this.startStreams();
  }

  detectCameras() {
    const videoDevicesPath = '/dev/';
    const cameras = [];

    fs.readdirSync(videoDevicesPath).forEach((file) => {
      if (file.startsWith('video')) {
        const device = path.join(videoDevicesPath, file);
        cameras.push({ device, port: 8081 + cameras.length });
      }
    });

    return cameras;
  }

  startStreams() {
    this.cameras.forEach((camera) => {
      const { device, port } = camera;
      const mjpg = spawn('mjpg_streamer', ['your', 'camera', 'parameters', device]);

      mjpg.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      mjpg.on('close', (code) => {
        console.log(`child process for device ${device} exited with code ${code}`);
        // Handle stream restart if necessary
      });
    });
  }
}

module.exports = CameraManager;
