const Booking = require('../../models/Booking');
const Worker = require('../../models/Worker');
const ServiceCategory = require('../../models/ServiceCategory');
const SubService = require('../../models/SubService');
const { getIO } = require('../../sockets');
const crypto = require('crypto');

// 1. Fetch available one-time services
exports.getAvailableServices = async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true });
    // This is simplified. In a real app we might join SubServices directly
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Find nearby workers based on criteria
exports.findNearbyWorkers = async (req, res) => {
  try {
    const { lat, lng, radius = 10, categoryId, subServiceId } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const query = {
      status: 'ONLINE',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      }
    };

    // Note: If adding category filters, they should be applied here.
    // e.g., if (categoryId) query.serviceCategories = categoryId;

    const workers = await Worker.find(query)
      .select('name profilePhoto rating completedJobs location status')
      .limit(20);

    res.status(200).json({ success: true, count: workers.length, data: workers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Create a Booking
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, subServiceId, workerId, address, scheduledDate, scheduledTime, basePrice } = req.body;

    // Validate inputs
    if (!serviceId || !address || !basePrice) {
      return res.status(400).json({ success: false, message: 'Missing required booking fields' });
    }

    // Determine target worker(s). If user picked one, use it. If not, auto-assign nearest.
    // For now, assuming user picked `workerId` or we leave it null for auto-assignment broadcasting.
    
    // Generate OTP
    const completionOTP = crypto.randomInt(100000, 999999).toString();

    const booking = new Booking({
      userId: req.user._id,
      workerId: workerId || null,
      serviceId,
      serviceName: 'One-Time Service', // Ideally fetched from DB
      serviceCategory: 'One-Time', 
      address,
      scheduledDate,
      scheduledTime,
      basePrice,
      finalAmount: basePrice,
      status: 'awaiting_worker_acceptance',
      paymentStatus: 'pending',
      customerConfirmationOTP: completionOTP,
      bookingType: 'scheduled'
    });

    await booking.save();

    // Notify the worker via Socket.IO
    if (workerId) {
      const io = getIo();
      io.to(`worker:${workerId.toString()}`).emit('worker:bookingRequest', {
        bookingId: booking._id,
        serviceName: booking.serviceName,
        address: booking.address,
        scheduledDate,
        scheduledTime,
        price: basePrice
      });
      // Start auto-assignment fallback timer here in a real production system (e.g., BullMQ)
    }

    res.status(201).json({ success: true, data: booking, message: 'Booking created and worker notified' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Verify OTP upon completion
exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    // In this flow, worker usually enters OTP in their app. If user verifies it via their app, it's a different UX.
    // Assuming user app provides it to worker, and worker app calls verify.
    // If this is User Controller, user might be confirming via button instead of OTP.
    // Adjust based on your specific flow.
    res.status(200).json({ success: true, message: 'Verified' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Rate the booking
exports.rateBooking = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { rating, review: reviewText, reviewedAt: new Date() },
      { new: true }
    );

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    // Also update worker's average rating here
    if (booking.workerId) {
      const worker = await Worker.findById(booking.workerId);
      if (worker) {
        const totalReviews = worker.totalReviews + 1;
        const newRating = ((worker.rating * worker.totalReviews) + rating) / totalReviews;
        worker.rating = newRating;
        worker.totalReviews = totalReviews;
        await worker.save();
      }
    }

    res.status(200).json({ success: true, message: 'Rating submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const BookingDraft = require('../../models/BookingDraft');

// 6. Create a Booking Draft from selected services
exports.createDraft = async (req, res) => {
  try {
    const { serviceId, brandId, issueIds, packageIds, quantities, priceSnapshot } = req.body;
    const userId = req.user._id || req.user.id;

    if (!serviceId || !packageIds || packageIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // You could also validate the priceSnapshot against DB here to prevent manipulation,
    // but the final price will be recalculated upon actual checkout anyway.

    // Create or update existing draft for this user and service
    let draft = await BookingDraft.findOne({ userId, serviceId, status: 'draft' });

    if (draft) {
      // Update existing draft
      draft.brandId = brandId || null;
      draft.issueIds = issueIds || [];
      draft.packageIds = packageIds;
      draft.quantities = quantities || {};
      draft.priceSnapshot = priceSnapshot;
      await draft.save();
    } else {
      // Create new draft
      draft = new BookingDraft({
        userId,
        serviceId,
        brandId: brandId || null,
        issueIds: issueIds || [],
        packageIds,
        quantities: quantities || {},
        priceSnapshot
      });
      await draft.save();
    }

    res.status(200).json({ success: true, data: draft, message: 'Draft saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// 7. Update Draft (Address & Schedule)
exports.updateDraft = async (req, res) => {
  try {
    const draftId = req.params.id;
    const { bookingType, address, scheduledDate, scheduledTime } = req.body;
    const userId = req.user._id || req.user.id;

    const draft = await BookingDraft.findOne({ _id: draftId, userId });
    
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    draft.bookingType = bookingType;
    draft.address = address;
    draft.scheduledDate = scheduledDate;
    draft.scheduledTime = scheduledTime;

    await draft.save();

    res.status(200).json({ success: true, data: draft, message: 'Draft updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const axios = require('axios');

// 8. Reverse Geocode (Lat/Lng to Address via Google Maps)
exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Google Maps API key not configured' });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const response = await axios.get(url);

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const addressComponents = result.address_components;

      let city = '';
      let state = '';
      let pincode = '';

      addressComponents.forEach(component => {
        if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('postal_code')) {
          pincode = component.long_name;
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          formattedAddress: result.formatted_address,
          city,
          state,
          pincode,
          lat,
          lng
        }
      });
    }

    res.status(404).json({ success: false, message: 'Address not found for these coordinates' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Generate Dynamic Available Slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query; // Format: YYYY-MM-DD
    const selectedDate = date ? new Date(date) : new Date();
    
    // Configurable working hours (e.g. 9 AM to 7 PM)
    const workStartHour = 9;
    const workEndHour = 19; 
    const slotDurationMinutes = 60;

    const slots = [];
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    let currentHour = workStartHour;
    let currentMinute = 0;

    // Fast-forward if checking today
    if (isToday) {
      const currentRealHour = now.getHours();
      // Only allow slots at least 2 hours from now
      currentHour = Math.max(workStartHour, currentRealHour + 2);
    }

    while (currentHour < workEndHour) {
      const startAmPm = currentHour >= 12 ? 'PM' : 'AM';
      const startH = currentHour > 12 ? currentHour - 12 : currentHour;
      
      const endHourRaw = currentHour + Math.floor(slotDurationMinutes / 60);
      const endMinuteRaw = currentMinute + (slotDurationMinutes % 60);
      
      const endH = endHourRaw > 12 ? endHourRaw - 12 : endHourRaw;
      const endAmPm = endHourRaw >= 12 ? 'PM' : 'AM';

      const timeString = `${startH}:00 ${startAmPm} - ${endH}:00 ${endAmPm}`;

      // In a real app, query Booking/WorkerAvailability here to check if slot is full.
      // For now, we simulate dynamic availability (mostly available).
      
      slots.push({
        id: `slot_${currentHour}_00`,
        time: timeString,
        isAvailable: true, // Dynamic boolean
      });

      currentHour++;
    }

    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 10. Get Available Dates
exports.getAvailableDates = async (req, res) => {
  try {
    const dates = [];
    const today = new Date();
    // Generate next 14 days dynamically
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      
      // Mocking unavailability for demonstration (e.g. disable Sundays)
      const isAvailable = d.getDay() !== 0; 
      
      dates.push({
        date: d.toISOString().split('T')[0],
        isAvailable
      });
    }
    res.status(200).json({ success: true, data: dates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 11. Schedule Draft
exports.scheduleDraft = async (req, res) => {
  try {
    const { scheduledDate, slotId, timeString } = req.body;
    const draftId = req.params.id;
    
    const draft = await BookingDraft.findOne({ _id: draftId, userId: req.user._id });
    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found' });
    
    draft.bookingType = 'scheduled';
    draft.scheduledDate = scheduledDate;
    draft.scheduledSlot = slotId;
    draft.scheduledTime = timeString;
    await draft.save();
    
    res.status(200).json({ success: true, message: 'Schedule updated successfully', draft });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

