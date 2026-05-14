// Middleware to check if user is an approved committee member
const approvalCheck = (req, res, next) => {
  // Only check for committee members
  if (req.user.role !== 'member') {
    return next();
  }

  // Check if member is approved
  if (!req.user.committeeApproved || req.user.committeeStatus !== 'approved') {
    return res.status(403).json({
      message: 'Your committee membership is pending approval. Please wait for admin approval.',
      status: req.user.committeeStatus,
    });
  }

  next();
};

module.exports = approvalCheck;
