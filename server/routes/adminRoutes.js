const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getAllUsers, getAnalytics, deleteUser, deleteEvent } = require('../controllers/adminController');

router.get('/users', auth, roleCheck('superadmin'), getAllUsers);
router.get('/analytics', auth, roleCheck('superadmin'), getAnalytics);
router.delete('/users/:id', auth, roleCheck('superadmin'), deleteUser);
router.delete('/events/:id', auth, roleCheck('superadmin'), deleteEvent);

module.exports = router;
