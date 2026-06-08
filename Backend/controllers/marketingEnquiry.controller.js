const MarketingEnquiry = require('../models/MarketingEnquiry');

exports.submitEnquiry = async (req, res) => {
  try {
    const enquiry = await MarketingEnquiry.create(req.body);
    res.status(201).json({ success: true, message: 'Enquiry submitted successfully', data: enquiry });
  } catch (error) {
    console.error('Error submitting marketing enquiry:', error);
    res.status(400).json({ success: false, message: 'Failed to submit enquiry', error: error.message });
  }
};

exports.getEnquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;

    const total = await MarketingEnquiry.countDocuments(query);
    const enquiries = await MarketingEnquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true, count: enquiries.length, total,
      totalPages: Math.ceil(total / limit), currentPage: page,
      data: enquiries,
    });
  } catch (error) {
    console.error('Error fetching marketing enquiries:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.getEnquiry = async (req, res) => {
  try {
    const enquiry = await MarketingEnquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error fetching marketing enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const enquiry = await MarketingEnquiry.findByIdAndUpdate(
      req.params.id, { status, notes }, { new: true, runValidators: true }
    );
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.status(200).json({ success: true, message: 'Enquiry status updated', data: enquiry });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(400).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await MarketingEnquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.status(200).json({ success: true, message: 'Enquiry deleted' });
  } catch (error) {
    console.error('Error deleting marketing enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
