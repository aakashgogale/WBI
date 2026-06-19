require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const WaveManagerService = require('../services/WaveManagerService');
const { bookingAssignmentQueue } = require('../services/queueService');

const TEST_LAT = 28.704059;
const TEST_LNG = 77.102490;

async function runTest() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appzeto');
    console.log('Connected to DB');

    // 1. Clean up old test data if any
    await Worker.deleteMany({ name: /^Test Worker/ });

    // 2. Create Mock Workers
    console.log('Creating Mock Workers...');
    const mockWorkers = [];
    for (let i = 1; i <= 5; i++) {
      const worker = new Worker({
        name: `Test Worker ${i}`,
        phone: `${Date.now().toString().slice(-6)}${i}`,
        status: 'ONLINE',
        location: {
          type: 'Point',
          coordinates: [TEST_LNG + (i * 0.001), TEST_LAT + (i * 0.001)] // slightly offset
        },
        isActive: true,
        approvalStatus: 'approved'
      });
      await worker.save();
      mockWorkers.push(worker);
    }
    console.log(`Created ${mockWorkers.length} mock workers.`);

    // 2. Create Mock Booking
    console.log('Creating Mock Booking...');
    const booking = new Booking({
      userId: new mongoose.Types.ObjectId(), // Dummy ID
      serviceId: new mongoose.Types.ObjectId(), // Dummy ID
      bookingNumber: `TEST-BK-${Date.now()}`,
      serviceName: 'AC Repair Test',
      serviceCategory: 'One-Time',
      basePrice: 500,
      finalAmount: 500,
      status: 'searching_worker',
      address: {
        addressLine1: 'Test Address',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        lat: TEST_LAT,
        lng: TEST_LNG
      },
      scheduledDate: new Date(),
      scheduledTime: '10:00 AM',
      timeSlot: {
        start: '10:00 AM',
        end: '11:00 AM',
        date: new Date().toISOString(),
        time: '10:00 AM'
      }
    });
    await booking.save();
    console.log(`Created Mock Booking: ${booking._id}`);

    // 3. Trigger WaveManagerService
    console.log('Finding and Grouping Workers...');
    const waves = await WaveManagerService.findAndGroupWorkers(TEST_LAT, TEST_LNG, 10);
    console.log(`Found ${waves.flat().length} workers, divided into ${waves.length} waves.`);

    const flatPotentialWorkers = waves.flat();
    booking.potentialWorkers = flatPotentialWorkers;
    await booking.save();

    console.log('Dispatching Wave 1...');
    await WaveManagerService.dispatchWave(booking._id.toString(), 1);

    console.log('Waiting 5 seconds to simulate time passing...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Cleanup
    console.log('Cleaning up mock data...');
    await Booking.findByIdAndDelete(booking._id);
    for (let w of mockWorkers) {
      await Worker.findByIdAndDelete(w._id);
    }
    
    // Clear queue jobs related to this test
    const jobs = await bookingAssignmentQueue.getJobs(['delayed', 'waiting', 'active']);
    for (let job of jobs) {
      if (job.data.bookingId === booking._id.toString()) {
        await job.remove();
        console.log(`Removed job ${job.id}`);
      }
    }

    console.log('Test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTest();
