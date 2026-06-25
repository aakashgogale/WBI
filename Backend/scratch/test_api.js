const axios = require('axios');

async function test() {
  try {
    const response = await axios.post('https://api.wbinfs.com/api/users/auth/verify-login', {
      phone: '6261745842',
      otp: '123456'
    });
    console.log('STATUS:', response.status);
    console.log('RESPONSE:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.log('ERROR STATUS:', error.response.status);
      console.log('ERROR DATA:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('ERROR MESSAGE:', error.message);
    }
  }
}

test();
