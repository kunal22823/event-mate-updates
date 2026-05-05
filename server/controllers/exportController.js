const XLSX = require('xlsx');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// Helper function to generate Excel file
const generateExcel = (data, sheetName) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Auto-fit columns
  const colWidths = {};
  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      colWidths[key] = Math.max(colWidths[key] || 10, String(row[key]).length + 2);
    });
  });
  ws['!cols'] = Object.values(colWidths).map((w) => ({ wch: w }));

  return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
};

// POST /api/export/event/:eventId/registrations
exports.exportEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check authorization
    if (req.user.role === 'member' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to export this event data.' });
    }

    const registrations = await Registration.find({ eventId }).populate('studentId', 'name email course year');

    const exportData = registrations.map((reg) => ({
      'Student Name': reg.studentId.name,
      'Student Email': reg.studentId.email,
      Course: reg.studentId.course || 'N/A',
      Year: reg.studentId.year || 'N/A',
      'Attendance Status': reg.attendanceStatus,
      'Registered At': new Date(reg.registeredAt).toLocaleString(),
      'Check-in Time': reg.checkInTime ? new Date(reg.checkInTime).toLocaleString() : 'Not checked in',
      'Participation Duration (mins)': reg.participationDuration,
      'Credits Assigned': reg.creditsAssigned ? 'Yes' : 'No',
      'Certificate Issued': reg.certificateIssued ? 'Yes' : 'No',
      Notes: reg.notes || 'N/A',
    }));

    const buffer = generateExcel(exportData, 'Registrations');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="event_registrations_${eventId}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Server error exporting registrations.', error: error.message });
  }
};

// POST /api/export/event/:eventId/attendance-report
exports.exportAttendanceReport = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check authorization
    if (req.user.role === 'member' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to export this event data.' });
    }

    const registrations = await Registration.find({ eventId }).populate('studentId', 'name email course year');

    const presentStudents = registrations.filter((r) => r.attendanceStatus === 'Present');
    const absentStudents = registrations.filter((r) => r.attendanceStatus === 'Absent');
    const notMarkedStudents = registrations.filter((r) => r.attendanceStatus === 'Not Marked');

    const exportData = [
      {
        'Category': 'Summary',
        'Count': '',
        'Percentage': '',
      },
      {
        'Category': 'Total Registrations',
        'Count': registrations.length,
        'Percentage': '100%',
      },
      {
        'Category': 'Present',
        'Count': presentStudents.length,
        'Percentage': `${Math.round((presentStudents.length / registrations.length) * 100)}%`,
      },
      {
        'Category': 'Absent',
        'Count': absentStudents.length,
        'Percentage': `${Math.round((absentStudents.length / registrations.length) * 100)}%`,
      },
      {
        'Category': 'Not Marked',
        'Count': notMarkedStudents.length,
        'Percentage': `${Math.round((notMarkedStudents.length / registrations.length) * 100)}%`,
      },
      {
        'Category': '---',
        'Count': '',
        'Percentage': '',
      },
      {
        'Category': 'Present Students',
        'Count': '',
        'Percentage': '',
      },
      ...presentStudents.map((reg) => ({
        'Category': reg.studentId.name,
        'Count': reg.studentId.email,
        'Percentage': reg.studentId.course,
      })),
    ];

    const buffer = generateExcel(exportData, 'Attendance Report');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_report_${eventId}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Server error exporting attendance report.', error: error.message });
  }
};

// POST /api/export/committee/:committeeName/analytics
exports.exportCommitteeAnalytics = async (req, res) => {
  try {
    const { committeeName } = req.params;

    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only admins can export committee analytics.' });
    }

    const events = await Event.find({ committeeName }).populate('createdBy', 'name email');

    const committeeData = await Promise.all(
      events.map(async (event) => {
        const registrations = await Registration.find({ eventId: event._id });
        const presentCount = registrations.filter((r) => r.attendanceStatus === 'Present').length;
        const attendanceRate = registrations.length > 0 ? Math.round((presentCount / registrations.length) * 100) : 0;

        return {
          'Event Title': event.title,
          'Event Date': new Date(event.eventDateTime).toLocaleDateString(),
          'Location': event.location,
          'Created By': event.createdBy.name,
          'Total Registrations': registrations.length,
          'Total Present': presentCount,
          'Attendance Rate (%)': attendanceRate,
          'Credits': event.credits || 0,
        };
      })
    );

    const buffer = generateExcel(committeeData, 'Committee Analytics');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="committee_analytics_${committeeName}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Server error exporting committee analytics.', error: error.message });
  }
};

// POST /api/export/all-events
exports.exportAllEvents = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only admins can export all events.' });
    }

    const events = await Event.find().populate('createdBy', 'name email').lean();

    const eventsData = await Promise.all(
      events.map(async (event) => {
        const registrations = await Registration.find({ eventId: event._id });
        const presentCount = registrations.filter((r) => r.attendanceStatus === 'Present').length;
        const attendanceRate = registrations.length > 0 ? Math.round((presentCount / registrations.length) * 100) : 0;

        return {
          'Event Title': event.title,
          'Committee': event.committeeName,
          'Event Date': new Date(event.eventDateTime).toLocaleDateString(),
          'Location': event.location,
          'Created By': event.createdBy.name,
          'Total Registrations': registrations.length,
          'Total Present': presentCount,
          'Attendance Rate (%)': attendanceRate,
          'Status': event.status,
          'Credits': event.credits || 0,
        };
      })
    );

    const buffer = generateExcel(eventsData, 'All Events');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="all_events.xlsx"');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Server error exporting events.', error: error.message });
  }
};
