const HomeSection = require('../../models/HomeSection');
const { delCache } = require('../../services/redisService');

// Helper to get or initialize a home section by key
const getOrInitSection = async (sectionKey) => {
  let section = await HomeSection.findOne({ sectionKey });
  if (!section) {
    // Determine default title/values based on key
    let defaultTitle = '';
    let defaultSubtitle = '';
    let defaultItems = [];

    if (sectionKey === 'care_plan') {
      defaultTitle = 'Peace of mind with';
      defaultSubtitle = 'Get annual maintenance & priority support at exclusive prices.';
      defaultItems = [
        { title: 'Priority Booking', sortOrder: 0, isActive: true },
        { title: 'Free Check-ups', sortOrder: 1, isActive: true },
        { title: 'Exclusive Discounts', sortOrder: 2, isActive: true },
        { title: '24x7 Support', sortOrder: 3, isActive: true }
      ];
    } else if (sectionKey === 'why_choose') {
      defaultTitle = 'Why Choose WBI?';
      defaultItems = [
        { title: 'Verified Experts', description: 'Background verified & trained professionals', sortOrder: 0, isActive: true },
        { title: 'Transparent Pricing', description: 'No hidden charges. What you see is what you pay.', sortOrder: 1, isActive: true },
        { title: 'On-time Service', description: 'We value your time and always deliver on schedule.', sortOrder: 2, isActive: true },
        { title: '100% Satisfaction', description: 'Quality service or your money back.', sortOrder: 3, isActive: true },
        { title: '24x7 Support', description: 'We\'re here for you anytime, anywhere.', sortOrder: 4, isActive: true }
      ];
    } else if (sectionKey === 'how_it_works') {
      defaultTitle = 'How It Works';
      defaultItems = [
        { title: 'Choose Service', description: 'Select the service you need', stepNumber: 1, sortOrder: 0, isActive: true },
        { title: 'Book & Schedule', description: 'Pick a convenient date & time', stepNumber: 2, sortOrder: 1, isActive: true },
        { title: 'Expert Arrives', description: 'Our expert reaches your location', stepNumber: 3, sortOrder: 2, isActive: true },
        { title: 'Service Done', description: 'Work completed with quality check', stepNumber: 4, sortOrder: 3, isActive: true },
        { title: 'Pay & Relax', description: 'Safe payment & peace of mind', stepNumber: 5, sortOrder: 4, isActive: true }
      ];
    }

    section = await HomeSection.create({
      sectionKey,
      title: defaultTitle,
      subtitle: defaultSubtitle,
      items: defaultItems,
      isActive: true
    });
  }
  return section;
};

// @desc    Get Home Section by Key (Public)
// @route   GET /api/home-sections/:sectionKey
const getSection = async (req, res) => {
  try {
    const { sectionKey } = req.params;
    
    // Validate section key
    if (!['care_plan', 'why_choose', 'how_it_works'].includes(sectionKey)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section key'
      });
    }

    const section = await getOrInitSection(sectionKey);

    res.status(200).json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error fetching home section',
      error: error.message
    });
  }
};

// Specific wrappers for cleaner routing
const getCarePlan = (req, reqRes) => {
  req.params.sectionKey = 'care_plan';
  return getSection(req, reqRes);
};

const getWhyChoose = (req, reqRes) => {
  req.params.sectionKey = 'why_choose';
  return getSection(req, reqRes);
};

const getHowItWorks = (req, reqRes) => {
  req.params.sectionKey = 'how_it_works';
  return getSection(req, reqRes);
};

// @desc    Create Home Section (Admin)
// @route   POST /api/admin/home-sections/:sectionKey
const createSection = async (req, res) => {
  try {
    const { sectionKey } = req.params;
    
    if (!['care_plan', 'why_choose', 'how_it_works'].includes(sectionKey)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section key'
      });
    }

    // Check if section already exists
    const existing = await HomeSection.findOne({ sectionKey });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Section ${sectionKey} already exists. Use PATCH to update.`
      });
    }

    const sectionData = {
      ...req.body,
      sectionKey,
      createdBy: req.user ? req.user._id : null,
      updatedBy: req.user ? req.user._id : null
    };

    const section = await HomeSection.create(sectionData);

    // Invalidate Redis cache
    await delCache('home_data:*');

    res.status(201).json({
      success: true,
      message: 'Home section created successfully',
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error creating home section',
      error: error.message
    });
  }
};

// Specific wrappers for creation routing
const createCarePlan = (req, reqRes) => {
  req.params.sectionKey = 'care_plan';
  return createSection(req, reqRes);
};

const createWhyChoose = (req, reqRes) => {
  req.params.sectionKey = 'why_choose';
  return createSection(req, reqRes);
};

const createHowItWorks = (req, reqRes) => {
  req.params.sectionKey = 'how_it_works';
  return createSection(req, reqRes);
};

// @desc    Update Home Section by ID (Admin)
// @route   PATCH /api/admin/home-sections/:sectionKey/:id
const updateSectionById = async (req, res) => {
  try {
    const { id } = req.params;

    let section = await HomeSection.findById(id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    // Prepare update body
    const updateData = {
      ...req.body,
      updatedBy: req.user ? req.user._id : null
    };

    // Prevent key modifications
    delete updateData.sectionKey;

    section = await HomeSection.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Invalidate Redis cache
    await delCache('home_data:*');

    res.status(200).json({
      success: true,
      message: 'Home section updated successfully',
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error updating home section',
      error: error.message
    });
  }
};

module.exports = {
  getSection,
  getCarePlan,
  getWhyChoose,
  getHowItWorks,
  createSection,
  createCarePlan,
  createWhyChoose,
  createHowItWorks,
  updateSectionById
};
