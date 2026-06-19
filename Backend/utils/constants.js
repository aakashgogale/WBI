/**
 * Application Constants
 */

// User Roles
const USER_ROLES = {
  USER: 'USER',
  VENDOR: 'VENDOR',
  WORKER: 'WORKER',
  ENGINEER: 'ENGINEER',
  ADMIN: 'ADMIN'
};

// Token Types
const TOKEN_TYPES = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
  PHONE_VERIFICATION: 'PHONE_VERIFICATION',
  REFRESH_TOKEN: 'REFRESH_TOKEN'
};

// Vendor Approval Status
const VENDOR_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
};

// Worker Status
const WORKER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  BUSY: 'BUSY'
};

// Engineer Status
const ENGINEER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  BUSY: 'BUSY'
};

// Booking Status
const BOOKING_STATUS = {
  SEARCHING: 'searching', // Initial search phase
  SEARCHING_WORKER: 'searching_worker', // Searching for nearby worker
  REQUEST_SENT: 'request_sent', // Booking request sent to worker
  WORKER_ASSIGNED: 'worker_assigned', // Worker successfully assigned
  REQUESTED: 'requested', // Waiting for vendor to accept
  AWAITING_PAYMENT: 'awaiting_payment', // Accepted by vendor, waiting for user payment
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ACCEPTED: 'accepted',
  ADMIN_ACTION_REQUIRED: 'admin_action_required',
  ASSIGNED: 'assigned',
  JOURNEY_STARTED: 'journey_started',
  ARRIVED: 'arrived', // Worker arrived at location
  SERVICE_STARTED: 'service_started', // OTP verified, service begins
  VISITED: 'visited',
  IN_PROGRESS: 'in_progress',
  WORK_DONE: 'work_done',
  COMPLETED: 'completed',
  CLOSED: 'closed', // Payment and rating done
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  COLLECTED_BY_VENDOR: 'collected_by_vendor',
  PLAN_COVERED: 'plan_covered' // For plan_benefit bookings until bill is finalized
};

// Service Status
const SERVICE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted'
};

// Bill Status
const BILL_STATUS = {
  DRAFT: 'draft',
  GENERATED: 'generated',
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

module.exports = {
  USER_ROLES,
  TOKEN_TYPES,
  VENDOR_STATUS,
  WORKER_STATUS,
  ENGINEER_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  SERVICE_STATUS,
  BILL_STATUS
};
