import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

// ─── Email Templates ──────────────────────────────────────────────────────────
const emailTemplates = {
  appointmentConfirmation: (data: {
    name: string; date: string; time: string; doctor: string; token: number; phone: string;
  }) => ({
    subject: 'Appointment Confirmed — SAI Physiotherapy',
    html: `
      <div style="font-family:DM Sans,sans-serif;max-width:600px;margin:0 auto;background:#f5f7fa;padding:24px">
        <div style="background:#1B4F8A;color:#fff;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="margin:0;font-size:24px">SAI Physiotherapy</h1>
          <p style="margin:8px 0 0;opacity:0.85">Spine Care & Paralysis Centre</p>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px">
          <h2 style="color:#1B4F8A">Appointment Confirmed ✅</h2>
          <p>Dear <strong>${data.name}</strong>,</p>
          <p>Your appointment has been successfully booked.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;background:#f0f4ff;font-weight:600">Date</td><td style="padding:8px">${data.date}</td></tr>
            <tr><td style="padding:8px;background:#f0f4ff;font-weight:600">Time</td><td style="padding:8px">${data.time}</td></tr>
            <tr><td style="padding:8px;background:#f0f4ff;font-weight:600">Doctor</td><td style="padding:8px">${data.doctor}</td></tr>
            <tr><td style="padding:8px;background:#f0f4ff;font-weight:600">Token #</td><td style="padding:8px;color:#E8A020;font-size:20px;font-weight:700">${data.token}</td></tr>
          </table>
          <p>Need to reschedule? Call us: <strong>${data.phone}</strong></p>
          <p style="color:#6B7280;font-size:14px;margin-top:24px">SAI Physiotherapy Spine Care & Paralysis Centre, Ahmedabad, Gujarat</p>
        </div>
      </div>
    `,
  }),

  paymentReceipt: (data: {
    name: string; invoiceNumber: string; amount: number; balance: number; method: string;
  }) => ({
    subject: `Payment Receipt ${data.invoiceNumber} — SAI Physiotherapy`,
    html: `
      <div style="font-family:DM Sans,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B4F8A;color:#fff;padding:24px;text-align:center">
          <h1 style="margin:0">Payment Receipt</h1>
        </div>
        <div style="padding:24px;background:#fff">
          <p>Dear <strong>${data.name}</strong>,</p>
          <p>Payment received at SAI Physiotherapy.</p>
          <p><strong>Invoice:</strong> ${data.invoiceNumber}</p>
          <p><strong>Amount Paid:</strong> ₹${data.amount.toLocaleString('en-IN')}</p>
          <p><strong>Payment Method:</strong> ${data.method}</p>
          <p><strong>Balance Due:</strong> ₹${data.balance.toLocaleString('en-IN')}</p>
          <p style="color:#6B7280;font-size:12px">Thank you for visiting SAI Physiotherapy!</p>
        </div>
      </div>
    `,
  }),

  passwordReset: (data: { name: string; otp: string }) => ({
    subject: 'Password Reset OTP — SAI Physiotherapy',
    html: `
      <div style="font-family:DM Sans,sans-serif;max-width:600px;margin:0 auto">
        <h2>Password Reset Request</h2>
        <p>Dear ${data.name},</p>
        <p>Your OTP to reset password is:</p>
        <div style="font-size:36px;font-weight:700;color:#1B4F8A;letter-spacing:8px;text-align:center;padding:24px">
          ${data.otp}
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>. Do not share with anyone.</p>
      </div>
    `,
  }),
};

// ─── SMS Templates (MSG91) ────────────────────────────────────────────────────
const smsTemplates = {
  appointmentConfirmation: (data: { name: string; date: string; time: string; doctor: string; token: number; phone: string }) =>
    `Dear ${data.name}, your appointment at Sai Physiotherapy on ${data.date} at ${data.time} with Dr. ${data.doctor} is confirmed. Token: #${data.token}. Call: ${data.phone}`,

  appointmentReminder: (data: { name: string; time: string }) =>
    `Reminder: ${data.name}, your appointment is tomorrow at ${data.time}. Sai Physiotherapy, Ahmedabad.`,

  paymentReceipt: (data: { name: string; amount: number; invoice: string; balance: number }) =>
    `Payment of Rs.${data.amount} received at Sai Physiotherapy. Invoice #${data.invoice}. Balance: Rs.${data.balance}. Thank you!`,

  followUpReminder: (data: { name: string }) =>
    `Dear ${data.name}, it's time for your follow-up visit at Sai Physiotherapy. Call us to book your appointment.`,
};

// ─── Email Transporter ────────────────────────────────────────────────────────
const createTransporter = () => {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    logger.warn('Email service not configured. SMTP credentials missing.');
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
};

// ─── Notification Service ─────────────────────────────────────────────────────
export const notificationService = {
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    const transporter = createTransporter();
    if (!transporter) return false;

    try {
      await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
      logger.info(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      logger.error(`Email failed to ${to}:`, error);
      return false;
    }
  },

  async sendAppointmentConfirmation(
    email: string,
    data: { name: string; date: string; time: string; doctor: string; token: number; phone: string }
  ): Promise<boolean> {
    const template = emailTemplates.appointmentConfirmation(data);
    return this.sendEmail(email, template.subject, template.html);
  },

  async sendPaymentReceipt(
    email: string,
    data: { name: string; invoiceNumber: string; amount: number; balance: number; method: string }
  ): Promise<boolean> {
    const template = emailTemplates.paymentReceipt(data);
    return this.sendEmail(email, template.subject, template.html);
  },

  async sendPasswordResetOTP(email: string, data: { name: string; otp: string }): Promise<boolean> {
    const template = emailTemplates.passwordReset(data);
    return this.sendEmail(email, template.subject, template.html);
  },

  // SMS stub — integrate MSG91 or Twilio
  async sendSMS(phone: string, message: string): Promise<boolean> {
    if (env.SMS_PROVIDER === 'none') {
      logger.info(`[SMS STUB] To: ${phone} | Message: ${message}`);
      return true;
    }

    if (env.SMS_PROVIDER === 'msg91') {
      // MSG91 integration — https://api.msg91.com/api/v5/flow/
      try {
        logger.info(`[MSG91] SMS queued to ${phone}`);
        // Actual HTTP call would go here using fetch/axios with MSG91_API_KEY
        return true;
      } catch (error) {
        logger.error('MSG91 SMS failed:', error);
        return false;
      }
    }

    return false;
  },

  getSMSTemplate(key: keyof typeof smsTemplates, data: Parameters<typeof smsTemplates[typeof key]>[0]): string {
    const fn = smsTemplates[key] as (data: unknown) => string;
    return fn(data);
  },

  // WhatsApp stub — integrate WATI or 360dialog
  async sendWhatsApp(phone: string, message: string): Promise<boolean> {
    if (!env.WHATSAPP_API_URL || !env.WHATSAPP_API_TOKEN) {
      logger.info(`[WhatsApp STUB] To: ${phone} | Message: ${message}`);
      return true;
    }

    try {
      logger.info(`[WhatsApp] Message queued to ${phone}`);
      return true;
    } catch (error) {
      logger.error('WhatsApp send failed:', error);
      return false;
    }
  },
};
