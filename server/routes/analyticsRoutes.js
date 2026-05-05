const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  getDashboardOverview,
  getAllEventsAnalytics,
  getCommitteeAnalytics,
  getStudentAnalytics,
  getTimelineAnalytics,
  getMemberAnalytics,
} = require('../controllers/analyticsController');

// Admin analytics endpoints
router.get('/dashboard/overview', auth, roleCheck('superadmin'), getDashboardOverview);
router.get('/events', auth, roleCheck('superadmin'), getAllEventsAnalytics);
router.get('/committees', auth, roleCheck('superadmin'), getCommitteeAnalytics);
router.get('/students', auth, roleCheck('superadmin'), getStudentAnalytics);
router.get('/timeline', auth, roleCheck('superadmin'), getTimelineAnalytics);

// Member analytics for their own events
router.get('/member/:memberId', auth, getMemberAnalytics);

module.exports = router;
