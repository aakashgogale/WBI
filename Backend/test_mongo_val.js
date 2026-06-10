const mongoose = require('mongoose');
const Engineer = require('./models/Engineer');

async function testMongo() {
  await mongoose.connect('mongodb+srv://wbizec_db_user:k7Ny3mXdO54HX9e3@wbi.hfglaed.mongodb.net/WBI'); 
  try {
    const engineer = new Engineer({
        "name": "lakshay",
        "phone": "9999999995",
        "email": "lakshay3@example.com",
        "password": "password123",
        "dob": "1990-01-01",
        "gender": "Male",
        "address": {
          "city": "Delhi",
          "state": "Delhi"
        },
        "registrationType": "Individual Engineer / Technician",
        "primarySkill": "Software / IT Support",
        "totalExperienceYears": 5,
        "experienceLevel": "Mid-level (3–6 years)",
        "username": "lakshay4",
        "approvalStatus": "pending"
    });
    
    // Validate manually to catch the exact error
    const err = engineer.validateSync();
    if (err) {
      console.log("Validation Error:", err.message);
    } else {
      console.log("Validation passed");
      await engineer.save();
      console.log("Saved successfully");
    }
  } catch (error) {
    console.log("Save error:", error.message);
  } finally {
    mongoose.connection.close();
  }
}

testMongo();
