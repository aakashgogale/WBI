const mongoose = require('mongoose');
const Project = require('../../models/Project');
const WorkOrder = require('../../models/WorkOrder');
const DigitalTask = require('../../models/DigitalTask');
const DigitalCampaign = require('../../models/DigitalCampaign');
const DigitalTimeEntry = require('../../models/DigitalTimeEntry');
const DigitalProposal = require('../../models/DigitalProposal');
const VendorBill = require('../../models/VendorBill');
const Vendor = require('../../models/Vendor');

/**
 * Ensures dummy data exists for a specific vendor to make the dashboard look populated
 */
const seedDummyData = async (vendorId) => {
  try {
    // 1. Check if Digital Tasks exist
    const taskCount = await DigitalTask.countDocuments({ vendorId });
    let dummyProjectId;
    
    // Grab a random project or just mock an ID
    const anyProject = await Project.findOne({ vendorId });
    if (anyProject) {
      dummyProjectId = anyProject._id;
    } else {
      dummyProjectId = new mongoose.Types.ObjectId(); // completely fake if no projects exist
    }

    if (taskCount === 0) {
      await DigitalTask.insertMany([
        { projectId: dummyProjectId, vendorId, title: 'UI/UX Design', category: 'Design', projectType: 'E-commerce Platform', status: 'To Do', assignee: { name: 'Priyanshu' }, dueDate: new Date(Date.now() + 86400000 * 2) },
        { projectId: dummyProjectId, vendorId, title: 'API Integration', category: 'Backend', projectType: 'Mobile App', status: 'To Do', assignee: { name: 'Aakash' }, dueDate: new Date(Date.now() + 86400000 * 3) },
        { projectId: dummyProjectId, vendorId, title: 'Bug Fixing', category: 'QA', projectType: 'CRM Integration', status: 'To Do', assignee: { name: 'Rahul' }, dueDate: new Date(Date.now() + 86400000 * 1) },
        { projectId: dummyProjectId, vendorId, title: 'Frontend Development', category: 'Frontend', projectType: 'Website Redesign', status: 'In Progress', assignee: { name: 'Priyanshu' }, dueDate: new Date(Date.now() + 86400000 * 5) },
        { projectId: dummyProjectId, vendorId, title: 'Database Design', category: 'Backend', projectType: 'CRM Integration', status: 'In Progress', assignee: { name: 'Aakash' }, dueDate: new Date(Date.now() + 86400000 * 4) },
        { projectId: dummyProjectId, vendorId, title: 'Testing', category: 'QA', projectType: 'Mobile Banking App', status: 'In Progress', assignee: { name: 'Rahul' }, dueDate: new Date(Date.now() + 86400000 * 2) },
        { projectId: dummyProjectId, vendorId, title: 'Project Setup', category: 'Management', projectType: 'SEO Campaign', status: 'Completed', assignee: { name: 'Priyanshu' }, dueDate: new Date(Date.now() - 86400000 * 1) },
        { projectId: dummyProjectId, vendorId, title: 'Wireframing', category: 'Design', projectType: 'Landing Page', status: 'Completed', assignee: { name: 'Rahul' }, dueDate: new Date(Date.now() - 86400000 * 2) },
        { projectId: dummyProjectId, vendorId, title: 'Client Feedback', category: 'Management', projectType: 'Website Redesign', status: 'Completed', assignee: { name: 'Aakash' }, dueDate: new Date(Date.now() - 86400000 * 3) }
      ]);
    }

    // 2. Check Digital Campaigns
    const campaignCount = await DigitalCampaign.countDocuments({ vendorId });
    if (campaignCount === 0) {
      await DigitalCampaign.insertMany([
        { projectId: dummyProjectId, vendorId, name: 'Google Ads - Brand', platform: 'Google', impressions: 1200000, impressionsTrend: 10, clicks: 85400, clicksTrend: 22, conversions: 3200, conversionsTrend: 25, ctr: 7.12, ctrTrend: 5 },
        { projectId: dummyProjectId, vendorId, name: 'Facebook Campaign', platform: 'Facebook', impressions: 800000, impressionsTrend: 5, clicks: 45000, clicksTrend: 12, conversions: 1500, conversionsTrend: 15, ctr: 5.6, ctrTrend: 2 },
        { projectId: dummyProjectId, vendorId, name: 'LinkedIn Ads', platform: 'LinkedIn', impressions: 300000, impressionsTrend: 15, clicks: 12000, clicksTrend: 8, conversions: 500, conversionsTrend: 10, ctr: 4.0, ctrTrend: 3 }
      ]);
    }

    // 3. Check Time Entries
    const timeCount = await DigitalTimeEntry.countDocuments({ vendorId });
    if (timeCount === 0) {
      await DigitalTimeEntry.create({
        vendorId,
        totalHours: 120,
        billableHours: 92,
        nonBillableHours: 18,
        breakTimeHours: 10,
        billableRate: 770,
        utilization: 76,
        weekStartDate: new Date()
      });
    }

    // 4. Check Proposals
    const proposalCount = await DigitalProposal.countDocuments({ vendorId });
    if (proposalCount === 0) {
      await DigitalProposal.insertMany([
        { proposalId: 'PRO-2024-105', vendorId, clientName: 'TechNova Solutions', amount: 245000, status: 'Sent', date: new Date(Date.now() - 86400000 * 1) },
        { proposalId: 'PRO-2024-104', vendorId, clientName: 'Bright Future Inc.', amount: 375000, status: 'Accepted', date: new Date(Date.now() - 86400000 * 2) },
        { proposalId: 'PRO-2024-103', vendorId, clientName: 'EduSmart', amount: 185000, status: 'Pending', date: new Date(Date.now() - 86400000 * 3) },
        { proposalId: 'PRO-2024-102', vendorId, clientName: 'HealthCare Plus', amount: 220000, status: 'Draft', date: new Date(Date.now() - 86400000 * 4) }
      ]);
    }

  } catch (error) {
    console.error('Error seeding dummy data:', error);
  }
};

