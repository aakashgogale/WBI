require('dotenv').config();
const mongoose = require('mongoose');
const MatchingService = require('./services/matchingService');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected, starting matcher for 6a3282f0817bbe76bfdb5f8f');
  const matcher = new MatchingService();
  await matcher.startMatching('6a3282f0817bbe76bfdb5f8f');
  console.log('Matcher started');
  // wait a bit for async process
  setTimeout(() => process.exit(0), 10000);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
