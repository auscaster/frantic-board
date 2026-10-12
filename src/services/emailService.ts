import nodemailer from 'nodemailer';

interface SignInPayload {
  to: string;
  name: string;
  link: string;
}

interface RecoveryPayload {
  to: string;
  name: string;
  code: string;
}

/**
 * Simple wrapper around nodemailer. In production the transport is configured
 * via environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS, etc.).
 */
class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendSignInLink(payload: SignInPayload): Promise<void> {
    const { to, name, link } = payload;
    const mailOptions = {
      from: `"Frantic Board Support" <${process.env.SMTP_FROM || 'support@frantic-board.app'}>`,
      to,
      subject: 'Your Frantic Board Sign‑In Link',
      text: `Hello ${name},

Here is your sign‑in link. It will be valid for 2 hours:

${link}

If you did not request this, please ignore this e‑mail.

— Frantic Board Team`,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendRecoveryCode(payload: RecoveryPayload): Promise<void> {
    const { to, name, code } = payload;
    const mailOptions = {
      from: `"Frantic Board Support" <${process.env.SMTP_FROM || 'support@frantic-board.app'}>`,
      to,
      subject: 'Frantic Board Private Account Recovery',
      text: `Hello ${name},

Your private recovery code is **${code}**. Use it within the next 15 minutes to complete the recovery process.

If you did not request this, please contact support immediately.

— Frantic Board Team`,
    };
    await this.transporter.sendMail(mailOptions);
  }
}

export default new EmailService();
