/**
 * Mock Email Utility
 * In production, replace with real Nodemailer + Gmail/SMTP transport.
 * For now, all emails are logged to the console.
 */

const sendEmail = async ({ to, subject, html }) => {
  console.log('\n' + '='.repeat(50));
  console.log('📧  MOCK EMAIL SENT');
  console.log('='.repeat(50));
  console.log(`To      : ${to}`);
  console.log(`Subject : ${subject}`);
  console.log(`Preview : ${html.replace(/<[^>]*>/g, '').trim().substring(0, 150)}...`);
  console.log('='.repeat(50) + '\n');
  return { success: true };
};

const emailTemplates = {
  registrationConfirmed: (studentName, eventTitle, qrToken, eventDate) => ({
    subject: `✅ Registration Confirmed — ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #6366f1;">Registration Confirmed!</h2>
        <p>Hi <strong>${studentName}</strong>,</p>
        <p>You have successfully registered for:</p>
        <h3 style="color: #1a1a2e;">${eventTitle}</h3>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p>Your QR Token: <code style="background:#f0f0f0;padding:4px 8px;border-radius:4px;">${qrToken}</code></p>
        <p>Present this token at the event entrance for check-in.</p>
        <p style="color: #888;">— College Event Management System</p>
      </div>
    `,
  }),

  eventApproved: (clubAdminName, eventTitle, eventDate) => ({
    subject: `🎉 Event Approved — ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #10b981;">Your Event Has Been Approved!</h2>
        <p>Hi <strong>${clubAdminName}</strong>,</p>
        <p>Great news! Your event <strong>${eventTitle}</strong> has been approved by the department.</p>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p>The event is now live and open for student registrations.</p>
        <p style="color: #888;">— College Event Management System</p>
      </div>
    `,
  }),

  eventRejected: (clubAdminName, eventTitle, reason) => ({
    subject: `❌ Event Rejected — ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #ef4444;">Event Rejected</h2>
        <p>Hi <strong>${clubAdminName}</strong>,</p>
        <p>Unfortunately, your event <strong>${eventTitle}</strong> has been rejected by the department.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please review the feedback and re-submit if needed.</p>
        <p style="color: #888;">— College Event Management System</p>
      </div>
    `,
  }),

  eventReminder: (studentName, eventTitle, eventDate, venue) => ({
    subject: `⏰ Reminder — ${eventTitle} is Tomorrow!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #f59e0b;">Event Reminder</h2>
        <p>Hi <strong>${studentName}</strong>,</p>
        <p>This is a reminder that <strong>${eventTitle}</strong> is happening tomorrow!</p>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p><strong>Venue:</strong> ${venue}</p>
        <p>Don't forget to bring your QR ticket for check-in.</p>
        <p style="color: #888;">— College Event Management System</p>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
