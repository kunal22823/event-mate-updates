const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const { sendEmail, emailTemplates } = require('../utils/email');

// GET /api/events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .sort({ eventDateTime: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching events.', error: error.message });
  }
};

// GET /api/events/:id
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching event.', error: error.message });
  }
};

// POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, eventDateTime, committeeName, registrationLink, credits } = req.body;

    if (!title || !description || !location || !eventDateTime || !committeeName) {
      return res.status(400).json({ message: 'Title, description, location, event date/time, and committee name are required.' });
    }

    // Backend validation: eventDateTime must be in the future
    const eventDate = new Date(eventDateTime);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date and time format.' });
    }
    if (eventDate <= new Date()) {
      return res.status(400).json({ message: 'Event date and time must be in the future.' });
    }

    const eventData = {
      title,
      description,
      location,
      eventDateTime: eventDate,
      committeeName,
      createdBy: req.user._id,
    };

    if (registrationLink) {
      eventData.registrationLink = registrationLink;
    }

    if (credits !== undefined && credits !== null && credits !== '') {
      eventData.credits = Number(credits);
    }

    if (req.file) {
      eventData.image = `/uploads/${req.file.filename}`;
    }

    const event = await Event.create(eventData);
    const populatedEvent = await Event.findById(event._id).populate('createdBy', 'name email');

    // Send email to all students
    const students = await User.find({ role: 'student' });
    const template = emailTemplates.newEvent(event);
    for (const student of students) {
      sendEmail(student.email, template.subject, template.html);
    }

    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating event.', error: error.message });
  }
};

// PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Only the creator or superadmin can update
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to update this event.' });
    }

    const { title, description, location, eventDateTime, committeeName, registrationLink, credits } = req.body;
    if (title) event.title = title;
    if (description) event.description = description;
    if (location) event.location = location;
    if (eventDateTime) {
      const parsedDate = new Date(eventDateTime);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date and time format.' });
      }
      if (parsedDate <= new Date()) {
        return res.status(400).json({ message: 'Event date and time must be in the future.' });
      }
      event.eventDateTime = parsedDate;
    }
    if (committeeName) event.committeeName = committeeName;
    if (registrationLink !== undefined) event.registrationLink = registrationLink || null;
    if (credits !== undefined) event.credits = credits !== '' && credits !== null ? Number(credits) : null;

    if (req.file) {
      event.image = `/uploads/${req.file.filename}`;
    }

    await event.save();
    const updatedEvent = await Event.findById(event._id).populate('createdBy', 'name email');

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating event.', error: error.message });
  }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Only the creator or superadmin can delete
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to delete this event.' });
    }

    // Delete all registrations for this event
    await Registration.deleteMany({ eventId: event._id });
    await Event.findByIdAndDelete(event._id);

    res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting event.', error: error.message });
  }
};

// GET /api/events/member/mine
exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ eventDateTime: -1 });

    // Attach registration count for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({ eventId: event._id });
        const attendedCount = await Registration.countDocuments({
          eventId: event._id,
          attendanceStatus: 'Present',
        });
        return {
          ...event.toObject(),
          registrationCount,
          attendedCount,
        };
      })
    );

    res.json(eventsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching your events.', error: error.message });
  }
};

// GET /api/events/committee/:committeeName
exports.getEventsByCommittee = async (req, res) => {
  try {
    const { committeeName } = req.params;
    const events = await Event.find({ committeeName })
      .populate('createdBy', 'name email')
      .sort({ eventDateTime: -1 });

    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({ eventId: event._id });
        const attendedCount = await Registration.countDocuments({
          eventId: event._id,
          attendanceStatus: 'Present',
        });
        return {
          ...event.toObject(),
          registrationCount,
          attendedCount,
        };
      })
    );

    res.json(eventsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching committee events.', error: error.message });
  }
};
