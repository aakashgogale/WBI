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
        secondarySkills: worker.secondarySkills || [],
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
    const { 
      name, serviceCategories, serviceCategory, skills, secondarySkills, address, status, profilePhoto,
      dob, gender, bankDetails, documents, workLocations, uploadedDocuments, aadhar 
    } = req.body;

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Update fields
    if (name) worker.name = name.trim();
    if (req.body.email) {
      worker.email = req.body.email.trim();
    } else if (req.body.email === '') {
      worker.email = undefined;
    }

    // Handle categories: prefer array, fallback to single legacy string
    if (serviceCategories && Array.isArray(serviceCategories)) {
      worker.serviceCategories = serviceCategories;
    } else if (serviceCategory) {
      worker.serviceCategories = [serviceCategory.trim()];
    }

    if (skills && Array.isArray(skills)) worker.skills = skills;
    if (secondarySkills && Array.isArray(secondarySkills)) worker.secondarySkills = secondarySkills;
    if (address) {
      worker.address = {
        addressLine1: address.addressLine1 || worker.address?.addressLine1 || '',
        addressLine2: address.addressLine2 || worker.address?.addressLine2 || '',
        city: address.city || worker.address?.city || '',
        state: address.state || worker.address?.state || '',
        pincode: address.pincode || worker.address?.pincode || '',
        landmark: address.landmark || worker.address?.landmark || '',
        fullAddress: address.fullAddress || worker.address?.fullAddress || ''
      };
    }
    if (status) worker.status = status;
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

    if (dob !== undefined) worker.dob = dob;
    if (gender !== undefined) worker.gender = gender;
    
    if (bankDetails) {
      worker.bankDetails = { ...worker.bankDetails, ...bankDetails };
    }
    
    if (documents) {
      worker.documents = { ...worker.documents, ...documents };
    }
    
    if (workLocations) {
      worker.workLocations = { ...worker.workLocations, ...workLocations };
    }
    
    if (uploadedDocuments) {
      worker.uploadedDocuments = uploadedDocuments;
    }
    
    if (aadhar) {
      worker.aadhar = { ...worker.aadhar, ...aadhar };
    }

    if (req.body.customFields) {
      let currentCustomFields = {};
      if (worker.customFields) {
        currentCustomFields = worker.customFields instanceof Map 
          ? Object.fromEntries(worker.customFields) 
          : worker.customFields;
      }
      worker.customFields = { ...currentCustomFields, ...req.body.customFields };
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
        secondarySkills: worker.secondarySkills || [],
        address: worker.address,
        rating: worker.rating,
        totalJobs: worker.totalJobs,
        completedJobs: worker.completedJobs,
        status: worker.status,
        profilePhoto: worker.profilePhoto, // Include in response
        settings: worker.settings,
        isPhoneVerified: worker.isPhoneVerified,
        isEmailVerified: worker.isEmailVerified,
        customFields: worker.customFields || {},
        dob: worker.dob,
        gender: worker.gender,
        bankDetails: worker.bankDetails,
        documents: worker.documents,
        workLocations: worker.workLocations,
        uploadedDocuments: worker.uploadedDocuments,
        aadhar: worker.aadhar
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
    const worker = await Worker.findByIdAndUpdate(
      req.user.id,
      { 
        location: { 
          type: 'Point',
          coordinates: [lng, lat], 
          updatedAt: new Date() 
        } 
      },
      { new: true, runValidators: true }
    );
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
    if (worker.name && worker.phone && (worker.email || worker.address?.city)) score += 20;
    
    // Bank Details (15%)
    if (worker.bankDetails?.accountNumber && worker.bankDetails?.ifscCode) score += 15;
    
    // Documents (20%)
    if (worker.documents?.aadhaar || worker.aadhar?.document || (worker.uploadedDocuments && worker.uploadedDocuments.length > 0)) score += 20;
    
    // Work Locations (15%)
    if (worker.workLocations?.primaryArea || worker.serviceCategories?.length > 0 || (worker.workLocations?.availableCities && worker.workLocations.availableCities.length > 0)) score += 15;
    
    // Profile Photo (15%)
    if (worker.profilePhoto) score += 15;

    // Custom Details (15%)
    // Calculate dynamically based on required FormConfig fields
    const FormConfig = require('../../models/FormConfig');
    try {
      const requiredDynamicFields = await FormConfig.find({ 
        role: 'worker', 
        required: true 
      });

      let customFieldsScore = 0;
      if (requiredDynamicFields.length > 0) {
        let filledRequiredFields = 0;
        
        // Convert customFields to a plain object
        let customFieldsObj = {};
        if (worker.customFields) {
          customFieldsObj = worker.customFields instanceof Map 
            ? Object.fromEntries(worker.customFields) 
            : worker.customFields;
        }

        requiredDynamicFields.forEach(field => {
          const value = customFieldsObj[field.fieldKey];
          if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
            filledRequiredFields++;
          }
        });

        // Add proportional score (max 15%)
        customFieldsScore = Math.floor((filledRequiredFields / requiredDynamicFields.length) * 15);
      } else {
        // Fallback
        const hasCustomFields = worker.customFields && (
          (worker.customFields instanceof Map && worker.customFields.size > 0) || 
          (typeof worker.customFields === 'object' && Object.keys(worker.customFields).length > 0)
        );
        if (hasCustomFields) customFieldsScore = 15;
      }
      score += customFieldsScore;
    } catch (err) {
      console.error('Error calculating dynamic customFields score:', err);
      // Fallback
      const hasCustomFields = worker.customFields && (
        (worker.customFields instanceof Map && worker.customFields.size > 0) || 
        (typeof worker.customFields === 'object' && Object.keys(worker.customFields).length > 0)
      );
      if (hasCustomFields) score += 15;
    }

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

