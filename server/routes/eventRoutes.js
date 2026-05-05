const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getEventsByCommittee,
} = require('../controllers/eventController');

router.get('/', auth, getAllEvents);
router.get('/member/mine', auth, roleCheck('member', 'superadmin'), getMyEvents);
router.get('/committee/:committeeName', auth, roleCheck('member', 'superadmin'), getEventsByCommittee);
router.get('/:id', auth, getEvent);
router.post('/', auth, roleCheck('member', 'superadmin'), upload.single('image'), createEvent);
router.put('/:id', auth, roleCheck('member', 'superadmin'), upload.single('image'), updateEvent);
router.delete('/:id', auth, roleCheck('member', 'superadmin'), deleteEvent);

module.exports = router;
