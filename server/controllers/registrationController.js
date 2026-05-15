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

    const user = await User.findById(req.user._id);

    // Validation: Event creator cannot register for their own event
    if (event.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot register for your own event.' });
    }

    // Validation: Only students and approved committee members can register
    if (user.role === 'student' || (user.role === 'member')) {
      // Check if registration is past event time
      const now = new Date();
      if (now > new Date(event.eventDateTime)) {
        return res.status(400).json({ message: 'Event has already started. Registration is closed.' });
      }
    } else if (user.role === 'member' && !user.committeeApproved) {
      return res.status(403).json({
        message: 'Your committee membership is pending approval. Please wait for admin approval before registering.',
        status: user.committeeStatus,
      });
    }

    // Check if already registered
    const existing = await Registration.findOne({
      studentId: req.user._id,
      eventId,
    });

    if (existing) {
      return res.status(400).json({ message: 'You are already registered for this event.' });
    }

    // Check capacity if set
    if (event.maxCapacity && event.totalRegistrations >= event.maxCapacity) {
      return res.status(400).json({ message: 'Event has reached maximum capacity.' });
    }

    const registration = await Registration.create({
      studentId: req.user._id,
      eventId,
      userRole: user.role,
      committeeName: user.role === 'member' ? event.committeeName : null,
    });

    // Update event participant counts and list
    const participantEntry = {
      userId: req.user._id,
      userRole: user.role,
      course: user.course || null,
      year: user.year || null,
      attendanceStatus: 'Not Marked',
    };

    if (user.role === 'student') {
      // Determine course for counting
      if (user.course === 'MCA') {
        await Event.findByIdAndUpdate(eventId, {
          $inc: { MCA_count: 1, totalRegistrations: 1 },
          $push: { participantsList: participantEntry },
        });
      } else if (user.course === 'MMS') {
        await Event.findByIdAndUpdate(eventId, {
          $inc: { MMS_count: 1, totalRegistrations: 1 },
          $push: { participantsList: participantEntry },
        });
      } else {
        await Event.findByIdAndUpdate(eventId, {
          $inc: { totalRegistrations: 1 },
          $push: { participantsList: participantEntry },
        });
      }
    } else if (user.role === 'member') {
      await Event.findByIdAndUpdate(eventId, {
        $inc: { committeeParticipantCount: 1, totalRegistrations: 1 },
        $push: { participantsList: participantEntry },
      });
    }

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

// POST /api/registrations/:id/check-in
exports.checkIn = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findById(id).populate('eventId');
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    // Check if event is still ongoing
    const event = registration.eventId;
    const now = new Date();
    if (now < new Date(event.eventDateTime)) {
      return res.status(400).json({ message: 'Event has not started yet.' });
    }

    if (registration.checkInTime) {
      return res.status(400).json({ message: 'You have already checked in for this event.' });
    }

    registration.checkInTime = now;
    await registration.save();

    res.json({ message: 'Check-in successful', registration });
  } catch (error) {
    res.status(500).json({ message: 'Server error during check-in.', error: error.message });
  }
};

// PUT /api/registrations/:id/attendance (updated with duration tracking)
exports.markAttendanceWithDuration = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendanceStatus, participationDuration = 0, notes = null } = req.body;

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
    registration.participationDuration = participationDuration;
    registration.notes = notes;
    registration.updatedAt = new Date();

    // Credit logic: safe & idempotent
    if (attendanceStatus === 'Present' && !registration.creditsAssigned && event.credits) {
      await User.findByIdAndUpdate(registration.studentId._id, {
        $inc: { totalCredits: event.credits },
      });
      registration.creditsAssigned = true;
    } else if (attendanceStatus === 'Absent' && registration.creditsAssigned && event.credits) {
      await User.findByIdAndUpdate(registration.studentId._id, {
        $inc: { totalCredits: -event.credits },
      });
      registration.creditsAssigned = false;
    }

    await registration.save();

    // Update event statistics
    const presentCount = await Registration.countDocuments({ eventId: event._id, attendanceStatus: 'Present' });
    const absentCount = await Registration.countDocuments({ eventId: event._id, attendanceStatus: 'Absent' });
    const totalCount = await Registration.countDocuments({ eventId: event._id });

    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    await Event.findByIdAndUpdate(event._id, {
      totalPresent: presentCount,
      totalAbsent: absentCount,
      totalRegistrations: totalCount,
      attendanceRate,
      updatedAt: new Date(),
    });

    // Send attendance confirmation if marked present
    if (attendanceStatus === 'Present') {
      const template = emailTemplates.attendanceConfirmation(event, registration.studentId.name);
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

// GET /api/registrations/event/:eventId/detailed-stats
exports.getEventDetailedStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check authorization
    if (req.user.role === 'member' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view event statistics.' });
    }

    const registrations = await Registration.find({ eventId }).populate('studentId', 'name email course year');

    const presentCount = registrations.filter((r) => r.attendanceStatus === 'Present').length;
    const absentCount = registrations.filter((r) => r.attendanceStatus === 'Absent').length;
    const notMarkedCount = registrations.filter((r) => r.attendanceStatus === 'Not Marked').length;

    const attendanceRate = registrations.length > 0 ? Math.round((presentCount / registrations.length) * 100) : 0;
    const avgParticipationDuration = registrations.length > 0
      ? Math.round(registrations.reduce((sum, r) => sum + r.participationDuration, 0) / registrations.length)
      : 0;

    const certificatesIssued = registrations.filter((r) => r.certificateIssued).length;
    const totalCreditsDistributed = registrations.reduce((sum, r) => (r.creditsAssigned ? sum + (event.credits || 0) : sum), 0);

    res.json({
      eventTitle: event.title,
      totalRegistrations: registrations.length,
      presentCount,
      absentCount,
      notMarkedCount,
      attendanceRate,
      avgParticipationDuration,
      certificatesIssued,
      totalCreditsDistributed,
      registrations,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching event statistics.', error: error.message });
  }
};
