import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a test account for development
const createTestAccount = async () => {
  return await nodemailer.createTestAccount();
};

// Create a transporter object using the default SMTP transport
const createTransporter = async () => {
  if (process.env.NODE_ENV === 'development') {
    const testAccount = await createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  // Production configuration (update with your actual SMTP settings)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Read email template file
const readTemplate = async (templateName, context) => {
  try {
    const templatePath = path.join(
      __dirname,
      '..',
      'templates',
      'emails',
      `${templateName}.html`
    );
    
    let template = await fs.promises.readFile(templatePath, 'utf8');
    
    // Replace placeholders with actual values
    Object.keys(context).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, context[key]);
    });
    
    return template;
  } catch (error) {
    console.error('Error reading email template:', error);
    return null;
  }
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text version of the email
 * @param {string} [options.html] - HTML version of the email
 * @param {string} [options.template] - Template name (without .html extension)
 * @param {Object} [options.context] - Context object for template placeholders
 * @returns {Promise<Object>} - Result of sending the email
 */
export const sendEmail = async ({
  to,
  subject,
  text = '',
  html = '',
  template,
  context = {},
}) => {
  try {
    const transporter = await createTransporter();
    
    // If template is provided, use it to generate HTML
    if (template) {
      html = await readTemplate(template, context);
    }
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Afari Real Estate'}" <${process.env.EMAIL_FROM || 'noreply@afari-real-estate.com'}>`,
      to,
      subject,
      text,
      html,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// sendEmail is already exported as a named export at its declaration
