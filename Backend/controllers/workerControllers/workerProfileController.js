const Worker = require('../../models/Worker');
const { validationResult } = require('express-validator');
const cloudinaryService = require('../../services/cloudinaryService');

/**
 * Get worker profile
 */
const getProfile = async (req, res) => {
  try {
    const workerId = req.user.id;

    const worker = await Worker.findById(workerId).select('-password -__v');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.status(200).json({
      success: true,
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        serviceCategories: worker.serviceCategories || [],
        serviceCategory: worker.serviceCategories?.[0] || '', // Legacy support
        skills: worker.skills || [],
        address: worker.address || null,
        rating: worker.rating || 0,
        totalJobs: worker.totalJobs || 0,
        completedJobs: worker.completedJobs || 0,
        status: worker.status,
        profilePhoto: worker.profilePhoto || null,
        settings: worker.settings || { notifications: true, language: 'en' },
        isPhoneVerified: worker.isPhoneVerified || false,
        isEmailVerified: worker.isEmailVerified || false,
        bankDetails: worker.bankDetails || {},
        documents: worker.documents || {},
        workLocations: worker.workLocations || {},
        customFields: worker.customFields || {},
        createdAt: worker.createdAt,
        updatedAt: worker.updatedAt
      }
    });
  } catch (error) {
    console.error('Get worker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile. Please try again.'
    });
  }
};

/**
 * Update worker profile
 */
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const workerId = req.user.id;
    const { name, serviceCategories, serviceCategory, skills, address, status, profilePhoto } = req.body;

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Update fields
    if (name) worker.name = name.trim();

    // Handle categories: prefer array, fallback to single legacy string
    if (serviceCategories && Array.isArray(serviceCategories)) {
      worker.serviceCategories = serviceCategories;
    } else if (serviceCategory) {
      worker.serviceCategories = [serviceCategory.trim()];
    }

    if (skills && Array.isArray(skills)) worker.skills = skills;
    if (address) {
      worker.address = {
        addressLine1: address.addressLine1 || worker.address?.addressLine1 || '',
        addressLine2: address.addressLine2 || worker.address?.addressLine2 || '',
        city: address.city || worker.address?.city || '',
        state: address.state || worker.address?.state || '',
        pincode: address.pincode || worker.address?.pincode || '',
        landmark: address.landmark || worker.address?.landmark || ''
      };
    }
    if (status) worker.status = status;
    // Update profile photo - upload to Cloudinary if it's a base64 string
    if (profilePhoto !== undefined) {
      if (profilePhoto && profilePhoto.startsWith('data:')) {
        const uploadRes = await cloudinaryService.uploadFile(profilePhoto, { folder: 'workers/profiles' });
        if (uploadRes.success) {
          worker.profilePhoto = uploadRes.url;
        }
      } else {
        worker.profilePhoto = profilePhoto;
      }
    }

    if (req.body.customFields) {
      worker.customFields = { ...worker.customFields, ...req.body.customFields };
    }

    if (req.body.settings) {
      worker.settings = {
        notifications: req.body.settings.notifications !== undefined ? req.body.settings.notifications : (worker.settings?.notifications ?? true),
        soundAlerts: req.body.settings.soundAlerts !== undefined ? req.body.settings.soundAlerts : (worker.settings?.soundAlerts ?? true),
        language: req.body.settings.language || worker.settings?.language || 'en'
      };
    }

    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        serviceCategories: worker.serviceCategories,
        serviceCategory: worker.serviceCategories?.[0] || '',
        skills: worker.skills,
        address: worker.address,
        rating: worker.rating,
        totalJobs: worker.totalJobs,
        completedJobs: worker.completedJobs,
        status: worker.status,
        profilePhoto: worker.profilePhoto, // Include in response
        settings: worker.settings,
        isPhoneVerified: worker.isPhoneVerified,
        isEmailVerified: worker.isEmailVerified,
        customFields: worker.customFields || {}
      }
    });
  } catch (error) {
    console.error('Update worker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Please try again.'
    });
  }
};

/**
 * Update worker real-time location
 */
const updateLocation = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    // Update only the location field for performance
    await Worker.findByIdAndUpdate(workerId, {
      location: { lat, lng, updatedAt: new Date() }
    });

    res.status(200).json({ success: true, message: 'Location updated' });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get profile completion percentage
 */
const getProfileCompletion = async (req, res) => {
  try {
    const workerId = req.user.id;
    const worker = await Worker.findById(workerId);
    
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    let score = 0;
    
    // Personal Info (20%)
    if (worker.name && worker.phone && worker.email && worker.address?.city) score += 20;
    
    // Bank Details (20%)
    if (worker.bankDetails?.accountNumber && worker.bankDetails?.ifscCode) score += 20;
    
    // Documents (25%)
    if (worker.documents?.aadhaar || worker.aadhar?.document) score += 25;
    
    // Work Locations (20%)
    if (worker.workLocations?.primaryArea || worker.serviceCategories?.length > 0) score += 20;
    
    // Profile Photo (15%)
    if (worker.profilePhoto) score += 15;

    res.status(200).json({ success: true, data: { completionPercentage: score } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to calculate profile completion' });
  }
};

/**
 * Update Bank Details
 */
const updateBankDetails = async (req, res) => {
  try {
    const workerId = req.user.id;
    const worker = await Worker.findByIdAndUpdate(workerId, { bankDetails: req.body }, { new: true });
    res.status(200).json({ success: true, message: 'Bank details updated', worker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update Work Locations
 */
const updateWorkLocations = async (req, res) => {
  try {
    const workerId = req.user.id;
    const worker = await Worker.findByIdAndUpdate(workerId, { workLocations: req.body }, { new: true });
    res.status(200).json({ success: true, message: 'Work locations updated', worker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update Documents
 */
const updateDocuments = async (req, res) => {
  try {
    const workerId = req.user.id;
    const worker = await Worker.findById(workerId);
    
    worker.documents = { ...worker.documents, ...req.body, status: 'Pending' };
    await worker.save();
    
    res.status(200).json({ success: true, message: 'Documents updated', worker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateLocation,
  getProfileCompletion,
  updateBankDetails,
  updateWorkLocations,
  updateDocuments
};

