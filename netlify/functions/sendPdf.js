const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  console.log("Function started");
  try {
    // Haal nu ook de 'subject' op uit de request body
    const { to, subject, html } = JSON.parse(event.body || '{}');
    console.log("Received:", { to, subject, htmlExists: !!html });

    if (!to || !html || !subject) {
      console.error("Missing email, subject, or content", { to, subject, html });
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Missing email, subject, or content" })
      };
    }

    console.log("About to send email to", to);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'info@gearedcoaching.com',
        pass: process.env.GMAIL_APP_PASSWORD // Perfect!
      }
    });

    await transporter.sendMail({
      from: '"Geared Coaching" <info@gearedcoaching.com>',
      to,
      subject: subject, // Gebruik de variabele 'subject'
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