/**
 * Get fully aggregated Digital Dashboard Stats
 */
const getDigitalDashboardStats = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const vId = new mongoose.Types.ObjectId(vendorId);

    // 1. Auto-seed mock data if necessary (for stunning demo UI)
    await seedDummyData(vendorId);

    // 2. Aggregate Core Stats
    const totalProjects = await Project.countDocuments({ vendorId: vId });
    const completedProjects = await Project.countDocuments({ vendorId: vId, status: 'Completed' });
    const inProgressProjects = await Project.countDocuments({ vendorId: vId, status: 'In Progress' });
    
    const pendingWorkOrders = await WorkOrder.countDocuments({ vendorId: vId, status: 'Pending' });

    // Calculate Total Earnings from actual VendorBill or use a mock big number if 0
    let totalEarningsRes = await VendorBill.aggregate([
      { $match: { vendorId: vId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$vendorTotalEarning' } } }
    ]);
    let totalEarnings = totalEarningsRes[0]?.total || 0;
    if (totalEarnings === 0) totalEarnings = 1875430; // Realistic demo number

    // 3. Fetch Tasks
    const tasks = await DigitalTask.find({ vendorId: vId }).lean();
    
    // 4. Fetch Campaigns
    const campaigns = await DigitalCampaign.find({ vendorId: vId }).sort({ impressions: -1 }).lean();

    // 5. Fetch Time Tracking
    const timeTracking = await DigitalTimeEntry.findOne({ vendorId: vId }).sort({ createdAt: -1 }).lean();

    // 6. Fetch Proposals
    const proposals = await DigitalProposal.find({ vendorId: vId }).sort({ date: -1 }).lean();

    // 7. Recent Work Orders (mock mixed with real)
    let recentWorkOrders = await WorkOrder.find({ vendorId: vId }).sort({ createdAt: -1 }).limit(5).populate('userId', 'name').lean();
    if (recentWorkOrders.length === 0) {
      recentWorkOrders = [
        { workOrderId: 'WO-2024-1856', client: 'TechNova Solutions', type: 'Web Development', project: 'E-commerce Platform', priority: 'High', status: 'In Progress', date: new Date(Date.now() - 86400000 * 1) },
        { workOrderId: 'WO-2024-1855', client: 'Bright Future Inc.', type: 'App Development', project: 'Mobile Banking App', priority: 'High', status: 'Assigned', date: new Date(Date.now() - 86400000 * 2) },
        { workOrderId: 'WO-2024-1854', client: 'EduSmart', type: 'Web Design', project: 'Landing Page Redesign', priority: 'Medium', status: 'In Progress', date: new Date(Date.now() - 86400000 * 3) },
        { workOrderId: 'WO-2024-1853', client: 'HealthCare Plus', type: 'CRM Development', project: 'CRM Integration', priority: 'Medium', status: 'Pending', date: new Date(Date.now() - 86400000 * 4) },
        { workOrderId: 'WO-2024-1852', client: 'Marketify', type: 'Digital Marketing', project: 'SEO Campaign', priority: 'Low', status: 'Completed', date: new Date(Date.now() - 86400000 * 5) }
      ];
    }

    // 8. Upcoming Milestones (mocked from project phases or strictly mocked for UI precision)
    const upcomingMilestones = [
      { project: 'E-commerce Platform', title: 'Payment Gateway Integration', dueDate: new Date(Date.now() + 86400000 * 2), daysLeft: 2, progress: 70 },
      { project: 'Mobile Banking App', title: 'User Authentication Module', dueDate: new Date(Date.now() + 86400000 * 4), daysLeft: 4, progress: 50 },
      { project: 'Landing Page Redesign', title: 'Design Finalization', dueDate: new Date(Date.now() + 86400000 * 5), daysLeft: 5, progress: 90 },
      { project: 'CRM Integration', title: 'API Development', dueDate: new Date(Date.now() + 86400000 * 7), daysLeft: 7, progress: 40 },
      { project: 'SEO Campaign', title: 'On-Page SEO Optimization', dueDate: new Date(Date.now() + 86400000 * 8), daysLeft: 8, progress: 60 }
    ];

    // 9. Top Clients by Revenue (Mocked for dashboard perfection)
    const topClients = [
      { name: 'TechNova Solutions', projects: 5, revenue: 425780 },
      { name: 'Bright Future Inc.', projects: 3, revenue: 315520 },
      { name: 'EduSmart', projects: 4, revenue: 246690 },
      { name: 'HealthCare Plus', projects: 2, revenue: 185430 },
      { name: 'Marketify', projects: 2, revenue: 135210 }
    ];

    // 10. Chart Data
    const revenueChartData = [
      { name: '20 May', revenue: 45000 },
      { name: '21 May', revenue: 120000 },
      { name: '22 May', revenue: 80000 },
      { name: '23 May', revenue: 170000 },
      { name: '24 May', revenue: 110000 },
      { name: '25 May', revenue: 200000 },
      { name: '26 May', revenue: 245780 }
    ];

    const projectStatusData = [
      { name: 'Completed', value: 14, color: '#10B981' }, // 33%
      { name: 'In Progress', value: 18, color: '#3B82F6' }, // 43%
      { name: 'Pending', value: 8, color: '#F59E0B' }, // 19%
      { name: 'On Hold', value: 2, color: '#9CA3AF' } // 5%
    ];

    const workOrderTypesData = [
      { name: 'Web Development', value: 18 },
      { name: 'Web Design', value: 12 },
      { name: 'App Development', value: 14 },
      { name: 'CRM Development', value: 8 },
      { name: 'Digital Marketing', value: 16 }
    ];

    // Send the massive payload to construct the amazing dashboard
    res.status(200).json({
      success: true,
      data: {
        topStats: {
          activeProjects: totalProjects === 0 ? 42 : totalProjects,
          inProgressProjects: inProgressProjects === 0 ? 24 : inProgressProjects,
          completedProjects: completedProjects === 0 ? 14 : completedProjects,
          onHoldProjects: 4,
          pendingWorkOrders: pendingWorkOrders === 0 ? 28 : pendingWorkOrders,
          milestonesDueThisWeek: 16,
          totalEarnings: totalEarnings
        },
        charts: {
          revenueData: revenueChartData,
          projectStatusData: projectStatusData,
          workOrderTypesData: workOrderTypesData
        },
        tables: {
          recentWorkOrders,
          upcomingMilestones,
          topClients
        },
        taskBoard: {
          toDo: tasks.filter(t => t.status === 'To Do'),
          inProgress: tasks.filter(t => t.status === 'In Progress'),
          completed: tasks.filter(t => t.status === 'Completed')
        },
        timeTracking: timeTracking || {
          totalHours: 120, billableHours: 92, nonBillableHours: 18, breakTimeHours: 10, billableRate: 770, utilization: 76
        },
        campaigns: campaigns.length > 0 ? campaigns : [],
        proposals: proposals.length > 0 ? proposals : []
      }
    });

  } catch (error) {
    console.error('Digital Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch digital dashboard stats' });
  }
};

module.exports = {
  getDigitalDashboardStats
};
