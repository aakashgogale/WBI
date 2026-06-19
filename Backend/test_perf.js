const axios = require('axios');

async function testPerf() {
  const start = Date.now();
  try {
    const res = await axios.get('http://localhost:5000/api/admin/bookings?page=1&limit=10', {
      headers: {
        // Need an admin token
        // Let's authenticate first
      }
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testPerf();
