const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isValidSIESEmail } = require('../utils/validators');
const { sendEmail, emailTemplates } = require('../utils/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, course, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (!isValidSIESEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email. Must be a valid SIES email (e.g., kunals.mca25@siescoms.sies.edu.in).',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const allowedRoles = ['student', 'member'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      course: course || '',
      year: year || '',
    });

    // Send notification to admin if committee member signup
    if (userRole === 'member') {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@eventmate.com';
      const approvalLink = `${process.env.APP_URL || 'http://localhost:5173'}/admin/approvals`;
      const notificationEmail = emailTemplates.committeeMembershipRequest(user.name, approvalLink);
      await sendEmail(adminEmail, notificationEmail.subject, notificationEmail.html);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        course: user.course,
        year: user.year,
        totalCredits: user.totalCredits || 0,
        committeeApproved: user.committeeApproved,
        committeeStatus: user.committeeStatus,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        course: user.course,
        year: user.year,
        totalCredits: user.totalCredits || 0,
        remainingCredits: user.remainingCredits || 0,
        committeeApproved: user.committeeApproved || false,
        committeeStatus: user.committeeStatus || 'pending',
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        course: req.user.course,
        year: req.user.year,
        totalCredits: req.user.totalCredits || 0,
        remainingCredits: req.user.remainingCredits || 0,
        committeeApproved: req.user.committeeApproved || false,
        committeeStatus: req.user.committeeStatus || 'pending',
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, course, year } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (course) updates.course = course;
    if (year) updates.year = year;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        course: user.course,
        year: user.year,
        totalCredits: user.totalCredits || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile.', error: error.message });
  }
};
