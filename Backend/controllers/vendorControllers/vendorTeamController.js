const mongoose = require('mongoose');
const VendorDepartment = require('../../models/VendorDepartment');
const VendorRole = require('../../models/VendorRole');
const VendorTeamSkill = require('../../models/VendorTeamSkill');
const VendorTeamMember = require('../../models/VendorTeamMember');
const VendorLeave = require('../../models/VendorLeave');
const VendorActivityLog = require('../../models/VendorActivityLog');
const VendorProjectAssignment = require('../../models/VendorProjectAssignment');
const VendorPerformance = require('../../models/VendorPerformance');
const Project = require('../../models/Project'); // if needed

// Helper to log activity
const logActivity = async (vendorId, memberId, action, description) => {
  try {
    await VendorActivityLog.create({ vendorId, memberId, action, description });
  } catch (err) {
    console.error('Activity log error:', err);
  }
};

/**
 * Intelligent Seeder
 */
const seedVendorTeamData = async (vendorId) => {
  try {
    const vId = new mongoose.Types.ObjectId(vendorId);
    const memberCount = await VendorTeamMember.countDocuments({ vendorId: vId });
    if (memberCount > 0) return; 

    // 1. Seed Departments
    const devDept = await VendorDepartment.create({ vendorId: vId, name: 'Development', color: '#10B981' });
    const designDept = await VendorDepartment.create({ vendorId: vId, name: 'Design', color: '#3B82F6' });
    const qaDept = await VendorDepartment.create({ vendorId: vId, name: 'QA & Testing', color: '#8B5CF6' });
    const devopsDept = await VendorDepartment.create({ vendorId: vId, name: 'DevOps', color: '#EC4899' });

    // 2. Seed Roles
    const roleFullStack = await VendorRole.create({ vendorId: vId, departmentId: devDept._id, title: 'Senior React Developer' });
    const roleBackend = await VendorRole.create({ vendorId: vId, departmentId: devDept._id, title: 'Backend Developer' });
    const roleUIUX = await VendorRole.create({ vendorId: vId, departmentId: designDept._id, title: 'UI/UX Designer' });
    const roleFlutter = await VendorRole.create({ vendorId: vId, departmentId: devDept._id, title: 'Flutter Developer' });
    const roleQA = await VendorRole.create({ vendorId: vId, departmentId: qaDept._id, title: 'QA Engineer' });
    const roleDevOps = await VendorRole.create({ vendorId: vId, departmentId: devopsDept._id, title: 'DevOps Engineer' });

    // 3. Seed Skills
    const skillReact = await VendorTeamSkill.create({ vendorId: vId, name: 'React', category: 'Frontend' });
    const skillNext = await VendorTeamSkill.create({ vendorId: vId, name: 'Next.js', category: 'Frontend' });
    const skillNode = await VendorTeamSkill.create({ vendorId: vId, name: 'Node.js', category: 'Backend' });
    const skillExpress = await VendorTeamSkill.create({ vendorId: vId, name: 'Express', category: 'Backend' });
    const skillMongo = await VendorTeamSkill.create({ vendorId: vId, name: 'MongoDB', category: 'Backend' });
    const skillFigma = await VendorTeamSkill.create({ vendorId: vId, name: 'Figma', category: 'Design' });
    const skillAdobe = await VendorTeamSkill.create({ vendorId: vId, name: 'Adobe XD', category: 'Design' });
    const skillFlutter = await VendorTeamSkill.create({ vendorId: vId, name: 'Flutter', category: 'Mobile' });
    const skillAWS = await VendorTeamSkill.create({ vendorId: vId, name: 'AWS', category: 'DevOps' });

    // 4. Seed Members
    const members = await VendorTeamMember.insertMany([
      { vendorId: vId, name: 'Rahul Sharma', email: 'rahul.sharma@wbi.com', roleId: roleFullStack._id, departmentId: devDept._id, skills: [skillReact._id, skillNext._id], experience: '5.5 Years', availabilityStatus: 'On Project' },
      { vendorId: vId, name: 'Amit Verma', email: 'amit.verma@wbi.com', roleId: roleBackend._id, departmentId: devDept._id, skills: [skillNode._id, skillExpress._id, skillMongo._id], experience: '4 Years', availabilityStatus: 'On Project' },
      { vendorId: vId, name: 'Neha Gupta', email: 'neha.gupta@wbi.com', roleId: roleUIUX._id, departmentId: designDept._id, skills: [skillFigma._id, skillAdobe._id], experience: '3.5 Years', availabilityStatus: 'Available' },
      { vendorId: vId, name: 'Vikram Singh', email: 'vikram.singh@wbi.com', roleId: roleFlutter._id, departmentId: devDept._id, skills: [skillFlutter._id], experience: '4.5 Years', availabilityStatus: 'On Project' },
      { vendorId: vId, name: 'Pooja Mehta', email: 'pooja.mehta@wbi.com', roleId: roleQA._id, departmentId: qaDept._id, skills: [], experience: '3 Years', availabilityStatus: 'Available' },
      { vendorId: vId, name: 'Arjun Das', email: 'arjun.das@wbi.com', roleId: roleDevOps._id, departmentId: devopsDept._id, skills: [skillAWS._id], experience: '4 Years', availabilityStatus: 'On Project' }
    ]);

    // 5. Seed Project Assignments
    await VendorProjectAssignment.insertMany([
      { vendorId: vId, memberId: members[0]._id, projectName: 'WBI CRM', roleInProject: 'Frontend Lead', progress: 60, dueDate: new Date('2024-06-30') },
      { vendorId: vId, memberId: members[1]._id, projectName: 'E-Commerce App', roleInProject: 'Backend Developer', progress: 45, dueDate: new Date('2024-06-15') },
      { vendorId: vId, memberId: members[3]._id, projectName: 'Booking App', roleInProject: 'Flutter Developer', progress: 30, dueDate: new Date('2024-06-30') },
      { vendorId: vId, memberId: members[5]._id, projectName: 'Internal Tools', roleInProject: 'DevOps Engineer', progress: 70, dueDate: new Date('2024-06-25') }
    ]);

    // 6. Seed Performance
    await VendorPerformance.insertMany([
      { vendorId: vId, memberId: members[0]._id, rating: 4.8, productivityPercentage: 92, completedTasks: 45, activeTasks: 5 },
      { vendorId: vId, memberId: members[1]._id, rating: 4.6, productivityPercentage: 85, completedTasks: 32, activeTasks: 4 },
      { vendorId: vId, memberId: members[2]._id, rating: 4.5, productivityPercentage: 80, completedTasks: 28, activeTasks: 2 },
      { vendorId: vId, memberId: members[3]._id, rating: 4.3, productivityPercentage: 78, completedTasks: 25, activeTasks: 3 },
      { vendorId: vId, memberId: members[4]._id, rating: 4.2, productivityPercentage: 75, completedTasks: 22, activeTasks: 2 }
    ]);

    // 7. Seed Leaves
    await VendorLeave.insertMany([
      { memberId: members[4]._id, vendorId: vId, startDate: new Date('2024-05-27'), endDate: new Date('2024-05-29'), days: 3, reason: 'Personal' },
      { memberId: members[5]._id, vendorId: vId, startDate: new Date('2024-05-30'), endDate: new Date('2024-05-31'), days: 2, reason: 'Sick Leave' },
      { memberId: members[2]._id, vendorId: vId, startDate: new Date('2024-06-02'), endDate: new Date('2024-06-04'), days: 3, reason: 'Vacation' }
    ]);

    // 8. Seed Activity
    await VendorActivityLog.insertMany([
      { vendorId: vId, memberId: members[0]._id, action: 'Task Completed', description: 'Rahul Sharma completed milestone "CRM Dashboard"' },
      { vendorId: vId, memberId: members[4]._id, action: 'Task Submitted', description: 'Pooja Mehta uploaded test report for "Booking App"' },
      { vendorId: vId, memberId: members[5]._id, action: 'Deployment', description: 'Arjun Das deployed new build on staging server' },
      { vendorId: vId, memberId: members[2]._id, action: 'UI Submitted', description: 'Neha Gupta submitted new UI for "WBI Website"' }
    ]);

  } catch (err) {
    console.error('Error seeding vendor team data:', err);
  }
};

