require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Worker = require('./models/Worker');

async function testMatch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Get the most recent one-time service booking
    const booking = await Booking.findOne().sort({ createdAt: -1 });
    if (!booking) {
      console.log('No booking found');
      return;
    }
    console.log('--- RECENT BOOKING ---');
    console.log('ID:', booking._id);
    console.log('Service Name:', booking.serviceName);
    console.log('Sub Service ID:', booking.subServiceId);
    console.log('Vendor ID:', booking.vendorId);
    console.log('Location:', booking.address?.lat, booking.address?.lng);
    console.log('----------------------');

    // Get active, approved, online workers
    const workers = await Worker.find({
      approvalStatus: 'approved',
      isActive: true,
      status: 'ONLINE'
    });

    console.log(`Found ${workers.length} approved/active/online workers`);

    if (workers.length === 0) {
      // Why are there no workers? Check all workers
      const allWorkers = await Worker.find({});
      console.log(`Total workers in DB: ${allWorkers.length}`);
      if (allWorkers.length > 0) {
        console.log('Sample worker status:');
        console.log('Approval Status:', allWorkers[0].approvalStatus);
        console.log('Is Active:', allWorkers[0].isActive);
        console.log('Status:', allWorkers[0].status);
      }
    }

    for (const worker of workers) {
      console.log(`\n--- Evaluating Worker: ${worker.name} (${worker._id}) ---`);
      
      // 1. Distance check
      if (!worker.location || !worker.location.coordinates) {
        console.log('REJECTED: No location coordinates');
        continue;
      }
      
      const lng1 = booking.address?.lng;
      const lat1 = booking.address?.lat;
      const lng2 = worker.location.coordinates[0];
      const lat2 = worker.location.coordinates[1];
      
      // Simple distance calc
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      console.log(`Distance: ${distance.toFixed(2)} km`);
      if (distance > 10) {
         console.log('REJECTED: Too far (> 10km)');
         // Not skipping so we can see other reasons
      }

      // 2. Service check
      const matchesSubService = worker.subServices?.some(s => s.subServiceId?.toString() === booking.subServiceId?.toString());
      const matchesCategory = worker.serviceCategories?.includes(booking.serviceName);
      
      console.log(`Matches SubService: ${matchesSubService}`);
      console.log(`Matches Category: ${matchesCategory}`);
      console.log(`Worker Categories:`, worker.serviceCategories);
      console.log(`Worker SubServices:`, worker.subServices?.map(s => s.subServiceId));
      
      if (!matchesSubService && !matchesCategory) {
        console.log('REJECTED: Service mismatch');
      }

      // 3. Vendor check
      if (booking.vendorId && worker.vendorId?.toString() !== booking.vendorId.toString()) {
        console.log(`REJECTED: Vendor mismatch (Booking: ${booking.vendorId}, Worker: ${worker.vendorId})`);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

testMatch();
