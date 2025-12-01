const styles = `
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 30px 20px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
  .content { padding: 40px 30px; }
  .otp-box { background: #f0fdf4; border: 2px dashed #10b981; border-radius: 8px; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; color: #047857; margin: 20px 0; letter-spacing: 5px; }
  .btn { display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; margin-top: 20px; }
  .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
  .footer a { color: #10b981; text-decoration: none; }
`;

const wrapTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ChatApp</h1>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ChatApp Inc. All rights reserved.</p>
      <p>123 Tech Street, Silicon Valley, CA 94025</p>
      <p><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
    </div>
  </div>
</body>
</html>
`;

exports.getVerificationEmail = (otp) => {
    const body = `
    <h2 style="color: #111827; margin-top: 0;">Verify your email address</h2>
    <p>Thanks for starting the registration process for ChatApp. We want to make sure it's really you.</p>
    <p>Please enter the following verification code to complete your registration:</p>
    <div class="otp-box">${otp}</div>
    <p style="font-size: 14px; color: #6b7280;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
  `;
    return wrapTemplate('Verify Email', body);
};

exports.getPasswordResetOtpEmail = (otp) => {
    const body = `
    <h2 style="color: #111827; margin-top: 0;">Reset your password</h2>
    <p>We received a request to reset the password for your ChatApp account.</p>
    <p>Use the code below to proceed with resetting your password:</p>
    <div class="otp-box">${otp}</div>
    <p style="font-size: 14px; color: #6b7280;">This code will expire in 10 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
  `;
    return wrapTemplate('Reset Password', body);
};

exports.getWelcomeEmail = (name) => {
    const body = `
    <h2 style="color: #111827; margin-top: 0;">Welcome to ChatApp, ${name}!</h2>
    <p>We're thrilled to have you on board. You've joined a community of people connecting beyond boundaries.</p>
    <p>Here are a few things you can do to get started:</p>
    <ul style="color: #4b5563; padding-left: 20px;">
      <li style="margin-bottom: 10px;">Complete your profile with a cool avatar.</li>
      <li style="margin-bottom: 10px;">Search for friends by their username.</li>
      <li style="margin-bottom: 10px;">Start your first secure conversation.</li>
    </ul>
    <div style="text-align: center;">
      <a href="#" class="btn" style="color: #ffffff;">Launch ChatApp</a>
    </div>
  `;
    return wrapTemplate('Welcome to ChatApp', body);
};

exports.getPasswordResetSuccessEmail = () => {
    const body = `
    <h2 style="color: #111827; margin-top: 0;">Password Changed Successfully</h2>
    <p>This is a confirmation that the password for your ChatApp account has been changed.</p>
    <div style="text-align: center; margin: 30px 0;">
      <img src="https://cdn-icons-png.flaticon.com/512/148/148767.png" alt="Success" width="64" height="64" style="opacity: 0.8;">
    </div>
    <p>If you did not make this change, please contact our support team immediately.</p>
    <div style="text-align: center;">
      <a href="#" class="btn" style="color: #ffffff;">Log In Now</a>
    </div>
  `;
    return wrapTemplate('Password Changed', body);
};
