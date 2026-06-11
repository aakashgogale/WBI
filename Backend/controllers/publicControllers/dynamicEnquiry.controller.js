const DynamicEnquiry = require('../../models/DynamicEnquiry');
const DynamicFormConfig = require('../../models/DynamicFormConfig');
const SubService = require('../../models/SubService');
const { vendorMatchingQueue } = require('../../jobs/queueSetup');

// Public API to fetch the form config for a subservice
exports.getFormConfig = async (req, res) => {
  try {
    const { subServiceId } = req.params;
    const config = await DynamicFormConfig.findOne({ subServiceId, isActive: true });
    
    if (!config) {
      return res.status(404).json({ success: false, message: 'Form configuration not found' });
    }

    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Client API to submit an enquiry
exports.submitEnquiry = async (req, res) => {
  try {
    const { subServiceId, formData, location, urgency } = req.body;
    
    // Validate subservice exists
    const subService = await SubService.findById(subServiceId);
    if (!subService) {
      return res.status(404).json({ success: false, message: 'Sub-service not found' });
    }

    // Assume req.user is set by auth middleware
    const clientId = req.user._id;

    // Create the enquiry
    const enquiry = new DynamicEnquiry({
      clientId,
      subServiceId,
      formData,
      location,
      urgency,
      status: 'new'
    });

    await enquiry.save();

    // Trigger BullMQ Vendor Matching Job
    await vendorMatchingQueue.add('match-vendors', { enquiryId: enquiry._id });

    res.status(201).json({ 
      success: true, 
      message: 'Enquiry submitted successfully. Matching vendors...',
      data: enquiry 
    });

  } catch (error) {
    console.error('[submitEnquiry Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const WorkOrder = require('../../models/WorkOrder');

// Client accepts a quote
exports.acceptQuote = async (req, res) => {
  try {
    const { enquiryId, quoteId } = req.params;
    const clientId = req.user._id;

    const enquiry = await DynamicEnquiry.findOne({ _id: enquiryId, clientId });
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const quote = enquiry.quotes.id(quoteId);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    // Mark quote as accepted
    quote.status = 'accepted';
    enquiry.status = 'converted';
    
    // Reject other quotes
    enquiry.quotes.forEach(q => {
      if (q._id.toString() !== quoteId) q.status = 'rejected';
    });

    await enquiry.save();

    // Create Work Order
    const workOrder = new WorkOrder({
      enquiryId: enquiry._id,
      userId: clientId,
      vendorId: quote.vendorId,
      subServiceId: enquiry.subServiceId,
      status: 'confirmed',
      urgency: enquiry.urgency,
      scheduledDate: new Date(), // Should come from req.body based on accepted timeline
      amount: quote.amount,
      timeline: [{ status: 'confirmed' }]
    });

    await workOrder.save();

    // Notify Vendor
    const { getIO } = require('../../sockets');
    const io = getIO();
    io.to(`vendor:${quote.vendorId}`).emit('enquiry:quote_accepted', {
      enquiryId: enquiry._id,
      workOrderId: workOrder._id
    });

    res.status(200).json({ success: true, message: 'Quote accepted and Work Order created', data: workOrder });
  } catch (error) {
    console.error('[acceptQuote Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
