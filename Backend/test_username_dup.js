const mongoose = require('mongoose');
const Engineer = require('./models/Engineer');

async function testMongo() {
  await mongoose.connect('mongodb+srv://wbizec_db_user:k7Ny3mXdO54HX9e3@wbi.hfglaed.mongodb.net/WBI'); 
  try {
    const engineer = new Engineer({
        "name": "lakshay",
        "phone": "9999999981",
        "email": "lakshay81@example.com",
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
        "username": "lakshay", // Testing duplicate
        "approvalStatus": "pending"
    });
    
    await engineer.save();
    console.log("Saved successfully");
  } catch (error) {
    console.log("Save error:", error.message);
  } finally {
    mongoose.connection.close();
  }
}

testMongo();
