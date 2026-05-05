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
} = require('../controllers/registrationController');

router.post('/:eventId', auth, roleCheck('student'), registerForEvent);
router.get('/my', auth, roleCheck('student'), getMyRegistrations);
router.get('/stats/me', auth, roleCheck('student'), getMyStats);
router.get('/event/:eventId', auth, roleCheck('member', 'superadmin'), getEventRegistrations);
router.put('/:id/attendance', auth, roleCheck('member', 'superadmin'), markAttendance);

module.exports = router;
