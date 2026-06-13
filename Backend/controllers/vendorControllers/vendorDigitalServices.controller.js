const mongoose = require('mongoose');
const DigitalServiceCategory = require('../../models/DigitalServiceCategory');
const DigitalServiceSubcategory = require('../../models/DigitalServiceSubcategory');
const DigitalService = require('../../models/DigitalService');
const DigitalServicePricing = require('../../models/DigitalServicePricing');
const DigitalServiceFeature = require('../../models/DigitalServiceFeature');
const DigitalServiceOrder = require('../../models/DigitalServiceOrder');
const DigitalServiceReview = require('../../models/DigitalServiceReview');
const DigitalServiceAnalytics = require('../../models/DigitalServiceAnalytics');
const { getIO } = require('../../sockets');

/**
 * Intelligent Seeder - Fully Dynamic
 */
const seedDigitalServicesData = async (vendorId) => {
  try {
    const vId = new mongoose.Types.ObjectId(vendorId);
    
    // Seed categories globally if they don't exist
    let cats = await DigitalServiceCategory.find();
    if (cats.length === 0) {
      cats = await DigitalServiceCategory.insertMany([
        { name: 'Web Development', color: '#10B981', icon: 'FiCode' },
        { name: 'App Development', color: '#3B82F6', icon: 'FiSmartphone' },
        { name: 'CRM Development', color: '#8B5CF6', icon: 'FiDatabase' },
        { name: 'Digital Marketing', color: '#F59E0B', icon: 'FiTrendingUp' },
        { name: 'UI/UX Design', color: '#EC4899', icon: 'FiFigma' },
        { name: 'Maintenance', color: '#6366F1', icon: 'FiTool' },
        { name: 'Others', color: '#6B7280', icon: 'FiLayers' }
      ]);

      const webCat = cats.find(c => c.name === 'Web Development');
      await DigitalServiceSubcategory.insertMany([
        { categoryId: webCat._id, name: 'Business Website' },
        { categoryId: webCat._id, name: 'Corporate Website' },
        { categoryId: webCat._id, name: 'Ecommerce Website' }
      ]);
    }

    // Now check if this specific vendor already has services
    const serviceCount = await DigitalService.countDocuments({ vendorId: vId });
    if (serviceCount > 0) return; // This vendor is already seeded

    // Seed Initial Services for this vendor
    const webCat = cats.find(c => c.name === 'Web Development');
    const s1 = await DigitalService.create({
      vendorId: vId, categoryId: webCat._id, title: 'Custom Website Development', 
      shortDescription: 'We build fast, responsive and modern websites tailored to your business.',
      basePrice: 15000, status: 'Active', rating: 4.8, totalOrders: 28, totalRevenue: 245000, iconUrl: 'FiCode'
    });

    const appCat = cats.find(c => c.name === 'App Development');
    const s2 = await DigitalService.create({
      vendorId: vId, categoryId: appCat._id, title: 'Mobile App Development', 
      shortDescription: 'Native & cross-platform mobile apps for iOS and Android.',
      basePrice: 45000, status: 'Active', rating: 4.7, totalOrders: 22, totalRevenue: 310000, iconUrl: 'FiSmartphone'
    });

    const crmCat = cats.find(c => c.name === 'CRM Development');
    const s3 = await DigitalService.create({
      vendorId: vId, categoryId: crmCat._id, title: 'CRM Solution Development', 
      shortDescription: 'Custom CRM solutions to manage your business efficiently.',
      basePrice: 25000, status: 'Active', rating: 4.6, totalOrders: 18, totalRevenue: 125000, iconUrl: 'FiDatabase'
    });

    const dmCat = cats.find(c => c.name === 'Digital Marketing');
    const s4 = await DigitalService.create({
      vendorId: vId, categoryId: dmCat._id, title: 'Digital Marketing Services', 
      shortDescription: 'SEO, SEM, Social Media Marketing & more to grow your brand.',
      basePrice: 12000, status: 'Active', rating: 4.6, totalOrders: 30, totalRevenue: 125000, iconUrl: 'FiTrendingUp'
    });

    const uiCat = cats.find(c => c.name === 'UI/UX Design');
    const s5 = await DigitalService.create({
      vendorId: vId, categoryId: uiCat._id, title: 'UI/UX Design Services', 
      shortDescription: 'Beautiful and intuitive UI/UX designs that enhance user experience.',
      basePrice: 10000, status: 'Active', rating: 4.8, totalOrders: 16, totalRevenue: 85000, iconUrl: 'FiFigma'
    });

    const mainCat = cats.find(c => c.name === 'Maintenance');
    const s6 = await DigitalService.create({
      vendorId: vId, categoryId: mainCat._id, title: 'Website Maintenance', 
      shortDescription: 'We provide regular website updates and maintenance.',
      basePrice: 5000, status: 'Active', rating: 4.5, totalOrders: 12, totalRevenue: 60000, iconUrl: 'FiTool'
    });

    const othersCat = cats.find(c => c.name === 'Others');
    const s7 = await DigitalService.create({
      vendorId: vId, categoryId: othersCat._id, title: 'Cloud Deployment', 
      shortDescription: 'Secure and scalable cloud deployment solutions.',
      basePrice: 20000, status: 'Active', rating: 4.6, totalOrders: 9, totalRevenue: 50000, iconUrl: 'FiCloud'
    });

    const s8 = await DigitalService.create({
      vendorId: vId, categoryId: othersCat._id, title: 'Other Services', 
      shortDescription: 'Custom solutions for unique business needs.',
      basePrice: 0, isCustomPricing: true, status: 'Active', rating: 4.4, totalOrders: 5, totalRevenue: 20000, iconUrl: 'FiMoreHorizontal'
    });

    // Seed Orders
    await DigitalServiceOrder.insertMany([
      { serviceId: s1._id, vendorId: vId, customerName: 'John Doe', amount: 25000, status: 'Completed', date: new Date() },
      { serviceId: s2._id, vendorId: vId, customerName: 'Acme Corp', amount: 75000, status: 'In Progress', date: new Date() },
      { serviceId: s3._id, vendorId: vId, customerName: 'Tech Solutions', amount: 30000, status: 'New', date: new Date() },
      { serviceId: s5._id, vendorId: vId, customerName: 'Creative Agency', amount: 15000, status: 'Completed', date: new Date() }
    ]);

  } catch (err) {
    console.error('Seeding Digital Services Error:', err);
  }
};

