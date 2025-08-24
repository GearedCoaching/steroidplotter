const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  try {
    const { to, html } = JSON.parse(event.body || '{}');
    if (!to || !html) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Missing email or content" })
      };
    }

    // Email sending logic here…
    await transporter.sendMail({ /* ... */ });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message || "Server error" })
    };
  }
};


  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'info@gearedcoaching.com',
      pass: 'vuxb pmhm uwnb qykn'
 // get this from Gmail settings
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
