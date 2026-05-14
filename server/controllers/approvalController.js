const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// GET /api/admin/approvals/pending
exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      role: 'member',
      committeeStatus: 'pending',
    }).select('-password');

    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching pending approvals.', error: error.message });
  }
};

// GET /api/admin/approvals/approved
exports.getApprovedMembers = async (req, res) => {
  try {
    const approvedUsers = await User.find({
      role: 'member',
      committeeStatus: 'approved',
    }).select('-password').populate('approvedBy', 'name email');

    res.json(approvedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching approved members.', error: error.message });
  }
};

// GET /api/admin/approvals/rejected
exports.getRejectedMembers = async (req, res) => {
  try {
    const rejectedUsers = await User.find({
      role: 'member',
      committeeStatus: 'rejected',
    }).select('-password').populate('approvedBy', 'name email');

    res.json(rejectedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching rejected members.', error: error.message });
  }
};

// PATCH /api/admin/approvals/:userId/approve
exports.approveMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const { remainingCredits = 0 } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role !== 'member') {
      return res.status(400).json({ message: 'Only committee members can be approved.' });
    }

    user.committeeApproved = true;
    user.committeeStatus = 'approved';
    user.approvedBy = req.user._id;
    user.committeeApprovalDate = new Date();
    user.remainingCredits = remainingCredits;
    user.updatedAt = new Date();

    await user.save();

    // Send approval email to member
    const approvalEmail = emailTemplates.membershipApproved(user.name, remainingCredits);
    await sendEmail(user.email, approvalEmail.subject, approvalEmail.html);

    res.json({
      message: 'Member approved successfully. Confirmation email sent.',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error approving member.', error: error.message });
  }
};

// PATCH /api/admin/approvals/:userId/reject
exports.rejectMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason = '' } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role !== 'member') {
      return res.status(400).json({ message: 'Only committee members can be rejected.' });
    }

    user.committeeApproved = false;
    user.committeeStatus = 'rejected';
    user.approvedBy = req.user._id;
    user.committeeApprovalDate = new Date();
    user.updatedAt = new Date();

    await user.save();

    // Send rejection email to member
    const rejectionEmail = emailTemplates.membershipRejected(user.name, reason);
    await sendEmail(user.email, rejectionEmail.subject, rejectionEmail.html);

    res.json({
      message: 'Member rejected successfully. Notification email sent.',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error rejecting member.', error: error.message });
  }
};

// PATCH /api/admin/approvals/:userId/update-credits
exports.updateMemberCredits = async (req, res) => {
  try {
    const { userId } = req.params;
    const { remainingCredits } = req.body;

    if (typeof remainingCredits !== 'number' || remainingCredits < 0) {
      return res.status(400).json({ message: 'Invalid remaining credits value.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.remainingCredits = remainingCredits;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      message: 'Member credits updated successfully.',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating credits.', error: error.message });
  }
};

// GET /api/approvals/status
exports.getMyApprovalStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('approvedBy', 'name email');

    res.json({
      committeeApproved: user.committeeApproved,
      committeeStatus: user.committeeStatus,
      committeeApprovalDate: user.committeeApprovalDate,
      approvedBy: user.approvedBy,
      remainingCredits: user.remainingCredits,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching approval status.', error: error.message });
  }
};
