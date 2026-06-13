const express = require('express');
const router = express.Router();
const FormConfig = require('../../models/FormConfig');
const DocumentRequirement = require('../../models/DocumentRequirement');
const Skill = require('../../models/Skill');
const ServiceCategory = require('../../models/ServiceCategory');
const SubService = require('../../models/SubService');

router.get('/register-config', async (req, res) => {
  try {
    const { role } = req.query;

    if (!role || !['worker', 'engineer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Valid role (worker or engineer) is required' });
    }

    // Fetch form fields based on role
    const fields = await FormConfig.find({ 
      isActive: true, 
      formType: 'registration',
      $or: [{ role: role }, { role: 'both' }]
    }).sort({ step: 1, order: 1 });

    // Fetch document requirements
    const documents = await DocumentRequirement.find({
      isActive: true,
      $or: [{ role: role }, { role: 'both' }]
    }).sort({ order: 1 });

    // Fetch skills
    const skills = await Skill.find({
      isActive: true,
      $or: [{ role: role }, { role: 'both' }]
    }).sort({ name: 1 });

    // Fetch service categories
    const categories = await ServiceCategory.find({
      isActive: true,
      roles: role
    }).sort({ displayOrder: 1 });

    // Fetch sub-services
    const subServices = await SubService.find({
      isActive: true
    }).sort({ displayOrder: 1 });

    // Format steps dynamically
    const stepsData = [];
    const fieldsMap = {};
    const validationRules = [];

    fields.forEach(field => {
      // Create Step if not exists
      let stepObj = stepsData.find(s => s.step === field.step);
      if (!stepObj) {
        stepObj = { step: field.step, title: `Step ${field.step}`, fields: [] };
        stepsData.push(stepObj);
      }
      
      // Clean field for frontend
      const fieldData = {
        key: field.fieldKey,
        label: field.label,
        type: field.type,
        required: field.required,
        options: field.options,
        validation: field.validation
      };

      stepObj.fields.push(fieldData);
      fieldsMap[field.fieldKey] = fieldData;

      // Collect validation rules for frontend
      if (field.required || field.validation) {
        validationRules.push({
          field: field.fieldKey,
          required: field.required,
          ...field.validation
        });
      }
    });

    res.status(200).json({
      success: true,
      config: {
        role,
        steps: stepsData,
        fields: Object.values(fieldsMap), // Or just pass steps
        documents,
        skills,
        categories,
        subServices,
        validationRules
      }
    });

  } catch (error) {
    console.error('Fetch register config error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registration configuration' });
  }
});

module.exports = router;
