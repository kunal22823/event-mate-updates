const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const hybridAccess = require('../middleware/hybridAccess');
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

// Hybrid access: students and committee members can register and participate
router.post('/:eventId', auth, hybridAccess, registerForEvent);
router.get('/my', auth, hybridAccess, getMyRegistrations);
router.get('/stats/me', auth, hybridAccess, getMyStats);
router.get('/event/:eventId', auth, roleCheck('member', 'superadmin'), getEventRegistrations);
router.get('/event/:eventId/detailed-stats', auth, roleCheck('member', 'superadmin'), getEventDetailedStats);
router.put('/:id/attendance', auth, roleCheck('member', 'superadmin'), markAttendance);
router.post('/:id/check-in', auth, checkIn);
router.put('/:id/attendance-duration', auth, roleCheck('member', 'superadmin'), markAttendanceWithDuration);

module.exports = router;
