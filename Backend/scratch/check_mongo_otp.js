const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const TokenSchema = new mongoose.Schema({
  phone: String,
  type: String,
  token: String,
  otp: String,
  expiresAt: Date,
  attempts: Number,
  isUsed: { type: Boolean, default: false }
}, { timestamps: true });

const Token = mongoose.model('Token', TokenSchema, 'tokens');

async function checkTokens() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const tokens = await Token.find({ phone: '6261745842' });
    console.log(`Found ${tokens.length} token(s) for 6261745842:`);
    console.log(JSON.stringify(tokens, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTokens();
