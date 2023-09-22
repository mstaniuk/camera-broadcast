const {execSync, spawn} = require('child_process');
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
          // Execute v4l2-ctl to get device formats, resolutions, and frame rates
          const details = execSync(`v4l2-ctl --list-formats-ext --device=${device}`).toString();

          // Regular expressions to find resolutions and frame rates
          const resolutionPattern = /Size: Discrete (\d+)x(\d+)/g;
          const fpsPattern = /\((\d+).* fps\)/g;

          // Find all matching resolutions and frame rates
          const resolutions = details.matchAll(resolutionPattern);
          const fpsList = details.matchAll(fpsPattern);

          // If any resolutions and fps are found
          if (resolutions && fpsList) {
            // Sort and select the highest resolution
            const highestResolutionEntry = [...resolutions].sort((a, b) => {
              if (a[1] && a[2] && b[1] && b[2]) {
                const [aWidth, aHeight] = [a[1], a[2]].map(Number);
                const [bWidth, bHeight] = [b[1], b[2]].map(Number);
                return (bWidth * bHeight) - (aWidth * aHeight);
              }
            })[0];


            // Sort and select the highest fps
            const highestFps = Math.max(...[...fpsList].filter(fps => fps[1]).map(fps => Number(fps[1])));

            // Add the device with the highest resolution and fps to the cameras array
            cameras.push({
              device,
              resolution: `${highestResolutionEntry[1]}x${highestResolutionEntry[2]}`,
              fps: highestFps
            });
          }
        } catch (error) {
          console.error(`Failed to get details for device ${device}:`, error.message);
        }
      }
    });

    return cameras;
  }


  startStreams(basePort) {
    this.cameras.forEach((camera, index) => {
      const {device, resolution, fps} = camera;
      const port = basePort + index + 1;
      // Specify the input plugin and its options
      const inputOptions = ['-i', `input_uvc.so -d ${device}`];

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
