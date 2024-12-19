import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  alertTitle: string;
  alertDescription: string;
  alertLocation: string;
  contactNumber: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  alertTitle,
  alertDescription,
  alertLocation,
  contactNumber,
}) => (
  <div
    style={{
      fontFamily: "Arial, sans-serif",
      color: "#333",
      lineHeight: "1.6",
      backgroundColor: "#f9f9f9",
      padding: "20px",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      maxWidth: "600px",
      margin: "0 auto",
    }}
  >
    <h1 style={{ color: "#007BFF" }}>Hello, {firstName}!</h1>
    <p>
      Thank you for registering as a volunteer. We have a new alert that might
      need your assistance:
    </p>
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        marginBottom: "20px",
      }}
    >
      <h2 style={{ color: "#ff5722" }}>{alertTitle}</h2>
      <p>
        <strong>Description:</strong> {alertDescription}
      </p>
      <p>
        <strong>Location:</strong> {alertLocation}
      </p>
      <p>
        <strong>Contact Number:</strong> {contactNumber}
      </p>
    </div>
    <p>
      Please take action if you can help. Your support makes a huge difference
      in times of need.
    </p>
    <footer style={{ marginTop: "20px", fontSize: "12px", color: "#888" }}>
      <hr style={{ border: "0", borderTop: "1px solid #ddd" }} />
      <p style={{ margin: "10px 0" }}>
        This is an automated message from ResQ-Link. Please do not reply to this
        email.
      </p>
    </footer>
  </div>
);
