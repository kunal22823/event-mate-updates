const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const EventAnalytics = require('../models/EventAnalytics');
const CommitteeMetrics = require('../models/CommitteeMetrics');

// GET /api/analytics/dashboard/overview
exports.getDashboardOverview = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only admins can access analytics.' });
    }

    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalMembers = await User.countDocuments({ role: 'member' });

    const totalPresent = await Registration.countDocuments({ attendanceStatus: 'Present' });
    const overallAttendanceRate = totalRegistrations > 0 ? Math.round((totalPresent / totalRegistrations) * 100) : 0;

    const totalCreditsDistributed = await Registration.aggregate([
      { $match: { creditsAssigned: true } },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event',
        },
      },
      {
        $group: {
          _id: null,
          totalCredits: {
            $sum: { $arrayElemAt: ['$event.credits', 0] },
          },
        },
      },
    ]);

    const totalCertificates = await Registration.countDocuments({ certificateIssued: true });

    // Top committees by registrations
    const topCommittees = await Event.aggregate([
      {
        $group: {
          _id: '$committeeName',
          totalEvents: { $sum: 1 },
          totalRegistrations: { $sum: '$totalRegistrations' },
        },
      },
      { $sort: { totalRegistrations: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalEvents,
      totalRegistrations,
      totalStudents,
      totalMembers,
      overallAttendanceRate,
      totalCreditsDistributed: totalCreditsDistributed[0]?.totalCredits || 0,
      totalCertificates,
      topCommittees,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching analytics.', error: error.message });
  }
};

// GET /api/analytics/events
exports.getAllEventsAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only admins can access analytics.' });
    }

    const events = await Event.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const registrations = await Registration.find({ eventId: event._id });
        const presentCount = registrations.filter((r) => r.attendanceStatus === 'Present').length;
        const attendanceRate = registrations.length > 0 ? Math.round((presentCount / registrations.length) * 100) : 0;

        return {
          ...event,
          totalRegistrations: registrations.length,
          totalPresent: presentCount,
          attendanceRate,
        };
      })
    );

    res.json(eventsWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching event analytics.', error: error.message });
  }
};

// GET /api/analytics/committees
exports.getCommitteeAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only admins can access analytics.' });
    }

    const committees = await Event.aggregate([
      {
        $group: {
          _id: '$committeeName',
          totalEvents: { $sum: 1 },
          totalRegistrations: { $sum: '$totalRegistrations' },
          totalPresent: { $sum: '$totalPresent' },
        },
      },
      { $sort: { totalEvents: -1 } },
    ]);

    const committeeDetails = await Promise.all(
      committees.map(async (committee) => {
        const events = await Event.find({ committeeName: committee._id }).select('_id');
        const eventIds = events.map((e) => e._id);

        const registrations = await Registration.find({ eventId: { $in: eventIds } });
        const presentCount = registrations.filter((r) => r.attendanceStatus === 'Present').length;
        const attendanceRate =
          registrations.length > 0 ? Math.round((presentCount / registrations.length) * 100) : 0;

        const totalCredits = await Registration.aggregate([
          { $match: { eventId: { $in: eventIds }, creditsAssigned: true } },
          {
            $lookup: {
              from: 'events',
              localField: 'eventId',
              foreignField: '_id',
              as: 'event',
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $arrayElemAt: ['$event.credits', 0] } },
            },
          },
        ]);

        return {
          committeeName: committee._id,
          totalEvents: committee.totalEvents,
          totalRegistrations: registrations.length,
          totalPresent: presentCount,
          attendanceRate,
          totalCreditsDistributed: totalCredits[0]?.total || 0,
        };
      })
    );

    res.json(committeeDetails);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching committee analytics.', error: error.message });
  }
};

// GET /api/analytics/students
exports.getStudentAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only admins can access analytics.' });
    }

    const students = await User.find({ role: 'student' }).lean();

    const studentStats = await Promise.all(
      students.map(async (student) => {
        const registrations = await Registration.find({ studentId: student._id });
        const presentCount = registrations.filter((r) => r.attendanceStatus === 'Present').length;
        const attendanceRate = registrations.length > 0 ? Math.round((presentCount / registrations.length) * 100) : 0;

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          course: student.course,
          year: student.year,
          totalRegistrations: registrations.length,
          totalAttended: presentCount,
          attendanceRate,
          totalCredits: student.totalCredits,
        };
      })
    );

    res.json(studentStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching student analytics.', error: error.message });
  }
};

// GET /api/analytics/timeline?startDate=&endDate=
exports.getTimelineAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only admins can access analytics.' });
    }

    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.eventDateTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const events = await Event.find(query).sort({ eventDateTime: 1 });

    const timeline = await Promise.all(
      events.map(async (event) => {
        const registrations = await Registration.find({ eventId: event._id });
        const presentCount = registrations.filter((r) => r.attendanceStatus === 'Present').length;

        return {
          eventId: event._id,
          eventTitle: event.title,
          eventDateTime: event.eventDateTime,
          totalRegistrations: registrations.length,
          totalPresent: presentCount,
          attendanceRate: registrations.length > 0 ? Math.round((presentCount / registrations.length) * 100) : 0,
        };
      })
    );

    res.json(timeline);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching timeline analytics.', error: error.message });
  }
};

// GET /api/analytics/member/:memberId
exports.getMemberAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin' && req.user._id.toString() !== req.params.memberId) {
      return res.status(403).json({ message: 'Not authorized to view this analytics.' });
    }

    const { memberId } = req.params;
    const events = await Event.find({ createdBy: memberId }).lean();

    const memberStats = await Promise.all(
      events.map(async (event) => {
        const registrations = await Registration.find({ eventId: event._id });
        const presentCount = registrations.filter((r) => r.attendanceStatus === 'Present').length;

        return {
          ...event,
          totalRegistrations: registrations.length,
          totalPresent: presentCount,
          attendanceRate: registrations.length > 0 ? Math.round((presentCount / registrations.length) * 100) : 0,
        };
      })
    );

    const totalEvents = memberStats.length;
    const totalRegistrations = memberStats.reduce((sum, e) => sum + e.totalRegistrations, 0);
    const totalAttended = memberStats.reduce((sum, e) => sum + e.totalPresent, 0);
    const overallAttendanceRate = totalRegistrations > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0;

    res.json({
      totalEvents,
      totalRegistrations,
      totalAttended,
      overallAttendanceRate,
      events: memberStats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching member analytics.', error: error.message });
  }
};
