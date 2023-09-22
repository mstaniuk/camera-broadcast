const os = require('os');

function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const networkInterface of interfaces[name]) {
      const {address, family, internal} = networkInterface;
      if (family === 'IPv4' && !internal) {
        return address;
      }
    }
  }
  return '127.0.0.1'; // default in case no network interface is found
}

module.exports = {
  getIPAddress,
};
