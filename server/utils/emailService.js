const nodemailer = require('nodemailer');

// Configure email transporter (Gmail example)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to send emails
const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('[Email] Email credentials not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Error sending email:', error.message);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  committeeMembershipRequest: (userName, approvalLink) => ({
    subject: 'New Committee Member Signup - Pending Approval',
    html: `
      <h2>New Committee Member Registration</h2>
      <p>A new user has signed up as a committee member and is pending approval.</p>
      <p><strong>User:</strong> ${userName}</p>
      <p><a href="${approvalLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Request</a></p>
    `,
  }),

  membershipApproved: (userName, credits) => ({
    subject: 'Committee Membership Approved',
    html: `
      <h2>Welcome to the Committee!</h2>
      <p>Dear ${userName},</p>
      <p>Your committee membership has been approved! You now have full access to all committee features.</p>
      <p>You can now:</p>
      <ul>
        <li>Create and manage events</li>
        <li>Track registrations and attendance</li>
        <li>Export event data</li>
        <li>View analytics</li>
      </ul>
    `,
  }),

  membershipRejected: (userName, reason) => ({
    subject: 'Committee Membership Request - Not Approved',
    html: `
      <h2>Committee Membership Update</h2>
      <p>Dear ${userName},</p>
      <p>Unfortunately, your committee membership request was not approved at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Please contact administrators for more information.</p>
    `,
  }),

  registrationConfirmation: (eventTitle, eventDate) => ({
    subject: `Registration Confirmed: ${eventTitle}`,
    html: `
      <h2>Registration Confirmed</h2>
      <p>You have successfully registered for the event.</p>
      <p><strong>Event:</strong> ${eventTitle}</p>
      <p><strong>Date:</strong> ${new Date(eventDate).toLocaleString('en-IN')}</p>
      <p>We look forward to seeing you!</p>
    `,
  }),

  attendanceConfirmation: (eventTitle) => ({
    subject: `Attendance Confirmed: ${eventTitle}`,
    html: `
      <h2>Attendance Marked</h2>
      <p>Your attendance has been confirmed for:</p>
      <p><strong>${eventTitle}</strong></p>
      <p>Thank you for participating!</p>
    `,
  }),

  creditAssignment: (eventTitle, credits) => ({
    subject: `Credits Awarded: ${eventTitle}`,
    html: `
      <h2>Credits Awarded</h2>
      <p>Credits have been assigned for your participation in the event.</p>
      <p><strong>Event:</strong> ${eventTitle}</p>
      <p><strong>Credits:</strong> ${credits}</p>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
