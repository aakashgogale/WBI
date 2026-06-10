const axios = require('axios');

async function testRegistration() {
  try {
    const response = await axios.post('http://localhost:5000/api/engineers/auth/register', {
        "name": "lakshay",
        "phone": "9999999991",
        "email": "lakshay@example.com",
        "password": "password123",
        "dob": "1990-01-01",
        "gender": "Male",
        "city": "Delhi",
        "state": "Delhi",
        "registrationType": "Individual Engineer / Technician",
        "primarySkill": "Software / IT Support",
        "totalExperienceYears": 5,
        "experienceLevel": "Mid-level (3-6 years)",
        "username": "lakshay2"
    });
    console.log(response.data);
  } catch (err) {
    console.log(err.response ? err.response.data : err.message);
  }
}

testRegistration();
