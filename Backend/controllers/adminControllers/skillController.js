const Skill = require('../../models/Skill');

/**
 * Get all skills
 * GET /api/admin/skills
 */
const getAllSkills = async (req, res) => {
  try {
    const { role, isActive, categoryId } = req.query;
    const filter = {};

    if (role) {
      filter.role = role.toLowerCase();
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const skills = await Skill.find(filter)
      .populate('categoryId', 'name')
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills',
      error: error.message
    });
  }
};

/**
 * Create a new skill
 * POST /api/admin/skills
 */
const createSkill = async (req, res) => {
  try {
    const { name, role, categoryId, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }

    // Check if skill already exists
    const existingSkill = await Skill.findOne({ name: name.trim() });
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill with this name already exists'
      });
    }

    const skill = await Skill.create({
      name: name.trim(),
      role: role || 'worker',
      categoryId: categoryId || null,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: skill
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create skill',
      error: error.message
    });
  }
};

/**
 * Update an existing skill
 * PUT /api/admin/skills/:id
 */
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, categoryId, isActive } = req.body;

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    if (name) {
      // Check if another skill with the same name exists
      const existingSkill = await Skill.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existingSkill) {
        return res.status(400).json({
          success: false,
          message: 'Skill with this name already exists'
        });
      }
      skill.name = name.trim();
    }

    if (role) skill.role = role.toLowerCase();
    if (categoryId !== undefined) skill.categoryId = categoryId || null;
    if (isActive !== undefined) skill.isActive = isActive;

    await skill.save();

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: skill
    });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update skill',
      error: error.message
    });
  }
};

/**
 * Delete a skill
 * DELETE /api/admin/skills/:id
 */
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully',
      data: skill
    });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete skill',
      error: error.message
    });
  }
};

module.exports = {
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill
};
