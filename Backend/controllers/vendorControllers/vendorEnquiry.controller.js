const DynamicEnquiry = require('../../models/DynamicEnquiry');
const { getIO } = require('../../sockets');

// Fetch matched enquiries for the vendor
exports.getMatchedEnquiries = async (req, res) => {
  try {
    const vendorId = req.user._id; // Assuming req.user is populated by vendor auth
    
    // In a real scenario, this would query enquiries where this vendor was selected by the matching engine
    // For now, we fetch all 'new' enquiries
    const enquiries = await DynamicEnquiry.find({ status: 'new' }).populate('subServiceId');
    
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Vendor submits a quote
exports.submitQuote = async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const { amount, timeline, message } = req.body;
    const vendorId = req.user._id;

    const enquiry = await DynamicEnquiry.findById(enquiryId);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (enquiry.status !== 'new') {
      return res.status(400).json({ success: false, message: 'Cannot quote on this enquiry' });
    }

    const quote = {
      vendorId,
      amount,
      timeline,
      message,
      status: 'pending'
    };

    enquiry.quotes.push(quote);
    enquiry.status = 'quoted';
    await enquiry.save();

    // Notify Client
    const io = getIO();
    io.to(`client:${enquiry.clientId}`).emit('enquiry:quote_sent', {
      enquiryId: enquiry._id,
      vendorId,
      amount
    });

    res.status(200).json({ success: true, message: 'Quote submitted', data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
