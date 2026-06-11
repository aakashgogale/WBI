const WorkOrder = require('../../models/WorkOrder');
const { getIO } = require('../../sockets');
const { getRedis } = require('../../services/redisService');
const crypto = require('crypto');

// Engineer accepts or rejects the job
exports.respondToAssignment = async (req, res) => {
  try {
    const { workOrderId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const engineerId = req.user._id;

    const workOrder = await WorkOrder.findOne({ _id: workOrderId, engineerId });
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    if (status === 'accepted') {
      workOrder.status = 'engineer_accepted';
      workOrder.timeline.push({ status: 'engineer_accepted', timestamp: new Date() });
      await workOrder.save();

      // Notify Client & Vendor
      const io = getIO();
      io.to(`client:${workOrder.userId}`).emit('job:engineer_accepted', { workOrderId: workOrder._id });
      io.to(`vendor:${workOrder.vendorId}`).emit('job:engineer_accepted', { workOrderId: workOrder._id });

      res.status(200).json({ success: true, message: 'Job accepted', data: workOrder });
    } else {
      // Logic to re-assign or put back in pool
      workOrder.engineerId = null;
      workOrder.status = 'confirmed'; // Revert status
      await workOrder.save();
      
      // Notify vendor admin
      const io = getIO();
      io.to(`vendor:${workOrder.vendorId}`).emit('job:engineer_rejected', { workOrderId: workOrder._id });

      res.status(200).json({ success: true, message: 'Job rejected' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Job Status
exports.updateStatus = async (req, res) => {
  try {
    const { workOrderId } = req.params;
    const { status } = req.body; // 'en_route', 'arrived', 'in_progress'
    const engineerId = req.user._id;

    const workOrder = await WorkOrder.findOne({ _id: workOrderId, engineerId });
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    workOrder.status = status;
    workOrder.timeline.push({ status, timestamp: new Date() });

    if (status === 'arrived') {
      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save OTP to Redis with 15 mins TTL
      const redis = getRedis();
      if (redis) {
        await redis.setex(`otp:${workOrder._id}`, 900, JSON.stringify({ code: otpCode, attempts: 0 }));
      } else {
        // Fallback to DB if Redis is down
        workOrder.otp = { code: otpCode, attempts: 0, expiresAt: new Date(Date.now() + 15 * 60000) };
      }

      // TODO: In real implementation, send SMS via MSG91/Twilio to Client
      console.log(`[OTP Generated] OTP for WorkOrder ${workOrder._id} is ${otpCode}`);

      const io = getIO();
      io.to(`client:${workOrder.userId}`).emit('job:arrived', { workOrderId: workOrder._id });
    }

    await workOrder.save();
    
    // Broadcast status update
    const io = getIO();
    io.to(`job:${workOrder._id}`).emit(`job:${status}`, { workOrderId: workOrder._id });

    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: workOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { workOrderId } = req.params;
    const { otp } = req.body;
    const engineerId = req.user._id;

    const workOrder = await WorkOrder.findOne({ _id: workOrderId, engineerId });
    if (!workOrder) return res.status(404).json({ success: false, message: 'Work order not found' });

    let isValid = false;
    let attempts = 0;

    const redis = getRedis();
    if (redis) {
      const otpDataStr = await redis.get(`otp:${workOrder._id}`);
      if (!otpDataStr) return res.status(400).json({ success: false, message: 'OTP expired or not found' });
      
      const otpData = JSON.parse(otpDataStr);
      attempts = otpData.attempts + 1;

      if (otpData.code === otp) {
        isValid = true;
        await redis.del(`otp:${workOrder._id}`);
      } else {
        await redis.setex(`otp:${workOrder._id}`, 900, JSON.stringify({ ...otpData, attempts }));
      }
    } else {
      if (!workOrder.otp || workOrder.otp.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: 'OTP expired or not found' });
      }
      attempts = workOrder.otp.attempts + 1;
      if (workOrder.otp.code === otp) {
        isValid = true;
        workOrder.otp = undefined; // Clear OTP
      } else {
        workOrder.otp.attempts = attempts;
        await workOrder.save();
      }
    }

    if (!isValid) {
      if (attempts >= 3) {
        // Notify admin after 3 failed attempts
        const io = getIO();
        io.to(`vendor:${workOrder.vendorId}`).emit('job:otp_failed_max', { workOrderId: workOrder._id });
      }
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP Valid
    workOrder.status = 'otp_verified';
    workOrder.timeline.push({ status: 'otp_verified', timestamp: new Date() });
    
    // Pre-fill checklist from JobChecklistConfig
    const JobChecklistConfig = require('../../models/JobChecklistConfig');
    const config = await JobChecklistConfig.findOne({ subServiceId: workOrder.subServiceId });
    if (config) {
      workOrder.checklistProgress = config.items.map(item => ({
        taskId: item._id,
        taskName: item.task,
        status: 'pending'
      }));
    }

    await workOrder.save();

    const io = getIO();
    io.to(`job:${workOrder._id}`).emit('job:otp_verified', { workOrderId: workOrder._id });

    res.status(200).json({ success: true, message: 'OTP Verified, Job Unlocked', data: workOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Checklist Item
exports.updateChecklistItem = async (req, res) => {
  try {
    const { workOrderId, taskId } = req.params;
    const { status, notes, photoUrl } = req.body; // In a real app, use multer to upload photo directly here
    const engineerId = req.user._id;

    const workOrder = await WorkOrder.findOne({ _id: workOrderId, engineerId });
    if (!workOrder) return res.status(404).json({ success: false, message: 'Work order not found' });

    const task = workOrder.checklistProgress.find(t => t.taskId === taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Checklist task not found' });

    task.status = status || task.status;
    task.notes = notes || task.notes;
    if (photoUrl) {
      task.photos.push(photoUrl);
    }

    await workOrder.save();

    const io = getIO();
    io.to(`vendor:${workOrder.vendorId}`).emit('job:checklist_updated', { workOrderId: workOrder._id, taskId, task });

    res.status(200).json({ success: true, message: 'Checklist updated', data: workOrder.checklistProgress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Invoice = require('../../models/Invoice');
const razorpayService = require('../../services/razorpayService');

// Complete Job & Auto-generate Invoice
exports.completeJob = async (req, res) => {
  try {
    const { workOrderId } = req.params;
    const { notes, photos, materialsUsed } = req.body;
    const engineerId = req.user._id;

    const workOrder = await WorkOrder.findOne({ _id: workOrderId, engineerId }).populate('vendorId subServiceId userId');
    if (!workOrder) return res.status(404).json({ success: false, message: 'Work order not found' });

    // Enforce mandatory checklists
    const incompleteMandatory = workOrder.checklistProgress.filter(t => t.status !== 'done'); // Simplified check
    if (incompleteMandatory.length > 0) {
      return res.status(400).json({ success: false, message: 'Complete all checklist items first' });
    }

    if (!photos || photos.length < 2) {
      return res.status(400).json({ success: false, message: 'Minimum 2 completion photos required' });
    }

    workOrder.status = 'completed';
    workOrder.timeline.push({ status: 'completed', timestamp: new Date() });
    workOrder.completionData = { notes, photos, materialsUsed };
    workOrder.completedDate = new Date();
    await workOrder.save();

    // Calculate Totals
    const materialCost = materialsUsed ? materialsUsed.reduce((sum, item) => sum + (item.quantity * item.rate), 0) : 0;
    const labourCost = workOrder.subServiceId.basePricing || workOrder.amount || 0;
    const subtotal = materialCost + labourCost;
    const tax = subtotal * 0.18; // 18% GST assumption
    const total = subtotal + tax;

    // Create Invoice
    const invoice = new Invoice({
      vendorId: workOrder.vendorId._id,
      userId: workOrder.userId._id,
      workOrderId: workOrder._id,
      amount: subtotal,
      tax,
      total,
      status: 'Sent',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Generate Razorpay Order
    const rpOrder = await razorpayService.createOrder(total, 'INR', `receipt_${invoice._id}`);
    if (rpOrder.success) {
      invoice.razorpayPaymentId = rpOrder.orderId;
      // You could also generate a payment link via API here if needed
    }

    // TODO: Generate PDF and upload to S3, set invoice.pdfUrl

    await invoice.save();

    // Update WorkOrder status to invoice_sent
    workOrder.status = 'invoice_sent';
    workOrder.timeline.push({ status: 'invoice_sent', timestamp: new Date() });
    await workOrder.save();

    const io = getIO();
    io.to(`client:${workOrder.userId._id}`).emit('job:completed', { workOrderId: workOrder._id });
    io.to(`client:${workOrder.userId._id}`).emit('invoice:generated', { invoiceId: invoice._id });
    io.to(`vendor:${workOrder.vendorId._id}`).emit('job:completed', { workOrderId: workOrder._id });

    res.status(200).json({ success: true, message: 'Job completed and invoice generated', data: workOrder });
  } catch (error) {
    console.error('[completeJob Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
