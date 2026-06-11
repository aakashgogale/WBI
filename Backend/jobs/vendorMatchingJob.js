const { Worker } = require('bullmq');
const { redisConnection } = require('./queueSetup');
const DynamicEnquiry = require('../models/DynamicEnquiry');
const Vendor = require('../models/Vendor');
const { getIO } = require('../sockets'); // Ensure sockets are accessible

const vendorMatchingWorker = new Worker('vendor-matching', async (job) => {
  console.log(`[Worker] Processing vendor matching for enquiry ${job.data.enquiryId}`);
  try {
    const { enquiryId } = job.data;
    const enquiry = await DynamicEnquiry.findById(enquiryId).populate('subServiceId');
    if (!enquiry) throw new Error('Enquiry not found');

    const io = getIO();

    // Matching logic (mocked logic based on requirements)
    // 1. Sub-service match (40 pts)
    // 2. City/coverage match (30 pts)
    // 3. Avg rating (20 pts)
    // 4. Response rate (10 pts)
    // Here we'll just fetch active vendors for now
    const vendors = await Vendor.find({ isApproved: true, status: 'Active' }).limit(3);

    vendors.forEach((vendor) => {
      // In a real scenario, calculate score and filter top 3
      console.log(`Notifying vendor ${vendor._id} for new enquiry`);
      
      // Real-time websocket event
      if (io) {
        io.to(`vendor:${vendor._id}`).emit('enquiry:new', {
          enquiryId: enquiry._id,
          subService: enquiry.subServiceId.name,
          urgency: enquiry.urgency
        });
      }

      // Add to notification queue
      // notificationQueue.add('send-push', { vendorId: vendor._id, message: 'New enquiry received' });
    });

    return { matchedVendors: vendors.map(v => v._id) };
  } catch (error) {
    console.error('[Worker Error] vendorMatchingWorker:', error);
    throw error;
  }
}, { connection: redisConnection });

module.exports = vendorMatchingWorker;
