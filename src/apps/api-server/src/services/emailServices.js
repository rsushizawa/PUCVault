const nodemailer = require('nodemailer');


const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');

require('dotenv').config({ path: envPath });

const email_user = process.env.EMAIL_USER;
const secret = process.env.EMAIL_SECRET;


exports.sendEmail = async (email, code) => {
  try {

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email_user,
        pass: secret
      }
    });

    const EmailBody = {
      from: `"Suporte PUCVault" <${email_user}>`,
      to: email,
      subject: 'Recuperação de Senha',
      text: `PIN: ${code}`,
      html: `<h2> PIN: ${code}</h2>`
    }
    const info = await transporter.sendMail(EmailBody);
    console.log('Email sent successfully: ', info.messageId);
  } catch (error) {
    console.error('Error sending email: ', error);


  }
};


