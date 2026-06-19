const Coupon = require('../../models/Coupon');
const BookingDraft = require('../../models/BookingDraft');

exports.validateCoupon = async (req, res) => {
  try {
    const { code, draftId } = req.body;

    const draft = await BookingDraft.findById(draftId);
    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Coupon is not active' });
    }

    if (coupon.validUntil && new Date() > new Date(coupon.validUntil)) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    // Assign to draft and return
    draft.couponId = coupon._id;
    await draft.save();

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
