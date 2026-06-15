const Worker = require('../../models/Worker');
const Engineer = require('../../models/Engineer');
const SubService = require('../../models/SubService');

/**
 * Get all pending custom skills from workers and engineers
 * GET /api/admin/custom-skills
 */
const getPendingCustomSkills = async (req, res) => {
  try {
    const workers = await Worker.find({ "subServices.customSkills.status": "pending" })
      .select('name email phone subServices')
      .lean();

    const engineers = await Engineer.find({ "subServices.customSkills.status": "pending" })
      .select('name email phone subServices')
      .lean();

    const pendingSkills = [];

    workers.forEach(w => {
      if (!w.subServices) return;
      w.subServices.forEach(s => {
        if (!s.customSkills) return;
        s.customSkills.forEach(cs => {
          if (cs.status === 'pending') {
            pendingSkills.push({
              id: `${w._id}_${s.subServiceId}_${cs._id}`,
              userType: 'worker',
              userId: w._id,
              userName: w.name,
              userPhone: w.phone,
              userEmail: w.email,
              subServiceId: s.subServiceId,
              subServiceName: s.name,
              customSkillId: cs._id,
              skillName: cs.name,
              status: cs.status,
              createdAt: cs.createdAt || w.createdAt
            });
          }
        });
      });
    });

    engineers.forEach(e => {
      if (!e.subServices) return;
      e.subServices.forEach(s => {
        if (!s.customSkills) return;
        s.customSkills.forEach(cs => {
          if (cs.status === 'pending') {
            pendingSkills.push({
              id: `${e._id}_${s.subServiceId}_${cs._id}`,
              userType: 'engineer',
              userId: e._id,
              userName: e.name,
              userPhone: e.phone,
              userEmail: e.email,
              subServiceId: s.subServiceId,
              subServiceName: s.name,
              customSkillId: cs._id,
              skillName: cs.name,
              status: cs.status,
              createdAt: cs.createdAt || e.createdAt
            });
          }
        });
      });
    });

    // Sort by newest
    pendingSkills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: pendingSkills.length,
      data: pendingSkills
    });
  } catch (error) {
    console.error('Error fetching pending custom skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending custom skills',
      error: error.message
    });
  }
};

/**
 * Update the status of a custom skill
 * PATCH /api/admin/custom-skills/status
 */
const updateCustomSkillStatus = async (req, res) => {
  try {
    const { userId, userType, subServiceId, customSkillId, status } = req.body;

    if (!userId || !userType || !subServiceId || !customSkillId || !status) {
      return res.status(400).json({
        success: false,
        message: 'userId, userType, subServiceId, customSkillId, and status are required'
      });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected'
      });
    }

    let userModel = userType.toLowerCase() === 'worker' ? Worker : Engineer;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `${userType} not found`
      });
    }

    // Find subService in user's profile
    const subServiceObj = user.subServices.find(s => s.subServiceId.toString() === subServiceId.toString());
    if (!subServiceObj) {
      return res.status(404).json({
        success: false,
        message: 'SubService not found in user profile'
      });
    }

    // Find custom skill in the subService
    const customSkill = subServiceObj.customSkills.find(cs => cs._id.toString() === customSkillId.toString());
    if (!customSkill) {
      return res.status(404).json({
        success: false,
        message: 'Custom skill not found in user subservice'
      });
    }

    customSkill.status = status;

    // Save user profile changes
    await user.save();

    // If approved, push to SubService's requiredSkills if not already there
    if (status === 'approved') {
      const subService = await SubService.findById(subServiceId);
      if (subService) {
        const skillTrimmed = customSkill.name.trim();
        // Case-insensitive check
        const skillExists = subService.requiredSkills.some(
          s => s.toLowerCase().trim() === skillTrimmed.toLowerCase()
        );
        if (!skillExists) {
          subService.requiredSkills.push(skillTrimmed);
          await subService.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Custom skill has been ${status}`,
      data: {
        userId,
        userType,
        subServiceId,
        customSkillId,
        status,
        skillName: customSkill.name
      }
    });
  } catch (error) {
    console.error('Error updating custom skill status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update custom skill status',
      error: error.message
    });
  }
};

module.exports = {
  getPendingCustomSkills,
  updateCustomSkillStatus
};
