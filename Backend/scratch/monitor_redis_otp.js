const { getRedis, initRedis, isRedisConnected } = require('../services/redisService');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function monitor() {
  initRedis();
  
  // Wait a moment for connection
  await new Promise(resolve => setTimeout(resolve, 2000));

  const redis = getRedis();
  if (!isRedisConnected() || !redis) {
    console.log('Redis is not connected!');
    process.exit(1);
  }

  console.log('Monitoring Redis key otp:6261745842 for 30 seconds...');
  const startTime = Date.now();
  
  while (Date.now() - startTime < 30000) {
    const data = await redis.get('otp:6261745842');
    if (data) {
      console.log('FOUND OTP IN REDIS!');
      console.log('Value:', data);
      const ttl = await redis.ttl('otp:6261745842');
      console.log('TTL (seconds):', ttl);
      process.exit(0);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Monitoring timed out. No OTP key detected.');
  process.exit(0);
}

monitor();
