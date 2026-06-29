const { Queue, Worker, QueueEvents } = require('bullmq');
const Redis = require('ioredis');

// Ensure we have a valid Redis connection for BullMQ
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
  console.error('[BullMQ Redis] ❌ Error:', err.message);
});

// Queue Definitions
const vendorMatchingQueue = new Queue('vendor-matching', { connection: redisConnection });
const engineerAssignmentQueue = new Queue('engineer-assignment', { connection: redisConnection });
const slaMonitorQueue = new Queue('sla-monitor', { connection: redisConnection });
const notificationQueue = new Queue('notification-queue', { connection: redisConnection });
const bookingDispatchQueue = new Queue('booking-dispatch', { connection: redisConnection });
const queues = [vendorMatchingQueue, engineerAssignmentQueue, slaMonitorQueue, notificationQueue, bookingDispatchQueue];
queues.forEach(q => q.on('error', err => console.error(`[BullMQ Queue Error] ${q.name}:`, err.message)));

console.log('[BullMQ] Queues initialized');

module.exports = {
  vendorMatchingQueue,
  engineerAssignmentQueue,
  slaMonitorQueue,
  notificationQueue,
  bookingDispatchQueue,
  redisConnection
};
