require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load and register all models to prevent MissingSchemaError
const modelsDir = path.join(__dirname, '../models');
fs.readdirSync(modelsDir).forEach(file => {
  if (file.endsWith('.js')) {
    require(path.join(modelsDir, file));
  }
});

// Mock socket.io module FIRST before loading any services/controllers using getIO destructured
const sockets = require('../sockets');
const emittedEvents = [];
const fakeIO = {
  to: (room) => {
    return {
      emit: (event, payload) => {
        emittedEvents.push({ room, event, payload });
      }
    };
  }
};
// Inject mock
sockets.getIO = () => fakeIO;

const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const WorkerAssignmentAttempt = require('../models/WorkerAssignmentAttempt');
const BookingAssignmentConfig = require('../models/BookingAssignmentConfig');
const VerificationConfig = require('../models/VerificationConfig');
const ActiveWorkerSession = require('../models/ActiveWorkerSession');
const matchingService = require('../services/matchingService');
const bookingResponseController = require('../controllers/worker-controllers/bookingResponse.controller');

const TEST_LAT = 28.704059;
const TEST_LNG = 77.102490;

async function runTest() {
  try {
    console.log('Connecting to MongoDB...');
    mongoose.set('strictPopulate', false);
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appzeto');
    console.log('Connected to DB');

    // 1. Clean up old test data if any
    console.log('Cleaning up old test data...');
    await Worker.deleteMany({ name: /^Test Broadcast Worker/ });
    await Booking.deleteMany({ serviceName: 'Broadcast Service Test' });
    await WorkerAssignmentAttempt.deleteMany({});
    
    // Backup or clear config for test
    const oldWorkerConfig = await VerificationConfig.findOne({ roleType: 'worker' });
    await VerificationConfig.findOneAndDelete({ roleType: 'worker' });
    await VerificationConfig.create({
      roleType: 'worker',
      requiredDocuments: [],
      autoVerificationEnabled: true,
      manualReviewRequired: false
    });

    const oldAssignmentConfig = await BookingAssignmentConfig.findOne({ serviceId: null });
    await BookingAssignmentConfig.findOneAndDelete({ serviceId: null });
    const testAssignConfig = await BookingAssignmentConfig.create({
      serviceId: null,
      assignmentMode: 'broadcast',
      autoAssignEnabled: true,
      adminApprovalRequired: false,
      initialRadiusKm: 5,
      maxRadiusKm: 15,
      radiusStepKm: 5,
      workerResponseTimeoutSec: 10,
      maxWorkersPerRound: 5
    });

    // 2. Create Mock Workers
    console.log('Creating Mock Workers...');
    const mockWorkers = [];
    for (let i = 1; i <= 3; i++) {
      const worker = new Worker({
        name: `Test Broadcast Worker ${i}`,
        phone: `999999000${i}`,
        status: 'ONLINE',
        location: {
          type: 'Point',
          coordinates: [TEST_LNG + (i * 0.0001), TEST_LAT + (i * 0.0001)] // within 5km
        },
        isActive: true,
        approvalStatus: 'approved',
        serviceCategories: ['One-Time', 'Broadcast Service Test'],
        address: {
          city: 'Delhi',
          area: 'Test'
        }
      });
      await worker.save();
      mockWorkers.push(worker);

      await ActiveWorkerSession.create({
        workerId: worker._id,
        socketId: `socket-id-mock-${worker._id}`,
        isOnline: true
      });
    }
    console.log(`Created ${mockWorkers.length} mock workers and sessions.`);

    // 3. Create Mock Booking
    console.log('Creating Mock Booking...');
    const booking = new Booking({
      userId: new mongoose.Types.ObjectId(), // Dummy ID
      serviceId: new mongoose.Types.ObjectId(), // Dummy ID
      bookingNumber: `TEST-BROADCAST-${Date.now()}`,
      serviceName: 'Broadcast Service Test',
      serviceCategory: 'One-Time',
      basePrice: 500,
      finalAmount: 500,
      status: 'pending',
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

    // 4. Start matching
    console.log('Triggering matchingService.startMatching...');
    emittedEvents.length = 0; // Clear events before start
    await matchingService.startMatching(booking._id.toString());

    // Wait a brief moment to allow executeMatchingRound timeout delay to fire (2 seconds)
    console.log('Waiting 10 seconds for executeMatchingRound...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Verify attempts were created
    const attempts = await WorkerAssignmentAttempt.find({ bookingId: booking._id });
    console.log(`Number of attempts created: ${attempts.length}`);
    if (attempts.length !== 3) {
      throw new Error(`Expected 3 attempts, got ${attempts.length}`);
    }

    for (const attempt of attempts) {
      if (attempt.status !== 'sent') {
        throw new Error(`Expected status 'sent', got ${attempt.status}`);
      }
      if (attempt.distanceKm === null || !attempt.expiresAt) {
        throw new Error(`Expected distanceKm and expiresAt to be populated, got distanceKm: ${attempt.distanceKm}, expiresAt: ${attempt.expiresAt}`);
      }
    }
    console.log('Successfully validated WorkerAssignmentAttempt field population.');

    // Verify socket events
    const newBookingRequestEvents = emittedEvents.filter(e => e.event === 'worker:newBookingRequest');
    console.log(`Number of worker:newBookingRequest events emitted: ${newBookingRequestEvents.length}`);
    if (newBookingRequestEvents.length !== 3) {
      throw new Error(`Expected 3 socket events, got ${newBookingRequestEvents.length}`);
    }
    console.log('Successfully validated worker:newBookingRequest socket broadcast.');

    // 5. Concurrent acceptance simulation
    console.log('Simulating concurrent acceptance...');
    // We mock req and res for Worker 1 (mockWorkers[0]) and Worker 2 (mockWorkers[1])
    const worker1 = mockWorkers[0];
    const worker2 = mockWorkers[1];

    let res1Status, res1Json;
    const mockRes1 = {
      status: (code) => {
        res1Status = code;
        return {
          json: (data) => {
            res1Json = data;
          }
        };
      }
    };

    let res2Status, res2Json;
    const mockRes2 = {
      status: (code) => {
        res2Status = code;
        return {
          json: (data) => {
            res2Json = data;
          }
        };
      }
    };

    const mockReq1 = {
      params: { bookingId: booking._id.toString() },
      userId: worker1._id.toString()
    };

    const mockReq2 = {
      params: { bookingId: booking._id.toString() },
      userId: worker2._id.toString()
    };

    // Simulate concurrent calls (using Promise.all)
    console.log('Dispatching concurrent acceptBooking calls...');
    emittedEvents.length = 0; // Clear events for acceptance
    await Promise.all([
      bookingResponseController.acceptBooking(mockReq1, mockRes1),
      bookingResponseController.acceptBooking(mockReq2, mockRes2)
    ]);

    console.log(`Worker 1 (Accept first request) Response: Status ${res1Status}, Message: ${JSON.stringify(res1Json)}`);
    console.log(`Worker 2 (Accept second request) Response: Status ${res2Status}, Message: ${JSON.stringify(res2Json)}`);

    // One of them must succeed (200) and the other must fail (400)
    let winner, loser, winnerRes, loserRes;
    if (res1Status === 200) {
      winner = worker1;
      winnerRes = res1Json;
      loser = worker2;
      loserRes = res2Json;
      if (res2Status !== 400) {
        throw new Error(`Expected Worker 2 to fail with 400, got ${res2Status}`);
      }
    } else if (res2Status === 200) {
      winner = worker2;
      winnerRes = res2Json;
      loser = worker1;
      loserRes = res1Json;
      if (res1Status !== 400) {
        throw new Error(`Expected Worker 1 to fail with 400, got ${res1Status}`);
      }
    } else {
      throw new Error(`Neither Worker 1 nor Worker 2 succeeded. Statuses: ${res1Status}, ${res2Status}`);
    }

    if (loserRes.message !== 'This booking has already been accepted by another worker.') {
      throw new Error(`Expected loser error message 'This booking has already been accepted by another worker.', got '${loserRes.message}'`);
    }
    console.log(`Successfully verified atomic lock message for concurrent attempts: "${loserRes.message}"`);

    // Verify Booking in DB
    const finalBooking = await Booking.findById(booking._id);
    if (finalBooking.status !== 'worker_assigned' || finalBooking.workerId.toString() !== winner._id.toString()) {
      throw new Error(`Booking DB state incorrect: status: ${finalBooking.status}, workerId: ${finalBooking.workerId}`);
    }
    console.log(`Successfully verified Booking updated with winner's ID.`);

    // Verify attempts in DB
    const winnerAttempt = await WorkerAssignmentAttempt.findOne({ bookingId: booking._id, workerId: winner._id });
    if (winnerAttempt.status !== 'accepted') {
      throw new Error(`Winner attempt expected status 'accepted', got ${winnerAttempt.status}`);
    }

    const loserAttempt = await WorkerAssignmentAttempt.findOne({ bookingId: booking._id, workerId: loser._id });
    if (loserAttempt.status !== 'expired' || loserAttempt.reason !== 'accepted_by_other_worker') {
      throw new Error(`Loser attempt expected status 'expired' with reason 'accepted_by_other_worker', got status: ${loserAttempt.status}, reason: ${loserAttempt.reason}`);
    }

    const neutralWorker = mockWorkers[2];
    const neutralAttempt = await WorkerAssignmentAttempt.findOne({ bookingId: booking._id, workerId: neutralWorker._id });
    if (neutralAttempt.status !== 'expired' || neutralAttempt.reason !== 'accepted_by_other_worker') {
      throw new Error(`Neutral worker attempt expected status 'expired' with reason 'accepted_by_other_worker', got status: ${neutralAttempt.status}, reason: ${neutralAttempt.reason}`);
    }
    console.log('Successfully verified that non-winning attempts were expired in DB.');

    // Verify socket events emitted during acceptance
    const expiredEvents = emittedEvents.filter(e => e.event === 'worker:bookingExpired');
    console.log(`Number of worker:bookingExpired events emitted: ${expiredEvents.length}`);
    // Should be emitted to the other two workers (loser and neutralWorker)
    if (expiredEvents.length !== 2) {
      throw new Error(`Expected 2 bookingExpired events, got ${expiredEvents.length}`);
    }
    const expiredRooms = expiredEvents.map(e => e.room);
    if (!expiredRooms.includes(`worker:${loser._id.toString()}`) || !expiredRooms.includes(`worker:${neutralWorker._id.toString()}`)) {
      throw new Error(`Expected bookingExpired to be emitted to loser (${loser._id}) and neutral worker (${neutralWorker._id}), got rooms: ${JSON.stringify(expiredRooms)}`);
    }

    const alreadyAssignedEvents = emittedEvents.filter(e => e.event === 'worker:bookingAlreadyAssigned');
    console.log(`Number of worker:bookingAlreadyAssigned events emitted: ${alreadyAssignedEvents.length}`);
    if (alreadyAssignedEvents.length !== 1 || alreadyAssignedEvents[0].room !== `worker:${loser._id.toString()}`) {
      throw new Error(`Expected bookingAlreadyAssigned event for loser, got: ${JSON.stringify(alreadyAssignedEvents)}`);
    }
    console.log('Successfully verified socket emissions to notify non-winning workers of expiry / already assigned.');

    // Cleanup
    console.log('Cleaning up mock data...');
    await Booking.findByIdAndDelete(booking._id);
    for (let w of mockWorkers) {
      await Worker.findByIdAndDelete(w._id);
    }
    await ActiveWorkerSession.deleteMany({ workerId: { $in: mockWorkers.map(w => w._id) } });
    await WorkerAssignmentAttempt.deleteMany({ bookingId: booking._id });

    // Restore old configs
    await VerificationConfig.findOneAndDelete({ roleType: 'worker' });
    if (oldWorkerConfig) {
      await VerificationConfig.create(oldWorkerConfig.toObject());
    }
    await BookingAssignmentConfig.findOneAndDelete({ serviceId: null });
    if (oldAssignmentConfig) {
      await BookingAssignmentConfig.create(oldAssignmentConfig.toObject());
    }

    console.log('All tests passed successfully!');
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('Test failed:', error);
    try {
      await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
  }
}

runTest();
