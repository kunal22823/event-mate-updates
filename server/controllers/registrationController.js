const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../utils/email');

// POST /api/registrations/:eventId
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check if already registered
    const existing = await Registration.findOne({
      studentId: req.user._id,
      eventId,
    });

    if (existing) {
      return res.status(400).json({ message: 'You are already registered for this event.' });
    }

    const registration = await Registration.create({
      studentId: req.user._id,
      eventId,
    });

    // Send confirmation email
    const template = emailTemplates.registrationConfirmation(event, req.user.name);
    sendEmail(req.user.email, template.subject, template.html);

    res.status(201).json(registration);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You are already registered for this event.' });
    }
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// GET /api/registrations/my
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ studentId: req.user._id })
      .populate({
        path: 'eventId',
        populate: { path: 'createdBy', select: 'name email' },
      })
      .sort({ registeredAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching registrations.', error: error.message });
  }
};

// GET /api/registrations/event/:eventId
exports.getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Members can only see registrations for their own events (superadmin can see all)
    if (req.user.role === 'member' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view registrations for this event.' });
    }

    const registrations = await Registration.find({ eventId })
      .populate('studentId', 'name email course year')
      .sort({ registeredAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching event registrations.', error: error.message });
  }
};

// PUT /api/registrations/:id/attendance
exports.markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendanceStatus } = req.body;

    if (!['Present', 'Absent'].includes(attendanceStatus)) {
      return res.status(400).json({ message: 'Attendance status must be "Present" or "Absent".' });
    }

    const registration = await Registration.findById(id).populate('eventId').populate('studentId', 'name email');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    // Check authorization
    const event = await Event.findById(registration.eventId._id);
    if (req.user.role === 'member' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark attendance for this event.' });
    }

    const previousStatus = registration.attendanceStatus;
    registration.attendanceStatus = attendanceStatus;
    registration.participated = attendanceStatus === 'Present';

    // Credit logic: safe & idempotent
    if (attendanceStatus === 'Present' && !registration.creditsAssigned && event.credits) {
      // Add credits to student
      await User.findByIdAndUpdate(registration.studentId._id, {
        $inc: { totalCredits: event.credits },
      });
      registration.creditsAssigned = true;
    } else if (attendanceStatus === 'Absent' && registration.creditsAssigned && event.credits) {
      // Remove credits if changing from Present to Absent
      await User.findByIdAndUpdate(registration.studentId._id, {
        $inc: { totalCredits: -event.credits },
      });
      registration.creditsAssigned = false;
    }

    await registration.save();

    // Send attendance confirmation if marked present
    if (attendanceStatus === 'Present') {
      const template = emailTemplates.attendanceConfirmation(registration.eventId, registration.studentId.name);
      sendEmail(registration.studentId.email, template.subject, template.html);
    }

    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: 'Server error marking attendance.', error: error.message });
  }
};

// GET /api/registrations/stats/me
exports.getMyStats = async (req, res) => {
  try {
    const totalRegistered = await Registration.countDocuments({ studentId: req.user._id });
    const totalAttended = await Registration.countDocuments({
      studentId: req.user._id,
      attendanceStatus: 'Present',
    });
    const attendancePercentage = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

    const upcomingRegistrations = await Registration.find({ studentId: req.user._id })
      .populate('eventId')
      .then((regs) => regs.filter((r) => r.eventId && new Date(r.eventId.eventDateTime) > new Date()));

    // Get student's total credits
    const student = await User.findById(req.user._id);

    res.json({
      totalRegistered,
      totalAttended,
      attendancePercentage,
      upcomingCount: upcomingRegistrations.length,
      totalCredits: student?.totalCredits || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats.', error: error.message });
  }
};
