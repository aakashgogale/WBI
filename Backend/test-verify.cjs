const http = require('http');
const data = JSON.stringify({ phone: '6261745841', otp: '123456' });
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/vendors/auth/verify-login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};
const req = http.request(options, res => {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.on('data', d => process.stdout.write(d));
});
req.on('error', error => console.error(error));
req.write(data);
req.end();
