const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;
const mailchimp = require('@mailchimp/mailchimp_marketing');

// Configureer Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configureer Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

const listId = process.env.MAILCHIMP_LIST_ID;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { to, subject, html, chartImage, subscribe } = JSON.parse(event.body || '{}');

    if (!to || !html || !chartImage) {
      return { statusCode: 400, body: JSON.stringify({ success: false, error: "Missing required fields" }) };
    }

    // --- Stap 1: E-mail versturen (bestaande logica) ---
    const uploadResult = await cloudinary.uploader.upload(chartImage, { folder: "cycle-charts" });
    const imageUrl = uploadResult.secure_url;
    const finalHtml = html.replace('%%CHART_IMAGE_URL%%', imageUrl);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'info@gearedcoaching.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      }
    });

    await transporter.sendMail({
      from: '"Geared Coaching" <info@gearedcoaching.com>',
      to,
      subject,
      html: finalHtml,
    });

    console.log(`Email sent successfully to ${to}`);

    // --- Stap 2: E-mailadres toevoegen aan Mailchimp ---
   if (subscribe) {
    try {
      await mailchimp.lists.addListMember(listId, {
        email_address: to,
        status: "subscribed", // Zet de gebruiker direct op 'subscribed'
      });
      console.log(`${to} successfully added to Mailchimp list.`);
    } catch (mailchimpError) {
      // Dit is een 'non-critical' error. De gebruiker heeft zijn e-mail al ontvangen.
      // We loggen de fout, maar laten de functie slagen.
      // Mailchimp geeft vaak een error als de gebruiker al op de lijst staat, wat prima is.
      console.warn(`Could not add ${to} to Mailchimp:`, mailchimpError.message);
    }}

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
