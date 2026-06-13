const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const { 
  getTeamOverview, getTeamMembers, addMember, updateMember, deleteMember, updateMemberStatus,
  getDepartments, getRoles, getSkills, getAvailability, getPerformance, getLeaves, getActivity,
  getProjectAssignments, assignProject 
} = require('../../controllers/vendorControllers/vendorTeamController');

// Dashboards & Overviews
router.get('/overview', authenticate, isVendor, getTeamOverview);
router.get('/availability', authenticate, isVendor, getAvailability);
router.get('/performance', authenticate, isVendor, getPerformance);
router.get('/leaves', authenticate, isVendor, getLeaves);
router.get('/activity', authenticate, isVendor, getActivity);
router.get('/assignments', authenticate, isVendor, getProjectAssignments);

// Members CRUD
router.get('/members', authenticate, isVendor, getTeamMembers);
router.post('/members', authenticate, isVendor, addMember);
router.put('/members/:id', authenticate, isVendor, updateMember);
router.delete('/members/:id', authenticate, isVendor, deleteMember);
router.patch('/members/:id/status', authenticate, isVendor, updateMemberStatus);

// Metadata
router.get('/departments', authenticate, isVendor, getDepartments);
router.get('/roles', authenticate, isVendor, getRoles);
router.get('/skills', authenticate, isVendor, getSkills);

// Actions
router.post('/assign-project', authenticate, isVendor, assignProject);

module.exports = router;
