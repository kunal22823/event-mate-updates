const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  exportEventRegistrations,
  exportAttendanceReport,
  exportCommitteeAnalytics,
  exportAllEvents,
} = require('../controllers/exportController');

// Member and admin export endpoints
router.post('/event/:eventId/registrations', auth, roleCheck('member', 'superadmin'), exportEventRegistrations);
router.post('/event/:eventId/attendance-report', auth, roleCheck('member', 'superadmin'), exportAttendanceReport);

// Admin export endpoints
router.post('/committee/:committeeName/analytics', auth, roleCheck('superadmin'), exportCommitteeAnalytics);
router.post('/all-events', auth, roleCheck('superadmin'), exportAllEvents);

module.exports = router;
