import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = process.env.MAIL_FROM || "noreply@prisanbeauty.com"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@prisanbeauty.com"

export async function sendBookingConfirmation(booking: {
  id: string
  customerName: string
  customerEmail: string
  date: string
  time: string
  serviceName: string
  stylistName: string
  price: number
}) {
  const { customerName, customerEmail, date, time, serviceName, stylistName, price, id } = booking

  await transporter.sendMail({
    from: FROM,
    to: customerEmail,
    subject: `Booking Confirmed – Prisan Beauty`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:#e8437e;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:22px;">Prisan Beauty</h1>
        </div>
        <div style="background:#faf7f2;padding:32px;border-radius:0 0 12px 12px;">
          <h2 style="margin:0 0 8px;">Hi ${customerName},</h2>
          <p style="color:#555;margin:0 0 20px;">Your appointment has been booked successfully.</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#888;">Service</td><td style="padding:8px 0;font-weight:600;">${serviceName}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Stylist</td><td style="padding:8px 0;font-weight:600;">${stylistName}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Date</td><td style="padding:8px 0;font-weight:600;">${date}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Time</td><td style="padding:8px 0;font-weight:600;">${time}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Price</td><td style="padding:8px 0;font-weight:600;color:#e8437e;">Rs. {price.toFixed(0)}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Confirmation</td><td style="padding:8px 0;font-family:monospace;font-size:13px;">#${id.slice(-8).toUpperCase()}</td></tr>
          </table>
          <p style="color:#888;font-size:13px;margin-top:20px;">We look forward to seeing you!</p>
        </div>
      </div>
    `.trim(),
  })
}

export async function sendAdminNotification(booking: {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  date: string
  time: string
  serviceName: string
  stylistName: string
  notes?: string | null
}) {
  const { customerName, customerEmail, customerPhone, date, time, serviceName, stylistName, notes, id } = booking

  await transporter.sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Booking – ${customerName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:#2d2a24;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#e8437e;margin:0;font-size:20px;">New Booking Received</h1>
        </div>
        <div style="background:#faf7f2;padding:32px;border-radius:0 0 12px 12px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#888;">Customer</td><td style="padding:8px 0;font-weight:600;">${customerName}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;font-weight:600;">${customerEmail}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Phone</td><td style="padding:8px 0;font-weight:600;">${customerPhone}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Service</td><td style="padding:8px 0;font-weight:600;">${serviceName}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Stylist</td><td style="padding:8px 0;font-weight:600;">${stylistName}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Date</td><td style="padding:8px 0;font-weight:600;">${date}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Time</td><td style="padding:8px 0;font-weight:600;">${time}</td></tr>
            ${notes ? `<tr><td style="padding:8px 0;color:#888;">Notes</td><td style="padding:8px 0;font-weight:600;">${notes}</td></tr>` : ""}
          </table>
          <p style="margin-top:20px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3005"}/admin/bookings"
               style="display:inline-block;background:#e8437e;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:14px;">
              View in Admin
            </a>
          </p>
        </div>
      </div>
    `.trim(),
  })
}

export async function sendStatusUpdate(booking: {
  customerName: string
  customerEmail: string
  status: string
  date: string
  time: string
  serviceName: string
  stylistName: string
}) {
  const { customerName, customerEmail, status, date, time, serviceName, stylistName } = booking
  const statusLabels: Record<string, string> = {
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    pending: "Pending",
  }

  await transporter.sendMail({
    from: FROM,
    to: customerEmail,
    subject: `Booking ${statusLabels[status] || status} – Prisan Beauty`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:#e8437e;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:22px;">Prisan Beauty</h1>
        </div>
        <div style="background:#faf7f2;padding:32px;border-radius:0 0 12px 12px;">
          <h2 style="margin:0 0 8px;">Hi ${customerName},</h2>
          <p style="color:#555;margin:0 0 20px;">
            Your booking status has been updated to
            <strong style="color:#e8437e;">${statusLabels[status] || status}</strong>.
          </p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#888;">Service</td><td style="padding:8px 0;font-weight:600;">${serviceName}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Stylist</td><td style="padding:8px 0;font-weight:600;">${stylistName}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Date</td><td style="padding:8px 0;font-weight:600;">${date}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Time</td><td style="padding:8px 0;font-weight:600;">${time}</td></tr>
            <tr><td style="padding:8px 0;color:#888;">Status</td><td style="padding:8px 0;font-weight:600;text-transform:capitalize;">${statusLabels[status] || status}</td></tr>
          </table>
          ${status === "cancelled" ? '<p style="color:#888;font-size:13px;margin-top:20px;">If you have any questions, please contact us.</p>' : '<p style="color:#888;font-size:13px;margin-top:20px;">Thank you for choosing Prisan Beauty!</p>'}
        </div>
      </div>
    `.trim(),
  })
}
