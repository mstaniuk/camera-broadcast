const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CameraManager {
  constructor(basePort = 8080) {
    this.cameras = this.detectCameras();
    this.startStreams(basePort);
  }

  detectCameras() {
    const videoDevicesPath = '/dev/';
    const cameras = [];

    fs.readdirSync(videoDevicesPath).forEach((file) => {
      if (file.startsWith('video')) {
        const device = path.join(videoDevicesPath, file);

        try {
          // Execute v4l2-ctl to get device details
          const details = execSync(`v4l2-ctl --device=${device} --all`).toString();

          cameras.push({ device, details });
        } catch (error) {
          console.error(`Failed to get details for device ${device}:`, error.message);
        }
      }
    });

    return cameras;
  }

  startStreams(basePort) {
    this.cameras.forEach((camera, index) => {
      const { device } = camera;
      const port = basePort + index + 1;
      // Specify the input plugin and its options
      const inputOptions = ['-i', `input_uvc.so -d ${device} -r 640x480 -f 30`];

      // Specify the output plugin and its options
      const outputOptions = ['-o', `output_http.so -p ${port} -w ./www`];

      // Combine input and output options
      const mjpgOptions = [...inputOptions, ...outputOptions];

      // Start mjpg_streamer with the specified options
      const mjpg = spawn('mjpg_streamer', mjpgOptions);

      mjpg.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      mjpg.on('close', (code) => {
        console.log(`child process for device ${device} exited with code ${code}`);
      });
    });
  }
}

module.exports = CameraManager;
