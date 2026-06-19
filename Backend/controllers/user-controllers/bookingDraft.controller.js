const BookingDraft = require('../../models/BookingDraft');
const Coupon = require('../../models/Coupon');
const OneTimeService = require('../../models/OneTimeService');
const ServicePackage = require('../../models/ServicePackage');
const Settings = require('../../models/Settings');

/**
 * Recalculate pricing for a draft dynamically
 */
const calculatePricing = async (draft) => {
  let packageTotal = 0;

  // Simulate pricing calculation dynamically
  if (draft.packageIds && draft.packageIds.length > 0) {
    const packages = await ServicePackage.find({ _id: { $in: draft.packageIds } });
    packages.forEach(pkg => {
      const qty = draft.quantities.get(pkg._id.toString()) || 1;
      packageTotal += (pkg.price || 0) * qty;
    });
  }

  // Fetch admin settings dynamically
  const settings = await Settings.findOne({ type: 'global' });
  const visitCharge = settings ? settings.visitedCharges : 199;
  const platformFee = 30; // Assuming fixed fee or could be derived from settings.platformFeePercentage if needed
  let surgeCharge = 0;
  let emergencyCharge = 0;
  let convenienceFee = 0;
  let discount = 0;
  let couponDiscount = 0;

  const subtotal = packageTotal + visitCharge + platformFee + surgeCharge + emergencyCharge + convenienceFee;
  const gstRate = settings ? settings.serviceGstPercentage / 100 : 0.18;
  const gst = subtotal * gstRate;

  // Apply Coupon if valid
  if (draft.couponId) {
    const coupon = await Coupon.findById(draft.couponId);
    if (coupon && coupon.isActive && subtotal >= coupon.minOrderValue) {
      if (coupon.discountType === 'percentage') {
        couponDiscount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount) {
          couponDiscount = Math.min(couponDiscount, coupon.maxDiscountAmount);
        }
      } else {
        couponDiscount = coupon.discountValue;
      }
    } else {
      // Coupon invalid, remove it
      draft.couponId = null;
    }
  }

  const finalAmount = (subtotal + gst) - discount - couponDiscount;

  return {
    packageTotal,
    visitCharge,
    platformFee,
    gst,
    discount,
    couponDiscount,
    surgeCharge,
    emergencyCharge,
    convenienceFee,
    finalAmount: Math.max(0, finalAmount),
    itemCount: draft.packageIds.length
  };
};

/**
 * Get the full review details for a Booking Draft
 */
