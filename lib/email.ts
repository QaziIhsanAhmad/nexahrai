import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || "noreply@nexahrail.com";

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
    const result = await resend.emails.send({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
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
