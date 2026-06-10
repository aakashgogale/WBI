const Engineer = require('../../models/Engineer');
const Booking = require('../../models/Booking');
const { validationResult } = require('express-validator');
const { WORKER_STATUS, BOOKING_STATUS, VENDOR_STATUS } = require('../../utils/constants');
const { createNotification } = require('../notificationControllers/notificationController');

/**
 * Get all engineers with filters and pagination
 */
const getAllEngineers = async (req, res) => {
  try {
    const {
      search,
      approvalStatus,
      isActive,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};

    if (approvalStatus) {
      query.approvalStatus = approvalStatus;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search by name, email, phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { serviceCategory: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get engineers
    const engineers = await Engineer.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Engineer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: engineers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all engineers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch engineers. Please try again.'
    });
  }
};

/**
 * Get engineer details
 */
const getEngineerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const engineer = await Engineer.findById(id).select('-password');

    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    // Get engineer booking stats
    const jobStats = await Booking.aggregate([
      {
        $match: { engineerId: engineer._id }
      },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          completedJobs: {
            $sum: {
              $cond: [{ $eq: ['$status', BOOKING_STATUS.COMPLETED] }, 1, 0]
            }
          },
          // Assuming engineers might get paid or we just track job value
          totalJobValue: {
            $sum: '$finalAmount'
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        engineer,
        stats: jobStats[0] || {
          totalJobs: 0,
          completedJobs: 0,
          totalJobValue: 0
        }
      }
    });
  } catch (error) {
    console.error('Get engineer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch engineer details. Please try again.'
    });
  }
};

/**
 * Approve engineer registration
 */
const approveEngineer = async (req, res) => {
  try {
    const { id } = req.params;

    const engineer = await Engineer.findById(id);

    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    engineer.approvalStatus = 'approved';
    engineer.isActive = true;
    await engineer.save();

    // Send notification to engineer
    /*
    // Note: Assuming notification system supports 'engineer' type or we treat them as users for now
    await createNotification({
      userId: engineer._id, // Use userId for engineers too? or need separate engineerId field in notification
      type: 'engineer_approved',
      title: 'Engineer Registration Approved',
      message: 'Your engineer registration has been approved.',
      relatedId: engineer._id,
      relatedType: 'engineer'
    });
    */

    res.status(200).json({
      success: true,
      message: 'Engineer approved successfully',
      data: engineer
    });
  } catch (error) {
    console.error('Approve engineer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve engineer. Please try again.'
    });
  }
};

/**
 * Reject engineer registration
 */
const rejectEngineer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const engineer = await Engineer.findById(id);

    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    engineer.approvalStatus = 'rejected';
    engineer.isActive = false;
    // engineer.rejectedReason = reason; // If we want to store reason
    await engineer.save();

    res.status(200).json({
      success: true,
      message: 'Engineer rejected successfully',
      data: engineer
    });
  } catch (error) {
    console.error('Reject engineer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject engineer. Please try again.'
    });
  }
};

/**
 * Suspend engineer
 */
const suspendEngineer = async (req, res) => {
  try {
    const { id } = req.params;

    const engineer = await Engineer.findById(id);

    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    engineer.approvalStatus = 'suspended';
    engineer.isActive = false;
    await engineer.save();

    res.status(200).json({
      success: true,
      message: 'Engineer suspended successfully',
      data: engineer
    });
  } catch (error) {
    console.error('Suspend engineer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend engineer. Please try again.'
    });
  }
};

/**
 * Get engineer jobs
 */
const getEngineerJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { engineerId: id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Booking.find(query)
      .populate('userId', 'name phone')
      .populate('serviceId', 'title iconUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get engineer jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch engineer jobs.'
    });
  }
};

/**
 * Get engineer earnings
 */
const getEngineerEarnings = async (req, res) => {
  // Placeholder for now, can be expanded if we track granular engineer earnings
  res.status(200).json({
    success: true,
    data: {
      totalEarnings: 0
    }
  });
};

/**
 * Pay engineer manually
 */
const payEngineer = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reference, notes } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }

    const engineer = await Engineer.findById(id);
    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    // Update wallet balance
    // Assuming balance is amount owed to Admin? 
    // Usually admin pays engineer, so engineer balance increases or decreases?
    // In this system, vendor owes admin (negative balance).
    // For engineers, positive balance probably means earnings they can withdraw.
    // If admin pays them, it should reduce their pending balance or just reflect as a transaction.
    // If the user says "pay engineer", it usually means adding money to their wallet or clearing dues.

    if (!engineer.wallet) engineer.wallet = { balance: 0 };
    engineer.wallet.balance += parseFloat(amount);

    await engineer.save();

    res.status(200).json({
      success: true,
      message: `Successfully recorded payment of ₹${amount} to ${engineer.name}`,
      data: {
        balance: engineer.wallet.balance
      }
    });
  } catch (error) {
    console.error('Pay engineer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment. Please try again.'
    });
  }
};

/**
 * Get all engineer jobs (global)
 */
const getAllEngineerJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = { engineerId: { $exists: true, $ne: null } };
    if (status) {
      query.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // If search is provided, we need to find engineers by name first
    if (search) {
      const engineers = await Engineer.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const engineerIds = engineers.map(w => w._id);
      query.engineerId = { $in: engineerIds };
    }

    const jobs = await Booking.find(query)
      .populate('engineerId', 'name phone profileImage')
      .populate('userId', 'name phone')
      .populate('serviceId', 'title iconUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all engineer jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all engineer jobs.'
    });
  }
};

/**
 * Get engineer payments summary
 */
const getEngineerPaymentsSummary = async (req, res) => {
  try {
    // For now, return engineers with non-zero balances or recent job activity
    const engineers = await Engineer.find({
      'wallet.balance': { $exists: true }
    })
      .select('name phone wallet email serviceCategory approvalStatus')
      .sort({ 'wallet.balance': -1 });

    res.status(200).json({
      success: true,
      data: engineers
    });
  } catch (error) {
    console.error('Get engineer payments summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch engineer payments summary.'
    });
  }
};

/**
 * Toggle engineer active status
 */
const toggleEngineerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body; // Expecting { isActive: true/false }

    const engineer = await Engineer.findById(id);

    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    engineer.isActive = isActive;
    await engineer.save();

    res.status(200).json({
      success: true,
      message: `Engineer ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: engineer
    });
  } catch (error) {
    console.error('Toggle engineer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update engineer status'
    });
  }
};

/**
 * Delete engineer details
 */
const deleteEngineer = async (req, res) => {
  try {
    const { id } = req.params;

    const engineer = await Engineer.findByIdAndDelete(id);

    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Engineer deleted successfully'
    });
  } catch (error) {
    console.error('Delete engineer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete engineer'
    });
  }
};

module.exports = {
  getAllEngineers,
  getEngineerDetails,
  approveEngineer,
  rejectEngineer,
  suspendEngineer,
  getEngineerJobs,
  getEngineerEarnings,
  payEngineer,
  getAllEngineerJobs,
  getEngineerPaymentsSummary,
  toggleEngineerStatus,
  deleteEngineer
};
