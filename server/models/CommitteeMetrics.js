const mongoose = require('mongoose');

const committeeMetricsSchema = new mongoose.Schema({
  committeeName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  totalEvents: {
    type: Number,
    default: 0,
  },
  totalRegistrations: {
    type: Number,
    default: 0,
  },
  totalAttendees: {
    type: Number,
    default: 0,
  },
  averageAttendanceRate: {
    type: Number,
    default: 0,
  },
  totalCreditsDistributed: {
    type: Number,
    default: 0,
  },
  totalCertificatesIssued: {
    type: Number,
    default: 0,
  },
  eventMetrics: [
    {
      eventId: mongoose.Schema.Types.ObjectId,
      eventTitle: String,
      registrations: Number,
      attendees: Number,
      attendanceRate: Number,
      creditsDistributed: Number,
      certificatesIssued: Number,
      dateTime: Date,
    },
  ],
  monthlyStats: [
    {
      month: String,
      year: Number,
      events: Number,
      registrations: Number,
      attendees: Number,
      creditsDistributed: Number,
    },
  ],
  topPerformingEvents: [
    {
      eventId: mongoose.Schema.Types.ObjectId,
      eventTitle: String,
      attendanceRate: Number,
      registrations: Number,
    },
  ],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

committeeMetricsSchema.index({ committeeName: 1 });
committeeMetricsSchema.index({ lastUpdated: -1 });

module.exports = mongoose.model('CommitteeMetrics', committeeMetricsSchema);
