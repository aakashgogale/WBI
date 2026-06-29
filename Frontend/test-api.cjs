const https = require('https');
const data = JSON.stringify({ phone: '6264612198' });
const options = {
  hostname: 'app.wbinfs.com',
  port: 443,
  path: '/api/users/auth/send-otp/', // Added trailing slash
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};
const req = https.request(options, res => {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.on('data', d => process.stdout.write(d));
});
req.on('error', error => console.error(error));
req.write(data);
req.end();
