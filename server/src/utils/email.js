import nodemailer from "nodemailer";

/**
 * Send an email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version of the email
 * @param {string} options.html - HTML version of the email
 * @returns {Promise} - Resolves with the nodemailer info object
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // For development, we can use secure: false, but in production, it should be true
      secure: process.env.NODE_ENV === "production",
    });

    // Create the email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Bug Tracker <noreply@bug-tracker.com>",
      to,
      subject,
      text,
      html,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Send a welcome email to a new user
 * @param {Object} user - User object
 * @returns {Promise} - Resolves with the nodemailer info object
 */
export const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: "Welcome to Bug Tracker",
    text: `Hi ${user.name},\n\nWelcome to Bug Tracker! We're excited to have you on board.\n\nRegards,\nThe Bug Tracker Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Bug Tracker!</h2>
        <p>Hi ${user.name},</p>
        <p>We're excited to have you on board. Here are a few things you can do to get started:</p>
        <ul>
          <li>Create or join a team</li>
          <li>Start a new project</li>
          <li>Track issues and collaborate with your team</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Regards,<br>The Bug Tracker Team</p>
      </div>
    `,
  });
};

/**
 * Send a password reset email
 * @param {Object} options - Reset options
 * @param {string} options.email - User email
 * @param {string} options.resetToken - Reset token
 * @param {string} options.name - User name
 * @returns {Promise} - Resolves with the nodemailer info object
 */
export const sendPasswordResetEmail = async ({ email, resetToken, name }) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  return sendEmail({
    to: email,
    subject: "Password Reset Request",
    text: `Hi ${name},\n\nYou requested a password reset. Please click the following link to reset your password: ${resetUrl}\n\nThis link is valid for 1 hour. If you didn't request this, please ignore this email.\n\nRegards,\nThe Bug Tracker Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested a password reset. Please click the button below to reset your password:</p>
        <p style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </p>
        <p>This link is valid for 1 hour. If you didn't request this, please ignore this email.</p>
        <p>Regards,<br>The Bug Tracker Team</p>
      </div>
    `,
  });
};
