const nodemailer = require('nodemailer');


const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');

require('dotenv').config({ path: envPath });

const email_user = process.env.EMAIL_USER;
const secret = process.env.EMAIL_SECRET;


exports.sendEmail = async (email, code, purpose) => {
  try {

    let purpose_string;
    if (purpose === '2fa') {
      purpose_string = 'Autenticação de dois Fatores';
    } else if (purpose === 'email_verification') {
      purpose_string = 'Verificação de Email';
    } else if (purpose === 'password_recovery') {
      purpose_string = 'Recuperação de Senha';
    }

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
      subject: purpose_string,
      text: `PIN: ${code}`,
      html: `<h2> PIN: ${code}</h2>`
    }
    const info = await transporter.sendMail(EmailBody);
    console.log('Email sent successfully: ', info.messageId);
  } catch (error) {
    console.error('Error sending email: ', error);


  }
};


