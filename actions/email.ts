// app/actions/email.ts
"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVolunteerEmailAction(data: {
  userEmail: string;
  userName: string;
  alertTitle: string;
  alertDescription: string;
  alertLocation: string;
  alertPhoneNumber: string;
  volunteerMessage: string;
}) {
  try {
    const emailContent = `
      <h1>Thank you for volunteering!</h1>
      <p>Hi ${data.userName},</p>
      <p>Thank you for registering as a volunteer for the following alert:</p>
      <h2>${data.alertTitle}</h2>
      <p><strong>Description:</strong> ${data.alertDescription}</p>
      <p><strong>Location:</strong> ${data.alertLocation}</p>
      <p><strong>Phone Number:</strong> ${data.alertPhoneNumber}</p>
      ${
        data.volunteerMessage
          ? `<p><strong>Your Message:</strong> ${data.volunteerMessage}</p>`
          : ""
      }
      <p>We appreciate your support!</p>
      <footer>
        <p>This is an automated message from ResQ-Link. Please do not reply to this email.</p>
      </footer>
    `;

    const response = await resend.emails.send({
      from: "ResQ-Link <onboarding@resend.dev>",
      to: data.userEmail,
      subject: `Thank you for volunteering for ${data.alertTitle}`,
      html: emailContent,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: (error as Error).message };
  }
}
