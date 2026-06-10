const Engineer = require('../../models/Engineer');
const { validationResult } = require('express-validator');
const cloudinaryService = require('../../services/cloudinaryService');

/**
 * Get engineer profile
 */
const getProfile = async (req, res) => {
  try {
    const engineerId = req.user.id;

    const engineer = await Engineer.findById(engineerId).select('-password -__v');

    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    res.status(200).json({
      success: true,
      engineer: {
        id: engineer._id,
        name: engineer.name,
        email: engineer.email,
        phone: engineer.phone,
        serviceCategories: engineer.serviceCategories || [],
        serviceCategory: engineer.serviceCategories?.[0] || '', // Legacy support
        skills: engineer.skills || [],
        address: engineer.address || null,
        rating: engineer.rating || 0,
        totalJobs: engineer.totalJobs || 0,
        completedJobs: engineer.completedJobs || 0,
        status: engineer.status,
        profilePhoto: engineer.profilePhoto || null,
        settings: engineer.settings || { notifications: true, language: 'en' },
        isPhoneVerified: engineer.isPhoneVerified || false,
        isEmailVerified: engineer.isEmailVerified || false,
        bankDetails: engineer.bankDetails || {},
        documents: engineer.documents || {},
        workLocations: engineer.workLocations || {},
        customFields: engineer.customFields || {},
        createdAt: engineer.createdAt,
        updatedAt: engineer.updatedAt
      }
    });
  } catch (error) {
    console.error('Get engineer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile. Please try again.'
    });
  }
};

/**
 * Update engineer profile
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

    const engineerId = req.user.id;
    const { name, serviceCategories, serviceCategory, skills, address, status, profilePhoto } = req.body;

    const engineer = await Engineer.findById(engineerId);

    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    // Update fields
    if (name) engineer.name = name.trim();

    // Handle categories: prefer array, fallback to single legacy string
    if (serviceCategories && Array.isArray(serviceCategories)) {
      engineer.serviceCategories = serviceCategories;
    } else if (serviceCategory) {
      engineer.serviceCategories = [serviceCategory.trim()];
    }

    if (skills && Array.isArray(skills)) engineer.skills = skills;
    if (address) {
      engineer.address = {
        addressLine1: address.addressLine1 || engineer.address?.addressLine1 || '',
        addressLine2: address.addressLine2 || engineer.address?.addressLine2 || '',
        city: address.city || engineer.address?.city || '',
        state: address.state || engineer.address?.state || '',
        pincode: address.pincode || engineer.address?.pincode || '',
        landmark: address.landmark || engineer.address?.landmark || ''
      };
    }
    if (status) engineer.status = status;
    // Update profile photo - upload to Cloudinary if it's a base64 string
    if (profilePhoto !== undefined) {
      if (profilePhoto && profilePhoto.startsWith('data:')) {
        const uploadRes = await cloudinaryService.uploadFile(profilePhoto, { folder: 'engineers/profiles' });
        if (uploadRes.success) {
          engineer.profilePhoto = uploadRes.url;
        }
      } else {
        engineer.profilePhoto = profilePhoto;
      }
    }

    if (req.body.customFields) {
      engineer.customFields = { ...engineer.customFields, ...req.body.customFields };
    }

    if (req.body.settings) {
      engineer.settings = {
        notifications: req.body.settings.notifications !== undefined ? req.body.settings.notifications : (engineer.settings?.notifications ?? true),
        soundAlerts: req.body.settings.soundAlerts !== undefined ? req.body.settings.soundAlerts : (engineer.settings?.soundAlerts ?? true),
        language: req.body.settings.language || engineer.settings?.language || 'en'
      };
    }

    await engineer.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      engineer: {
        id: engineer._id,
        name: engineer.name,
        email: engineer.email,
        phone: engineer.phone,
        serviceCategories: engineer.serviceCategories,
        serviceCategory: engineer.serviceCategories?.[0] || '',
        skills: engineer.skills,
        address: engineer.address,
        rating: engineer.rating,
        totalJobs: engineer.totalJobs,
        completedJobs: engineer.completedJobs,
        status: engineer.status,
        profilePhoto: engineer.profilePhoto, // Include in response
        settings: engineer.settings,
        isPhoneVerified: engineer.isPhoneVerified,
        isEmailVerified: engineer.isEmailVerified,
        customFields: engineer.customFields || {}
      }
    });
  } catch (error) {
    console.error('Update engineer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Please try again.'
    });
  }
};

/**
 * Update engineer real-time location
 */
const updateLocation = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    // Update only the location field for performance
    await Engineer.findByIdAndUpdate(engineerId, {
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
    const engineerId = req.user.id;
    const engineer = await Engineer.findById(engineerId);
    
    if (!engineer) return res.status(404).json({ success: false, message: 'Engineer not found' });

    let score = 0;
    
    // Personal Info (20%)
    if (engineer.name && engineer.phone && engineer.email && engineer.address?.city) score += 20;
    
    // Bank Details (20%)
    if (engineer.bankDetails?.accountNumber && engineer.bankDetails?.ifscCode) score += 20;
    
    // Documents (25%)
    if (engineer.documents?.aadhaar || engineer.aadhar?.document) score += 25;
    
    // Work Locations (20%)
    if (engineer.workLocations?.primaryArea || engineer.serviceCategories?.length > 0) score += 20;
    
    // Profile Photo (15%)
    if (engineer.profilePhoto) score += 15;

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
    const engineerId = req.user.id;
    const engineer = await Engineer.findByIdAndUpdate(engineerId, { bankDetails: req.body }, { new: true });
    res.status(200).json({ success: true, message: 'Bank details updated', engineer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update Work Locations
 */
const updateWorkLocations = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const engineer = await Engineer.findByIdAndUpdate(engineerId, { workLocations: req.body }, { new: true });
    res.status(200).json({ success: true, message: 'Work locations updated', engineer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update Documents
 */
const updateDocuments = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const engineer = await Engineer.findById(engineerId);
    
    engineer.documents = { ...engineer.documents, ...req.body, status: 'Pending' };
    await engineer.save();
    
    res.status(200).json({ success: true, message: 'Documents updated', engineer });
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

