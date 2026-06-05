require('dotenv').config();
const mongoose = require('mongoose');
const { generateOTP, hashOTP, storeOTP, verifyOTP, checkRateLimit } = require('./utils/redisOtp.util');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wbi');
        console.log("Connected to Mongo");

        const phone = '6261745842';
        
        console.log("Checking Rate Limit...");
        const allowed = await checkRateLimit(phone);
        console.log("Rate Limit Allowed:", allowed);

        const otp = generateOTP();
        console.log("Generated OTP:", otp);

        const otpHash = hashOTP(otp);
        console.log("OTP Hash:", otpHash);

        console.log("Storing OTP...");
        await storeOTP(phone, otpHash);
        console.log("Stored OTP Successfully");

    } catch (error) {
        console.error("Test Error:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

test();
