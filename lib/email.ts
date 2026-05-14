import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM = process.env.FROM_EMAIL || "noreply@nexahrai.com";

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });
    if (error) {
      console.error("Resend error:", JSON.stringify(error));
      return { success: false, error };
    }
    console.log("Email sent:", data?.id, "to:", to);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Email send exception:", error);
    return { success: false, error };
  }
}

export function verificationEmailHtml(data: {
  email: string;
  verifyUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
  <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #2563EB; padding: 28px 32px;">
      <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">NexaHR AI</h1>
      <p style="color: #bfdbfe; margin: 4px 0 0; font-size: 14px;">HR Management Platform</p>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #1e293b; margin: 0 0 8px; font-size: 20px;">Verify your email address</h2>
      <p style="color: #64748b; margin: 0 0 24px; font-size: 15px;">
        You requested to create a NexaHR AI account for <strong>${data.email}</strong>. Click the button below to verify your email and complete registration.
      </p>
      <a href="${data.verifyUrl}" style="display: inline-block; background: #2563EB; color: white; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">
        Verify Email &amp; Register
      </a>
      <p style="color: #94a3b8; font-size: 13px; margin: 24px 0 0;">
        This link expires in <strong>1 hour</strong>. If you did not request this, you can safely ignore this email.
      </p>
      <p style="color: #cbd5e1; font-size: 12px; margin: 8px 0 0; word-break: break-all;">
        Or copy this link: ${data.verifyUrl}
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function interviewInviteHtml(data: {
  candidateName: string;
  jobTitle: string;
  company: string;
  date: string;
  time: string;
  type: string;
  meetingLink?: string;
  interviewers: string;
}) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #2563EB; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Interview Invitation</h1>
  </div>
  <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p>Dear <strong>${data.candidateName}</strong>,</p>
    <p>We are pleased to invite you for an interview for the <strong>${data.jobTitle}</strong> position at <strong>${data.company}</strong>.</p>
    <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px; color: #6b7280;">Date</td><td style="padding: 8px; font-weight: bold;">${data.date}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding: 8px; color: #6b7280;">Time</td><td style="padding: 8px; font-weight: bold;">${data.time}</td></tr>
      <tr><td style="padding: 8px; color: #6b7280;">Format</td><td style="padding: 8px; font-weight: bold;">${data.type}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding: 8px; color: #6b7280;">Interviewer(s)</td><td style="padding: 8px; font-weight: bold;">${data.interviewers}</td></tr>
      ${data.meetingLink ? `<tr><td style="padding: 8px; color: #6b7280;">Meeting Link</td><td style="padding: 8px;"><a href="${data.meetingLink}" style="color: #2563EB;">${data.meetingLink}</a></td></tr>` : ""}
    </table>
    <p>Please confirm your availability by replying to this email.</p>
    <p style="color: #6b7280;">Best regards,<br/>HR Team, ${data.company}</p>
  </div>
</body>
</html>`;
}

export function welcomeEmailHtml(data: {
  employeeName: string;
  company: string;
  position: string;
  startDate: string;
  managerName: string;
}) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #059669; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">Welcome to ${data.company}!</h1>
  </div>
  <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p>Dear <strong>${data.employeeName}</strong>,</p>
    <p>We are thrilled to welcome you to the <strong>${data.company}</strong> family!</p>
    <p>Here are your onboarding details:</p>
    <ul>
      <li><strong>Position:</strong> ${data.position}</li>
      <li><strong>Start Date:</strong> ${data.startDate}</li>
      <li><strong>Reporting Manager:</strong> ${data.managerName}</li>
    </ul>
    <p>Please log into the NexaHR portal to complete your onboarding tasks and upload required documents.</p>
    <p style="color: #6b7280;">Best regards,<br/>HR Team, ${data.company}</p>
  </div>
</body>
</html>`;
}

export function payslipEmailHtml(data: {
  employeeName: string;
  company: string;
  month: string;
  netPay: string;
}) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #7C3AED; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">Payslip — ${data.month}</h1>
  </div>
  <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p>Dear <strong>${data.employeeName}</strong>,</p>
    <p>Your payslip for <strong>${data.month}</strong> is ready. Your net pay is <strong>${data.netPay}</strong>.</p>
    <p>Please log into the NexaHR Self-Service Portal to download your full payslip.</p>
    <p style="color: #6b7280;">Best regards,<br/>Finance Team, ${data.company}</p>
  </div>
</body>
</html>`;
}
