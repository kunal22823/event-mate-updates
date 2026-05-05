const mongoose = require('mongoose');

const eventAnalyticsSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    unique: true,
  },
  totalRegistrations: {
    type: Number,
    default: 0,
  },
  totalPresent: {
    type: Number,
    default: 0,
  },
  totalAbsent: {
    type: Number,
    default: 0,
  },
  totalNotMarked: {
    type: Number,
    default: 0,
  },
  attendanceRate: {
    type: Number,
    default: 0,
  },
  averageParticipationDuration: {
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
  registrationsByDate: [
    {
      date: Date,
      count: Number,
    },
  ],
  attendanceByHour: [
    {
      hour: Number,
      count: Number,
    },
  ],
  participationMetrics: {
    highParticipants: {
      type: Number,
      default: 0,
    },
    moderateParticipants: {
      type: Number,
      default: 0,
    },
    lowParticipants: {
      type: Number,
      default: 0,
    },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

eventAnalyticsSchema.index({ eventId: 1 });
eventAnalyticsSchema.index({ lastUpdated: -1 });

module.exports = mongoose.model('EventAnalytics', eventAnalyticsSchema);
