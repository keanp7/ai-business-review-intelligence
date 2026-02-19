import { RESEND_FROM_EMAIL } from "./_publicConfigs";

// Types for the email sending function
type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

type SendEmailResult = {
  success: boolean;
  id?: string;
  error?: string;
};

// Types for specific email templates
type ClaimSubmittedParams = {
  adminEmail: string;
  adminName: string;
  businessName: string;
  claimantName: string;
  claimantEmail: string;
  proofType: string;
  claimId: number;
};

type ClaimApprovedParams = {
  userEmail: string;
  userName: string;
  businessName: string;
};

type ClaimRejectedParams = {
  userEmail: string;
  userName: string;
  businessName: string;
  reason: string;
};

// Colors from the design system
const COLORS = {
  primary: "#14B8A6", // Turquoise
  background: "#F9FAFB", // Light gray for email body bg
  surface: "#FFFFFF", // White for content card
  text: "#1F2937", // Dark gray text
  textLight: "#6B7280", // Light gray text
  border: "#E5E7EB", // Light border
};

// Common base HTML wrapper for consistent styling
const wrapHtml = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${COLORS.background}; color: ${COLORS.text}; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: ${COLORS.surface}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid ${COLORS.border}; }
    .header { padding: 30px; text-align: center; border-bottom: 1px solid ${COLORS.border}; }
    .logo { font-size: 24px; font-weight: 800; color: ${COLORS.text}; text-decoration: none; letter-spacing: -0.5px; }
    .logo span { color: ${COLORS.primary}; }
    .content { padding: 40px 30px; line-height: 1.6; }
    .footer { padding: 20px; text-align: center; color: ${COLORS.textLight}; font-size: 12px; }
    .btn { display: inline-block; background-color: ${COLORS.primary}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    h1 { margin-top: 0; font-size: 22px; color: ${COLORS.text}; }
    p { margin-bottom: 16px; }
    .info-table { width: 100%; margin-bottom: 24px; border-collapse: collapse; }
    .info-table td { padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; }
    .info-label { font-weight: 600; color: ${COLORS.textLight}; width: 140px; }
    .highlight { color: ${COLORS.primary}; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">True<span>Lency</span></div>
      </div>
      <div class="content">
        ${content}
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 TrueLency. All rights reserved.</p>
      <p>This is an automated message, please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Backend-only helper for sending transactional emails via Resend.
 */
export const resendEmail = {
  /**
   * Core function to send an email using Resend API
   */
  async sendEmail({
    to,
    subject,
    html,
    text,
  }: SendEmailParams): Promise<SendEmailResult> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn(
        "RESEND_API_KEY is not configured. Email sending skipped for:",
        subject
      );
      return {
        success: false,
        error: "RESEND_API_KEY not configured",
      };
    }

    try {
      console.log(
        `Attempting to send email "${subject}" to ${Array.isArray(to) ? to.join(", ") : to}`
      );

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `TrueLency <${RESEND_FROM_EMAIL}>`,
          to,
          subject,
          html,
          text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Resend API error:", data);
        return {
          success: false,
          error: data.message || "Unknown error from Resend API",
        };
      }

      console.log("Email sent successfully. ID:", data.id);
      return {
        success: true,
        id: data.id,
      };
    } catch (err) {
      console.error("Unexpected error sending email:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred",
      };
    }
  },

  /**
   * Sends a notification to admin when a new claim is submitted
   */
  async sendClaimSubmittedEmail({
    adminEmail,
    adminName,
    businessName,
    claimantName,
    claimantEmail,
    proofType,
    claimId,
  }: ClaimSubmittedParams): Promise<SendEmailResult> {
    const subject = `New Claim Submitted — ${businessName}`;
    const dashboardUrl = "https://truelency.com/admin"; // Hardcoded as per requirement

    const htmlContent = `
      <h1>New Business Claim Request</h1>
      <p>Hello ${adminName},</p>
      <p>A new claim request has been submitted for <strong>${businessName}</strong>. Please review the details below:</p>
      
      <table class="info-table">
        <tr>
          <td class="info-label">Business</td>
          <td>${businessName}</td>
        </tr>
        <tr>
          <td class="info-label">Claimant</td>
          <td>${claimantName}</td>
        </tr>
        <tr>
          <td class="info-label">Email</td>
          <td>${claimantEmail}</td>
        </tr>
        <tr>
          <td class="info-label">Proof Type</td>
          <td style="text-transform: capitalize">${proofType.replace(/_/g, " ")}</td>
        </tr>
        <tr>
          <td class="info-label">Claim ID</td>
          <td>#${claimId}</td>
        </tr>
      </table>

      <p>Please log in to the admin dashboard to review the submitted documents and approve or reject this claim.</p>
      
      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="btn">Review Claim</a>
      </div>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject,
      html: wrapHtml(htmlContent, subject),
      text: `New claim submitted for ${businessName} by ${claimantName}. Please review in admin dashboard.`,
    });
  },

  /**
   * Sends a notification to user when their claim is approved
   */
  async sendClaimApprovedEmail({
    userEmail,
    userName,
    businessName,
  }: ClaimApprovedParams): Promise<SendEmailResult> {
    const subject = `Claim Approved — ${businessName}`;
    const businessUrl = "https://truelency.com/search"; // Generic link as per requirement

    const htmlContent = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 64px; height: 64px; background-color: #DEF7EC; border-radius: 50%; color: #03543F; font-size: 32px; line-height: 64px;">✓</div>
      </div>
      <h1 style="text-align: center;">Congratulations!</h1>
      <p>Hello ${userName},</p>
      <p>Great news! Your claim for <strong class="highlight">${businessName}</strong> has been successfully verified and approved.</p>
      <p>You now have full access to manage your business profile, respond to reviews, and view advanced analytics on TrueLency.</p>
      
      <div style="text-align: center;">
        <a href="${businessUrl}" class="btn">View Your Business</a>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html: wrapHtml(htmlContent, subject),
      text: `Congratulations! Your claim for ${businessName} has been approved. You can now manage your business profile on TrueLency.`,
    });
  },

  /**
   * Sends a notification to user when their claim is rejected
   */
  async sendClaimRejectedEmail({
    userEmail,
    userName,
    businessName,
    reason,
  }: ClaimRejectedParams): Promise<SendEmailResult> {
    const subject = `Claim Update — ${businessName}`;
    // Simple mailto link or support page for now
    const supportUrl = "mailto:support@truelency.com";

    const htmlContent = `
      <h1 style="color: #9B1C1C;">Claim Status Update</h1>
      <p>Hello ${userName},</p>
      <p>Thank you for submitting your claim for <strong>${businessName}</strong>.</p>
      <p>After carefully reviewing the documentation provided, we were unable to verify your ownership at this time.</p>
      
      <div style="background-color: #FEF2F2; border-left: 4px solid #F87171; padding: 15px; margin: 20px 0; color: #991B1B;">
        <strong>Reason for rejection:</strong><br/>
        ${reason}
      </div>

      <p>Don't worry — this is often due to missing information or unclear documents. We encourage you to review the requirements and submit a new claim with additional proof.</p>
      
      <div style="text-align: center;">
        <a href="${supportUrl}" class="btn" style="background-color: #4B5563;">Contact Support</a>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html: wrapHtml(htmlContent, subject),
      text: `Update regarding your claim for ${businessName}. We were unable to verify your ownership. Reason: ${reason}. Please contact support or try again.`,
    });
  },
};