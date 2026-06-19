const mongoose = require('mongoose');
const BookingDraft = require('./models/BookingDraft');
const Booking = require('./models/Booking');
const ServicePackage = require('./models/ServicePackage');
const Settings = require('./models/Settings');
const OneTimeService = require('./models/OneTimeService');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://user:pass@cluster.mongodb.net/wbi?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to DB');
  try {
    const draftId = '6a3237103844d135500a4fb9';
    const draft = await BookingDraft.findById(draftId).populate('serviceId');
    if (!draft) {
      console.log('Draft not found');
      process.exit();
    }
    
    const pricing = { packageTotal: 1000, finalAmount: 1200 }; // dummy

    const booking = new Booking({
      userId: draft.userId,
      serviceId: draft.serviceId._id,
      serviceName: draft.serviceId.name || 'Service',
      serviceCategory: draft.serviceId.category || 'Category',
      brandName: draft.brandId ? 'Selected Brand' : null,
      basePrice: pricing.packageTotal,
      finalAmount: pricing.finalAmount,
      address: {
        type: draft.address?.type || 'home',
        addressLine1: draft.address?.addressLine1 || draft.address?.address || draft.address?.line1 || 'No address line 1',
        addressLine2: draft.address?.addressLine2 || '',
        city: draft.address?.city || 'Unknown',
        state: draft.address?.state || 'Unknown',
        pincode: draft.address?.pincode || '000000',
        lat: draft.address?.lat,
        lng: draft.address?.lng
      },
      scheduledDate: draft.scheduledDate,
      scheduledTime: draft.scheduledTime,
      timeSlot: draft.timeSlot || { start: draft.scheduledTime, end: 'TBD' },
      bookingType: draft.bookingType || 'instant',
      status: 'PENDING',
      paymentStatus: 'PENDING',
    });

    try {
      await booking.validate();
      console.log('Validation passed!');
    } catch (err) {
      console.error('Validation Error:', err.message);
    }
  } catch (e) {
    console.error('Fatal Error:', e);
  }
  process.exit();
});
