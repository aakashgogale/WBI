const { getRedis, initRedis, isRedisConnected } = require('../services/redisService');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkRedis() {
  initRedis();
  
  // Wait a moment for connection
  await new Promise(resolve => setTimeout(resolve, 2000));

  const redis = getRedis();
  if (!isRedisConnected() || !redis) {
    console.log('Redis is not connected!');
    process.exit(1);
  }

  try {
    const key = `otp:6261745842`;
    const data = await redis.get(key);
    console.log('Redis key:', key);
    console.log('Value in Redis:', data);
    
    if (data) {
      const ttl = await redis.ttl(key);
      console.log('TTL (seconds remaining):', ttl);
    }
  } catch (error) {
    console.error('Redis error:', error);
  } finally {
    process.exit(0);
  }
}

checkRedis();
