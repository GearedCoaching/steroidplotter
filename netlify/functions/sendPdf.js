const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  const { to, html } = JSON.parse(event.body || '{}');

  if (!to || !html) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: "Missing email or content" })
    };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'info@gearedcoaching.com',
      pass: 'G!lles12345' // get this from Gmail settings
    }
  });

  await transporter.sendMail({
    from: '"Geared Coaching" <info@gearedcoaching.com>',
    to,
    subject: 'Your Steroid Cycle Calculation',
    html
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
