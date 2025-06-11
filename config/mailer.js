const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email, token) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Vérification de votre compte",
      html: `
        <h2>Bienvenue !</h2>
        <p>Cliquez sur le lien ci-dessous pour vérifier votre compte :</p>
        <a href="${process.env.FRONTEND_URL}/verification?token=${token}">
          Vérifier mon compte
        </a>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé :", info.response);
    return true;
  } catch (error) {
    console.error("Erreur mail :", error);
    return false;
  }
}

// ✅ Export en CommonJS
module.exports = {
  sendVerificationEmail,
};
