const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  markAttendance,
  getMyStats,
  checkIn,
  markAttendanceWithDuration,
  getEventDetailedStats,
} = require('../controllers/registrationController');

router.post('/:eventId', auth, roleCheck('student'), registerForEvent);
router.get('/my', auth, roleCheck('student'), getMyRegistrations);
router.get('/stats/me', auth, roleCheck('student'), getMyStats);
router.get('/event/:eventId', auth, roleCheck('member', 'superadmin'), getEventRegistrations);
router.get('/event/:eventId/detailed-stats', auth, roleCheck('member', 'superadmin'), getEventDetailedStats);
router.put('/:id/attendance', auth, roleCheck('member', 'superadmin'), markAttendance);
router.post('/:id/check-in', auth, checkIn);
router.put('/:id/attendance-duration', auth, roleCheck('member', 'superadmin'), markAttendanceWithDuration);

module.exports = router;