exports.getReviewDraft = async (req, res) => {
  try {
    const { draftId } = req.params;

    const draft = await BookingDraft.findById(draftId)
      .populate('serviceId', 'name description icon')
      .populate('brandId', 'brandName icon')
      .populate('issueIds', 'title')
      .populate('packageIds', 'name price')
      .populate('couponId', 'code discountType discountValue');

    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    // Ensure pricing is up to date before returning
    const pricing = await calculatePricing(draft);
    draft.priceSnapshot = pricing;
    await draft.save();

    // Mock vendor data for demonstration
    // If a service has vendors, populate vendorInfo
    if (!draft.vendorInfo || !draft.vendorInfo.vendorId) {
       draft.vendorInfo = {
         name: "Acme Services",
         rating: 4.8,
         jobsCompleted: 154,
         verified: true,
         supportNumber: "+91 9876543210"
       };
    }

    res.status(200).json({
      success: true,
      data: draft
    });
  } catch (error) {
    console.error('Error fetching review draft:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update the Draft (instructions, notes, etc.)
 */
exports.updateDraft = async (req, res) => {
  try {
    const { draftId } = req.params;
    const { specialInstructions, gatePassInfo, parkingInfo, societyRules, petInfo, couponId } = req.body;

    const draft = await BookingDraft.findById(draftId);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    if (specialInstructions !== undefined) draft.specialInstructions = specialInstructions;
    if (gatePassInfo !== undefined) draft.gatePassInfo = gatePassInfo;
    if (parkingInfo !== undefined) draft.parkingInfo = parkingInfo;
    if (societyRules !== undefined) draft.societyRules = societyRules;
    if (petInfo !== undefined) draft.petInfo = petInfo;
    if (couponId !== undefined) draft.couponId = couponId;

    // Recalculate if coupon changed
    const pricing = await calculatePricing(draft);
    draft.priceSnapshot = pricing;

    await draft.save();

    res.status(200).json({ success: true, data: draft });
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Confirm and Prepare Booking
 */
exports.confirmReview = async (req, res) => {
  try {
    const { draftId } = req.body;

    const draft = await BookingDraft.findById(draftId).populate('serviceId');
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    // Validation
    if (!draft.address) {
      return res.status(400).json({ success: false, message: 'Address is required' });
    }
    if (!draft.scheduledDate || !draft.scheduledTime) {
      return res.status(400).json({ success: false, message: 'Schedule is required' });
    }

    // Create the actual Booking document
    const Booking = require('../../models/Booking');
    const pricing = await calculatePricing(draft);

    const booking = new Booking({
      userId: draft.userId,
      serviceId: draft.serviceId._id,
      serviceName: draft.serviceId.name || 'Service',
      serviceCategory: draft.serviceId.category || 'Category',
      brandName: draft.brandId ? 'Selected Brand' : null, // ideally fetch actual brand
      basePrice: pricing.packageTotal,
      finalAmount: pricing.finalAmount,
      address: {
        type: draft.address.type || 'home',
        addressLine1: draft.address.addressLine1 || draft.address.address || draft.address.line1 || 'No address line 1',
        addressLine2: draft.address.addressLine2 || '',
        city: draft.address.city || 'Unknown',
        state: draft.address.state || 'Unknown',
        pincode: draft.address.pincode || '000000',
        lat: draft.address.lat,
        lng: draft.address.lng
      },
      scheduledDate: draft.scheduledDate,
      scheduledTime: draft.scheduledTime,
      timeSlot: draft.timeSlot || { start: draft.scheduledTime, end: 'TBD' },
      bookingType: draft.bookingType || 'scheduled',
      status: 'pending', // Will be updated by matching service
      paymentStatus: 'pending',
    });

    await booking.save();

    // Convert draft status
    draft.status = 'converted';
    await draft.save();

    // Instead of old matchingService, use the new WaveManagerService (Urban Company style)
    const WaveManagerService = require('../../services/WaveManagerService');
    
    // Find nearby workers within 10km
    const waves = await WaveManagerService.findAndGroupWorkers(
      booking.address.lat,
      booking.address.lng,
      10
    );

    if (waves.length === 0) {
      // No workers found
      booking.status = 'admin_action_required';
      if (!booking.adminLog) booking.adminLog = [];
      booking.adminLog.push({
        action: 'No Workers Found',
        reason: 'No online workers found within radius upon creation.',
        timestamp: new Date()
      });
      await booking.save();
    } else {
      // Set potential workers and start wave 1
      booking.potentialWorkers = waves.flat();
      booking.status = 'searching_worker';
      await booking.save();

      // Dispatch Wave 1 asynchronously so we don't block the response
      WaveManagerService.dispatchWave(booking._id.toString(), 1).catch(err => {
        console.error('[WaveManagerService Error]', err);
      });
    }

    res.status(200).json({
      success: true,
      bookingId: booking._id,
      message: waves.length === 0 ? 'Booking created but no workers available. Admin notified.' : 'Booking created. Searching for technicians...'
    });
  } catch (error) {
    console.error('Error confirming review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Short-polling live-check
 */
exports.liveCheck = async (req, res) => {
  try {
    const { draftId } = req.params;
    
    // In a real scenario, this checks redis/database for changes
    res.status(200).json({
      success: true,
      data: {
         slotAvailable: true,
         workerAvailable: true,
         pricingChanged: false,
         timestamp: Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
