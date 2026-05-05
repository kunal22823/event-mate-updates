const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
  },
  eventDateTime: {
    type: Date,
    required: [true, 'Event date and time is required'],
  },
  image: {
    type: String,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  committeeName: {
    type: String,
    required: [true, 'Committee name is required'],
    trim: true,
  },
  registrationLink: {
    type: String,
    trim: true,
    default: null,
  },
  credits: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
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
  totalParticipated: {
    type: Number,
    default: 0,
  },
  attendanceRate: {
    type: Number,
    default: 0,
  },
  maxCapacity: {
    type: Number,
    default: null,
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming',
  },
  eventEndDateTime: {
    type: Date,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

eventSchema.index({ createdBy: 1, status: 1 });
eventSchema.index({ committeeName: 1 });
eventSchema.index({ eventDateTime: 1 });

module.exports = mongoose.model('Event', eventSchema);
