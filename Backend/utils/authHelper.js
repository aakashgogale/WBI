const Admin = require('../models/Admin');
const Vendor = require('../models/Vendor');
const Worker = require('../models/Worker');
const Engineer = require('../models/Engineer');
const User = require('../models/User');

const COLLECTIONS = [
  { role: 'admin', model: Admin, redirect: '/admin/dashboard' },
  { role: 'vendor', model: Vendor, redirect: '/vendor/dashboard' },
  { role: 'engineer', model: Engineer, redirect: '/engineer/dashboard' },
  { role: 'worker', model: Worker, redirect: '/worker/dashboard' },
  { role: 'user', model: User, redirect: '/user' }
];

/**
 * Searches across Admin, Vendor, Engineer, Worker, and User collections
 * to find a user by their phone or email.
 * 
 * @param {string} identifier - Email address or phone number
 * @param {string} preferredRole - (Optional) The role to check first
 * @returns {Promise<Object|null>} - Returns { user, role, redirect, model } if found, null otherwise
 */
const findUserAcrossCollections = async (identifier, preferredRole = null) => {
  if (!identifier) return null;
  const identifierString = String(identifier).trim();
  const isEmail = identifierString.includes('@');
  
  // Clean phone number: remove non-digits
  const cleanPhone = identifierString.replace(/\D/g, '');
  
  let collectionsToSearch = [...COLLECTIONS];
  if (preferredRole) {
    const preferred = collectionsToSearch.find(c => c.role === preferredRole);
    if (preferred) {
      collectionsToSearch = collectionsToSearch.filter(c => c.role !== preferredRole);
      collectionsToSearch.unshift(preferred); // Put preferred role at the beginning
    }
  }
  
  for (const item of collectionsToSearch) {
    let query;
    if (isEmail) {
      query = { email: { $regex: new RegExp('^' + identifierString + '$', 'i') } };
    } else {
      if (!cleanPhone) continue; // Skip phone check if we don't have a numeric value
      
      // Admins don't have phone fields or login via phone
      if (item.role === 'admin') continue;
      
      query = { phone: cleanPhone };
    }

    const user = await item.model.findOne(query).select('+password');
    if (user) {
      let resolvedRole = item.role;
      let resolvedRedirect = item.redirect;
      
      // Override for User collection with role='admin'
      if (item.role === 'user' && user.role === 'admin') {
        resolvedRole = 'admin';
        resolvedRedirect = '/admin/dashboard';
      }
      
      return {
        user,
        role: resolvedRole,
        redirect: resolvedRedirect,
        model: item.model
      };
    }
  }
  return null;
};

module.exports = {
  findUserAcrossCollections,
  COLLECTIONS
};