/**
 * GET Overview Stats (Top Cards)
 */
const getOverview = async (req, res) => {
  try {
    const vendorId = req.user.id;
    await seedDigitalServicesData(vendorId);

    const vId = new mongoose.Types.ObjectId(vendorId);

    const services = await DigitalService.find({ vendorId: vId }).lean();
    const activeServices = services.filter(s => s.status === 'Active').length;
    const featuredServices = services.filter(s => s.status === 'Featured').length;
    
    const orders = await DigitalServiceOrder.find({ vendorId: vId }).lean();
    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

    // Dynamic categorization for donut chart
    const categories = await DigitalServiceCategory.find().lean();
    const categoryDistribution = categories.map(cat => {
      const count = services.filter(s => s.categoryId.toString() === cat._id.toString()).length;
      return {
        _id: cat._id,
        name: cat.name,
        color: cat.color,
        value: count,
        percentage: services.length ? Math.round((count / services.length) * 100) : 0
      };
    }).filter(c => c.value > 0);

    const topPerforming = [...services].sort((a,b) => b.totalRevenue - a.totalRevenue).slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalServices: services.length,
          activeServices,
          featuredServices,
          totalOrders: orders.length,
          totalRevenue,
          growth: {
            totalServices: '+20%',
            activeServices: '+18%',
            featuredServices: '+15%',
            totalOrders: '+22%',
            totalRevenue: '+25%'
          }
        },
        categoryDistribution,
        topPerforming
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET Categories Config
 */
const getCategoriesConfig = async (req, res) => {
  try {
    const categories = await DigitalServiceCategory.find({ isActive: true }).lean();
    // Also send enums for zero hardcoding
    const statuses = DigitalService.schema.path('status').enumValues;
    res.status(200).json({ success: true, data: { categories, statuses } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET Services (Filtered & Paginated)
 */
const getServices = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { page = 1, limit = 8, search = '', category = '', status = '' } = req.query;

    const query = { vendorId: new mongoose.Types.ObjectId(vendorId) };

    if (search) query.title = { $regex: search, $options: 'i' };
    if (status && status !== 'All Status') query.status = status;
    
    if (category && category !== 'All Services') {
      const cat = await DigitalServiceCategory.findOne({ name: category });
      if (cat) query.categoryId = cat._id;
    }

    const skip = (page - 1) * limit;

    const services = await DigitalService.find(query)
      .populate('categoryId', 'name color')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await DigitalService.countDocuments(query);

    res.status(200).json({
      success: true,
      data: services,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET Recent Orders
 */
const getRecentOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const orders = await DigitalServiceOrder.find({ vendorId: new mongoose.Types.ObjectId(vendorId) })
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST Create Service (Real-time enabled)
 */
const createService = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { categoryId, title, shortDescription, basePrice } = req.body;

    if(!categoryId || !title || !basePrice) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newService = await DigitalService.create({
      vendorId, categoryId, title, shortDescription, basePrice
    });

    const io = getIO();
    io.to(`vendor:${vendorId}`).emit('digital_service:created', newService);

    res.status(201).json({ success: true, data: newService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT Update Service (Real-time enabled)
 */
const updateService = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const serviceId = req.params.id;

    const updated = await DigitalService.findOneAndUpdate(
      { _id: serviceId, vendorId },
      req.body,
      { new: true, runValidators: true }
    );

    if(!updated) return res.status(404).json({ success: false, message: "Service not found" });

    const io = getIO();
    io.to(`vendor:${vendorId}`).emit('digital_service:updated', updated);

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOverview,
  getCategoriesConfig,
  getServices,
  getRecentOrders,
  createService,
  updateService
};
