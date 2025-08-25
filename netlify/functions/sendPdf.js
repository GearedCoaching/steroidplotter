const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;

// Configureer Cloudinary met de environment variables die je in Netlify hebt ingesteld
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Haal nu ook de 'chartImage' data op
    const { to, subject, html, chartImage } = JSON.parse(event.body || '{}');

    if (!to || !html || !chartImage) {
      return { statusCode: 400, body: JSON.stringify({ success: false, error: "Missing required fields" }) };
    }

    // 1. Upload de afbeelding naar Cloudinary
    // De 'chartImage' is een base64 data URL, die kan Cloudinary direct verwerken
    const uploadResult = await cloudinary.uploader.upload(chartImage, {
      folder: "cycle-charts", // Optioneel: organiseer uploads in een map
      resource_type: "image"
    });
    
    // De veilige, openbare URL van de geüploade afbeelding
    const imageUrl = uploadResult.secure_url;

    // 2. Vervang de placeholder in de HTML met de echte afbeeldings-URL
    const finalHtml = html.replace('%%CHART_IMAGE_URL%%', imageUrl);

    // 3. Verstuur de e-mail met de bijgewerkte HTML
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
      html: finalHtml, // Gebruik de definitieve HTML
    });

    console.log(`Email sent successfully to ${to} with chart ${imageUrl}`);
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
