const http = require('http');
const data = JSON.stringify({ phone: '6261745841' });
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/vendors/auth/send-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};
console.time('request');
const req = http.request(options, res => {
  console.log('STATUS: ' + res.statusCode);
  res.on('data', d => process.stdout.write(d));
  res.on('end', () => {
    console.timeEnd('request');
  });
});
req.on('error', error => console.error(error));
req.write(data);
req.end();
