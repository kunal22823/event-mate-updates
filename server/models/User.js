const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z]+\.[a-z]{2,5}\d{2}@siescoms\.sies\.edu\.in$/,
      'Email must be a valid SIES college email (e.g., kunals.mca25@siescoms.sies.edu.in)',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['superadmin', 'member', 'student'],
    default: 'student',
  },
  course: {
    type: String,
    trim: true,
  },
  year: {
    type: String,
    trim: true,
  },
  totalCredits: {
    type: Number,
    default: 0,
  },
  remainingCredits: {
    type: Number,
    default: 0,
  },
  committeeApproved: {
    type: Boolean,
    default: false,
  },
  committeeStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  committeeApprovalDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.index({ committeeStatus: 1, role: 1 });
userSchema.index({ email: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