/**
 * OVERVIEW / SUMMARY
 */
const getTeamOverview = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const vId = new mongoose.Types.ObjectId(vendorId);

    await seedVendorTeamData(vendorId);

    const members = await VendorTeamMember.find({ vendorId: vId }).lean();
    const activeMembers = members.filter(m => m.isActive).length;
    const available = members.filter(m => m.availabilityStatus === 'Available').length;
    
    const assignments = await VendorProjectAssignment.find({ vendorId: vId }).lean();
    
    // Performance aggregation for open tasks
    const performances = await VendorPerformance.find({ vendorId: vId }).lean();
    let openTasks = 0;
    let totalProductivity = 0;
    performances.forEach(p => {
      openTasks += p.activeTasks || 0;
      totalProductivity += p.productivityPercentage || 0;
    });
    
    const teamUtilization = performances.length > 0 ? Math.round(totalProductivity / performances.length) : 0;
    
    const stats = {
      totalMembers: members.length,
      activeDevelopers: activeMembers,
      available: available,
      assignedProjects: assignments.length,
      openTasks: openTasks,
      teamUtilization: teamUtilization
    };

    // Skills distribution (used by frontend chart)
    const skillCounts = {};
    members.forEach(m => {
        m.skills?.forEach(s => {
            // we don't have populate on skills here, so we must just return populated skills below or fix frontend
        });
    });

    // Actually, topSkills was previously returned in the old controller. 
    // Let's populate skills to send distribution
    const populatedMembers = await VendorTeamMember.find({ vendorId: vId }).populate('skills').lean();
    const sCounts = {};
    populatedMembers.forEach(m => {
        m.skills?.forEach(s => {
            if(s && s.name) {
                sCounts[s.name] = (sCounts[s.name] || 0) + 1;
            }
        });
    });
    const topSkills = Object.entries(sCounts)
        .map(([name, count]) => ({ name, value: count, percent: Math.round((count / populatedMembers.length) * 100) }))
        .sort((a, b) => b.value - a.value);

    res.status(200).json({ success: true, data: { stats, topSkills } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch team overview' });
  }
};

