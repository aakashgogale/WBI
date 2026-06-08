const SiteTestingEnquiry = require('../../models/SiteTestingEnquiry');

// CREATE an enquiry (Public App)
exports.createEnquiry = async (req, res) => {
  try {
    const newEnquiry = await SiteTestingEnquiry.create(req.body);
    
    // Notify admin clients
    if (global.io) {
      global.io.emit('newEnquiry', {
        type: 'Site Testing',
        data: newEnquiry
      });
    }

    res.status(201).json({
      success: true,
      message: 'Site Testing Enquiry submitted successfully',
      data: newEnquiry
    });
  } catch (error) {
    console.error('Error creating site testing enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET all enquiries (Admin)
exports.getEnquiries = async (req, res) => {
  try {
    const enquiries = await SiteTestingEnquiry.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: enquiries
    });
  } catch (error) {
    console.error('Error fetching site testing enquiries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET single enquiry
exports.getEnquiry = async (req, res) => {
  try {
    const enquiry = await SiteTestingEnquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error fetching site testing enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// UPDATE status (Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['New', 'Testing Scheduled', 'Testing In Progress', 'Report Generating', 'Report Sent', 'Closed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const enquiry = await SiteTestingEnquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: enquiry
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// DELETE an enquiry
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await SiteTestingEnquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
