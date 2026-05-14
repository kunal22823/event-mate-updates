// Middleware to allow both students and committee members to access student routes
// Committee members can participate in events like students
module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  // Allow students and all committee members (approved or not) to access student routes
  // This enables committee members to register and participate in events
  if (req.user.role === 'student' || req.user.role === 'member') {
    return next();
  }

  res.status(403).json({ message: 'Insufficient permissions to access this resource.' });
};