/**
 * MEMBERS CRUD
 */
const getTeamMembers = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { page = 1, limit = 10, search = '', department = '', role = '', status = '' } = req.query;

        const query = { vendorId: new mongoose.Types.ObjectId(vendorId) };

        if (search) query.name = { $regex: search, $options: 'i' };
        
        if (department && department !== 'All Departments') {
            const dept = await VendorDepartment.findOne({ vendorId, name: department });
            if (dept) query.departmentId = dept._id;
        }

        if (role && role !== 'All Roles') {
            const r = await VendorRole.findOne({ vendorId, title: role });
            if (r) query.roleId = r._id;
        }

        if (status && status !== 'All Status') {
            query.availabilityStatus = status;
        }

        const skip = (page - 1) * limit;

        let members = await VendorTeamMember.find(query)
            .populate('roleId departmentId skills')
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Attach current project logic
        for (let m of members) {
           const assignment = await VendorProjectAssignment.findOne({ memberId: m._id, isActive: true });
           if (assignment) {
             m.currentProject = assignment.projectName;
             m.currentProjectProgress = assignment.progress;
           }
        }

        const total = await VendorTeamMember.countDocuments(query);

        res.status(200).json({
            success: true,
            data: members,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
};

const addMember = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { name, email, phone, roleId, departmentId, experience, availabilityStatus } = req.body;
    
    const newMember = await VendorTeamMember.create({
      vendorId, name, email, phone, roleId, departmentId, experience, availabilityStatus
    });

    await logActivity(vendorId, newMember._id, 'Member Added', `Added new team member ${name}`);

    res.status(201).json({ success: true, data: newMember });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

const updateMember = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const updated = await VendorTeamMember.findOneAndUpdate(
      { _id: req.params.id, vendorId },
      req.body,
      { new: true }
    );
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

const deleteMember = async (req, res) => {
  try {
    const vendorId = req.user.id;
    await VendorTeamMember.findOneAndDelete({ _id: req.params.id, vendorId });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

const updateMemberStatus = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { status } = req.body;
    const updated = await VendorTeamMember.findOneAndUpdate(
      { _id: req.params.id, vendorId },
      { availabilityStatus: status },
      { new: true }
    );
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

/**
 * DEPARTMENTS
 */
const getDepartments = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const depts = await VendorDepartment.find({ vendorId }).lean();
    res.status(200).json({ success: true, data: depts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

/**
 * ROLES
 */
const getRoles = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const roles = await VendorRole.find({ vendorId }).populate('departmentId').lean();
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

/**
 * SKILLS
 */
const getSkills = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const skills = await VendorTeamSkill.find({ vendorId }).lean();
    res.status(200).json({ success: true, data: skills });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

/**
 * DASHBOARDS / SUB-VIEWS
 */
const getAvailability = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const members = await VendorTeamMember.find({ vendorId }).lean();
    const available = members.filter(m => m.availabilityStatus === 'Available').length;
    const onProject = members.filter(m => m.availabilityStatus === 'On Project').length;
    const onLeave = members.filter(m => m.availabilityStatus === 'On Leave').length;
    
    // Completely dynamic calculation
    const total = members.length || 1; // avoid div by 0
    res.status(200).json({ 
      success: true, 
      data: { 
        real: { available, onProject, onLeave, total: members.length },
        visual: { available: available, partialLoad: onLeave, fullyAssigned: onProject, total: members.length }
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

const getPerformance = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const performance = await VendorPerformance.find({ vendorId })
      .populate('memberId', 'name profileImage roleId')
      .populate({ path: 'memberId', populate: { path: 'roleId', select: 'title' }})
      .sort({ rating: -1 })
      .lean();
    res.status(200).json({ success: true, data: performance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

const getLeaves = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const leaves = await VendorLeave.find({ vendorId, startDate: { $gte: new Date() } })
      .populate('memberId', 'name profileImage roleId')
      .populate({ path: 'memberId', populate: { path: 'roleId', select: 'title' }})
      .sort({ startDate: 1 })
      .lean();
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

const getActivity = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const activities = await VendorActivityLog.find({ vendorId })
      .populate('memberId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

const getProjectAssignments = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const assignments = await VendorProjectAssignment.find({ vendorId, isActive: true })
      .populate('memberId', 'name profileImage roleId')
      .populate({ path: 'memberId', populate: { path: 'roleId', select: 'title' }})
      .sort({ progress: -1 })
      .lean();
    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

const assignProject = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { memberId, projectName, roleInProject, dueDate } = req.body;
    
    const assignment = await VendorProjectAssignment.create({
      vendorId, memberId, projectName, roleInProject, dueDate
    });

    await VendorTeamMember.findByIdAndUpdate(memberId, { availabilityStatus: 'On Project' });
    await logActivity(vendorId, memberId, 'Project Assigned', `Assigned to ${projectName}`);

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  getTeamOverview,
  getTeamMembers,
  addMember,
  updateMember,
  deleteMember,
  updateMemberStatus,
  getDepartments,
  getRoles,
  getSkills,
  getAvailability,
  getPerformance,
  getLeaves,
  getActivity,
  getProjectAssignments,
  assignProject
};
