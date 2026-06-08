const VsatService = require('../../models/VsatService');

// CREATE an enquiry (Public App)
exports.createEnquiry = async (req, res) => {
  try {
    const newEnquiry = await VsatService.create(req.body);
    
    // Notify admin clients
    if (global.io) {
      global.io.emit('newEnquiry', {
        type: 'VSAT Service',
        data: newEnquiry
      });
    }

    res.status(201).json({
      success: true,
      message: 'VSAT Service Enquiry submitted successfully',
      data: newEnquiry
    });
  } catch (error) {
    console.error('Error creating VSAT service enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET all enquiries (Admin)
exports.getEnquiries = async (req, res) => {
  try {
    const enquiries = await VsatService.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: enquiries
    });
  } catch (error) {
    console.error('Error fetching VSAT service enquiries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET single enquiry
exports.getEnquiry = async (req, res) => {
  try {
    const enquiry = await VsatService.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error fetching VSAT service enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// UPDATE status (Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['New', 'Technician Assigned', 'In Progress', 'Completed', 'Closed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const enquiry = await VsatService.findByIdAndUpdate(
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
    const enquiry = await VsatService.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