/**
 * Update worker skills profile (structured sub-services)
 */
const updateSkillsProfile = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { subServices, serviceCategories } = req.body;

    if (!Array.isArray(subServices)) {
      return res.status(400).json({
        success: false,
        message: 'subServices must be an array'
      });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Process subServices
    const updatedSubServices = subServices.map(item => {
      // Find matching existing subservice to preserve customSkills status
      const existingSubService = worker.subServices.find(
        s => s.subServiceId.toString() === item.subServiceId.toString()
      );
      
      const existingCustomSkills = existingSubService ? existingSubService.customSkills : [];
      
      // Process customSkills
      const customSkillsPayload = item.customSkills || [];
      const processedCustomSkills = customSkillsPayload.map(cs => {
        const skillName = typeof cs === 'string' ? cs.trim() : (cs.name ? cs.name.trim() : '');
        if (!skillName) return null;

        const existing = existingCustomSkills.find(
          ecs => ecs.name.toLowerCase() === skillName.toLowerCase()
        );

        if (existing) {
          return {
            _id: existing._id,
            name: existing.name,
            status: existing.status
          };
        } else {
          return {
            name: skillName,
            status: 'pending'
          };
        }
      }).filter(Boolean);

      return {
        subServiceId: item.subServiceId,
        name: item.name,
        skills: item.skills || [],
        customSkills: processedCustomSkills,
        tools: item.tools || [],
        experienceLevel: item.experienceLevel || '',
        yearsOfExperience: item.yearsOfExperience || 0
      };
    });

    worker.subServices = updatedSubServices;
    
    if (serviceCategories && Array.isArray(serviceCategories)) {
      worker.serviceCategories = serviceCategories;
    }
    
    if (req.body.secondarySkills && Array.isArray(req.body.secondarySkills)) {
      worker.secondarySkills = req.body.secondarySkills;
    }

    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Skills profile updated successfully',
      subServices: worker.subServices,
      serviceCategories: worker.serviceCategories
    });
  } catch (error) {
    console.error('Update worker skills profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update skills profile',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateLocation,
  getProfileCompletion,
  updateBankDetails,
  updateWorkLocations,
  updateDocuments,
  updateSkillsProfile
};


