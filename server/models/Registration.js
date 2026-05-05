const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  attendanceStatus: {
    type: String,
    enum: ['Present', 'Absent', 'Not Marked'],
    default: 'Not Marked',
  },
  participated: {
    type: Boolean,
    default: false,
  },
  creditsAssigned: {
    type: Boolean,
    default: false,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  checkInTime: {
    type: Date,
    default: null,
  },
  participationDuration: {
    type: Number,
    default: 0,
  },
  certificateIssued: {
    type: Boolean,
    default: false,
  },
  certificateIssuedAt: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

registrationSchema.index({ studentId: 1, eventId: 1 }, { unique: true });
registrationSchema.index({ eventId: 1, attendanceStatus: 1 });
registrationSchema.index({ studentId: 1, participated: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
