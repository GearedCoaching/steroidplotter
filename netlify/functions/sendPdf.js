const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  console.log("Function started");  
  try {
    const { to, html } = JSON.parse(event.body || '{}');
    console.log("Received:", { to, htmlExists: !!html });

    if (!to || !html) {
      console.error("Missing email or content", { to, html });
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Missing email or content" })
      };
    }

    // (Optionally) log your transporter config here if needed—but do not expose passwords
    console.log("About to send email to", to);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'info@gearedcoaching.com',
        pass: process.env.GMAIL_APP_PASSWORD // Use env var
      }
    });

    await transporter.sendMail({
      from: '"Geared Coaching" <info@gearedcoaching.com>',
      to,
      subject: 'Your Steroid Cycle Report',
      html
    });

    console.log(`Email sent successfully to ${to}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message || "Server error" })
    };
  }
};

