const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role && ['student', 'member', 'superadmin'].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users.', error: error.message });
  }
};

// GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalMembers = await User.countDocuments({ role: 'member' });
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalAttendance = await Registration.countDocuments({ attendanceStatus: 'Present' });
    const attendanceRate = totalRegistrations > 0 ? Math.round((totalAttendance / totalRegistrations) * 100) : 0;

    // Events by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const eventsByMonth = await Event.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Registrations by month (last 6 months)
    const registrationsByMonth = await Registration.aggregate([
      { $match: { registeredAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$registeredAt' },
            month: { $month: '$registeredAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Attendance breakdown
    const attendanceBreakdown = await Registration.aggregate([
      {
        $group: {
          _id: '$attendanceStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalUsers,
      totalStudents,
      totalMembers,
      totalEvents,
      totalRegistrations,
      totalAttendance,
      attendanceRate,
      eventsByMonth: eventsByMonth.map((e) => ({
        month: `${e._id.year}-${String(e._id.month).padStart(2, '0')}`,
        count: e.count,
      })),
      registrationsByMonth: registrationsByMonth.map((r) => ({
        month: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
        count: r.count,
      })),
      attendanceBreakdown: attendanceBreakdown.map((a) => ({
        status: a._id,
        count: a.count,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching analytics.', error: error.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete a super admin.' });
    }

    // Clean up related data
    if (user.role === 'student') {
      await Registration.deleteMany({ studentId: user._id });
    } else if (user.role === 'member') {
      const memberEvents = await Event.find({ createdBy: user._id });
      const eventIds = memberEvents.map((e) => e._id);
      await Registration.deleteMany({ eventId: { $in: eventIds } });
      await Event.deleteMany({ createdBy: user._id });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting user.', error: error.message });
  }
};

// DELETE /api/admin/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    await Registration.deleteMany({ eventId: event._id });
    await Event.findByIdAndDelete(event._id);

    res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting event.', error: error.message });
  }
};
