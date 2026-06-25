const axios = require('axios');

async function testSequence() {
  const phone = '6261745842';
  try {
    console.log('Sending OTP to', phone);
    const sendRes = await axios.post('https://api.wbinfs.com/api/users/auth/send-otp', { phone });
    console.log('Send OTP Status:', sendRes.status);
    console.log('Send OTP Response:', sendRes.data);

    // Wait a brief second
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Verifying OTP...');
    const verifyRes = await axios.post('https://api.wbinfs.com/api/users/auth/verify-login', {
      phone,
      otp: '123456'
    });
    console.log('Verify Status:', verifyRes.status);
    console.log('Verify Response:', verifyRes.data);
  } catch (error) {
    if (error.response) {
      console.log('ERROR STATUS:', error.response.status);
      console.log('ERROR DATA:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('ERROR MESSAGE:', error.message);
    }
  }
}

testSequence();
