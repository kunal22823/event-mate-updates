const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  getPendingApprovals,
  getApprovedMembers,
  getRejectedMembers,
  approveMember,
  rejectMember,
  updateMemberCredits,
  getMyApprovalStatus,
} = require('../controllers/approvalController');

// Public routes
router.get('/status', auth, getMyApprovalStatus);

// Admin routes
router.get('/pending', auth, roleCheck('superadmin'), getPendingApprovals);
router.get('/approved', auth, roleCheck('superadmin'), getApprovedMembers);
router.get('/rejected', auth, roleCheck('superadmin'), getRejectedMembers);
router.patch('/:userId/approve', auth, roleCheck('superadmin'), approveMember);
router.patch('/:userId/reject', auth, roleCheck('superadmin'), rejectMember);
router.patch('/:userId/credits', auth, roleCheck('superadmin'), updateMemberCredits);

module.exports = router;
