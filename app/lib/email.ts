import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVolunteerEmail = async (
  userEmail: string,
  userName: string,
  alertTitle: string,
  alertDescription: string,
  alertLocation: string,
  alertPhoneNumber: string,
  volunteerMessage: string
) => {
  try {
    const emailContent = `
      <h1>Thank you for volunteering!</h1>
      <p>Hi ${userName},</p>
      <p>Thank you for registering as a volunteer for the following alert:</p>
      <h2>${alertTitle}</h2>
      <p><strong>Description:</strong> ${alertDescription}</p>
      <p><strong>Location:</strong> ${alertLocation}</p>
      <p><strong>Phone Number:</strong> ${alertPhoneNumber}</p>
      <p><strong>Volunteer Message:</strong> ${volunteerMessage}</p>
      <p>We appreciate your support!</p>
      <footer>
        <p>This is an automated message from ResQ-Link. Please do not reply to this email.</p>
      </footer>
    `;

    await resend.emails.send({
      from: "no-reply@resq.com",
      to: userEmail,
      subject: `Thank you for volunteering for ${alertTitle}`,
      html: emailContent,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
