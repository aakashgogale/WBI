const axios = require('axios');

async function diagnostic() {
  const phone = '6261745842';
  try {
    console.log('--- Step 1: Send OTP ---');
    const sendRes = await axios.post('https://api.wbinfs.com/api/users/auth/send-otp', { phone });
    console.log('Status:', sendRes.status);
    console.log('Headers:', sendRes.headers);
    console.log('Data:', sendRes.data);

    console.log('Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('--- Step 2: Verify OTP ---');
    const verifyRes = await axios.post('https://api.wbinfs.com/api/users/auth/verify-login', {
      phone,
      otp: '123456'
    });
    console.log('Status:', verifyRes.status);
    console.log('Headers:', verifyRes.headers);
    console.log('Data:', verifyRes.data);
  } catch (error) {
    if (error.response) {
      console.log('ERROR Status:', error.response.status);
      console.log('ERROR Headers:', error.response.headers);
      console.log('ERROR Data:', error.response.data);
    } else {
      console.error('ERROR Message:', error.message);
    }
  }
}

diagnostic();
