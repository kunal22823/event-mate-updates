const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Event Mate" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Email sending failed to ${to}:`, error.message);
  }
};

const emailTemplates = {
  newEvent: (event) => ({
    subject: `New Event: ${event.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Event Mate</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc;">
          <h2 style="color: #1e40af;">New Event Added!</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0;">${event.title}</h3>
            <p>${event.description}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Date:</strong> ${new Date(event.eventDateTime).toLocaleString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <p style="margin-top: 20px;">Login to Event Mate to register for this event.</p>
        </div>
      </div>
    `,
  }),

  registrationConfirmation: (event, studentName) => ({
    subject: `Registration Confirmed: ${event.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Event Mate</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc;">
          <h2 style="color: #16a34a;">Registration Confirmed!</h2>
          <p>Hi ${studentName},</p>
          <p>You have successfully registered for the following event:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0;">${event.title}</h3>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Date:</strong> ${new Date(event.eventDateTime).toLocaleString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <p style="margin-top: 20px;">Make sure to attend the event. Your attendance will be marked by the organizer.</p>
        </div>
      </div>
    `,
  }),

  attendanceConfirmation: (event, studentName) => ({
    subject: `Attendance Confirmed: ${event.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Event Mate</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc;">
          <h2 style="color: #16a34a;">Attendance Marked - Present!</h2>
          <p>Hi ${studentName},</p>
          <p>Your attendance has been confirmed for:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0;">${event.title}</h3>
            <p><strong>Date:</strong> ${new Date(event.eventDateTime).toLocaleString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <p style="margin-top: 20px;">Thank you for participating!</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
