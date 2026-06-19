const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailTemplates = {
  welcome: (name) => ({
    subject: '🎓 Welcome to HU Campus Guard - Hazara University',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f9f9f9;border-radius:8px;overflow:hidden">
        <div style="background:#1a237e;padding:30px;text-align:center">
          <h1 style="color:#fff;margin:0">🛡️ HU Campus Guard</h1>
          <p style="color:#90caf9;margin:5px 0">Hazara University Campus Safety Platform</p>
        </div>
        <div style="padding:30px;background:#fff">
          <h2 style="color:#1a237e">Welcome, ${name}!</h2>
          <p style="color:#555;line-height:1.6">Your HU Campus Guard account has been created successfully. You can now report campus issues, track complaint status, and communicate with university proctors.</p>
          <div style="background:#e8eaf6;border-radius:6px;padding:15px;margin:20px 0">
            <p style="color:#3949ab;margin:0"><strong>Your account is now active.</strong> Login to get started.</p>
          </div>
          <p style="color:#888;font-size:12px;margin-top:30px">© ${new Date().getFullYear()} HU Campus Guard - Hazara University, Mansehra</p>
        </div>
      </div>
    `,
  }),

  complaintSubmitted: (name, refNumber, title) => ({
    subject: `✅ Complaint Received - ${refNumber} | HU Campus Guard`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f9f9f9;border-radius:8px;overflow:hidden">
        <div style="background:#1a237e;padding:30px;text-align:center">
          <h1 style="color:#fff;margin:0">🛡️ HU Campus Guard</h1>
        </div>
        <div style="padding:30px;background:#fff">
          <h2 style="color:#1a237e">Complaint Received</h2>
          <p style="color:#555">Dear ${name},</p>
          <p style="color:#555;line-height:1.6">Your complaint has been successfully submitted. Here are your details:</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:10px;background:#e8eaf6;font-weight:bold;color:#3949ab">Reference Number</td><td style="padding:10px;background:#f5f5f5"><strong>${refNumber}</strong></td></tr>
            <tr><td style="padding:10px;background:#e8eaf6;font-weight:bold;color:#3949ab">Title</td><td style="padding:10px;background:#f5f5f5">${title}</td></tr>
            <tr><td style="padding:10px;background:#e8eaf6;font-weight:bold;color:#3949ab">Status</td><td style="padding:10px;background:#f5f5f5"><span style="background:#fff3e0;color:#e65100;padding:3px 8px;border-radius:4px">Pending</span></td></tr>
          </table>
          <p style="color:#555">Please save your reference number to track the status of your complaint.</p>
          <p style="color:#888;font-size:12px;margin-top:30px">© ${new Date().getFullYear()} HU Campus Guard - Hazara University</p>
        </div>
      </div>
    `,
  }),

  statusUpdate: (name, refNumber, oldStatus, newStatus, message) => ({
    subject: `📋 Complaint Status Update - ${refNumber} | HU Campus Guard`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f9f9f9;border-radius:8px;overflow:hidden">
        <div style="background:#1a237e;padding:30px;text-align:center">
          <h1 style="color:#fff;margin:0">🛡️ HU Campus Guard</h1>
        </div>
        <div style="padding:30px;background:#fff">
          <h2 style="color:#1a237e">Complaint Status Updated</h2>
          <p style="color:#555">Dear ${name},</p>
          <p style="color:#555">Your complaint <strong>${refNumber}</strong> status has been updated.</p>
          <div style="display:flex;align-items:center;margin:20px 0;gap:10px">
            <span style="background:#ffebee;color:#c62828;padding:6px 14px;border-radius:20px;font-size:13px">${oldStatus.replace('_', ' ').toUpperCase()}</span>
            <span style="color:#888">→</span>
            <span style="background:#e8f5e9;color:#2e7d32;padding:6px 14px;border-radius:20px;font-size:13px">${newStatus.replace('_', ' ').toUpperCase()}</span>
          </div>
          ${message ? `<div style="background:#e8eaf6;border-radius:6px;padding:15px;margin:15px 0"><p style="color:#3949ab;margin:0">${message}</p></div>` : ''}
          <p style="color:#888;font-size:12px;margin-top:30px">© ${new Date().getFullYear()} HU Campus Guard - Hazara University</p>
        </div>
      </div>
    `,
  }),

  complaintAssigned: (proctorName, refNumber, title) => ({
    subject: `📌 New Complaint Assigned to You - ${refNumber} | HU Campus Guard`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f9f9f9;border-radius:8px;overflow:hidden">
        <div style="background:#1a237e;padding:30px;text-align:center">
          <h1 style="color:#fff;margin:0">🛡️ HU Campus Guard</h1>
        </div>
        <div style="padding:30px;background:#fff">
          <h2 style="color:#1a237e">New Complaint Assigned</h2>
          <p style="color:#555">Dear ${proctorName},</p>
          <p style="color:#555">A new complaint has been assigned to you for resolution.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:10px;background:#e8eaf6;font-weight:bold;color:#3949ab">Reference</td><td style="padding:10px;background:#f5f5f5">${refNumber}</td></tr>
            <tr><td style="padding:10px;background:#e8eaf6;font-weight:bold;color:#3949ab">Title</td><td style="padding:10px;background:#f5f5f5">${title}</td></tr>
          </table>
          <p style="color:#555">Please login to HU Campus Guard to review and take action on this complaint.</p>
          <p style="color:#888;font-size:12px;margin-top:30px">© ${new Date().getFullYear()} HU Campus Guard - Hazara University</p>
        </div>
      </div>
    `,
  }),

  passwordReset: (name, resetUrl) => ({
    subject: '🔐 Password Reset - HU Campus Guard',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f9f9f9;border-radius:8px;overflow:hidden">
        <div style="background:#1a237e;padding:30px;text-align:center">
          <h1 style="color:#fff;margin:0">🛡️ HU Campus Guard</h1>
        </div>
        <div style="padding:30px;background:#fff">
          <h2 style="color:#1a237e">Password Reset Request</h2>
          <p style="color:#555">Dear ${name},</p>
          <p style="color:#555">You requested a password reset. Click the button below to reset your password. This link expires in 1 hour.</p>
          <div style="text-align:center;margin:30px 0">
            <a href="${resetUrl}" style="background:#1a237e;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold">Reset Password</a>
          </div>
          <p style="color:#888;font-size:12px">If you did not request this, please ignore this email. Your password remains unchanged.</p>
          <p style="color:#888;font-size:12px;margin-top:30px">© ${new Date().getFullYear()} HU Campus Guard - Hazara University</p>
        </div>
      </div>
    `,
  }),
};

const sendEmail = async ({ to, templateName, templateData, subject, html }) => {
  try {
    let emailContent;

    if (templateName && emailTemplates[templateName]) {
      emailContent = emailTemplates[templateName](...templateData);
    } else {
      emailContent = { subject, html };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `HU Campus Guard <${process.env.EMAIL_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    // Don't throw - email failure shouldn't break the app
  }
};

module.exports = { sendEmail };
