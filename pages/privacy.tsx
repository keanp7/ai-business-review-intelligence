import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "../components/Button";
import styles from "./privacy.module.css";

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button asChild variant="ghost" className={styles.backButton}>
          <Link to="/">
            <ChevronLeft size={16} />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className={styles.card}>
        <div className={styles.titleSection}>
          <img
            src="https://assets.floot.app/1ad752c0-7e37-498a-a3d7-4a44c4132923/9b4d70b4-ce61-4da1-9e6c-e10633101513.png"
            alt="TrueLency"
            className={styles.logoImage}
          />
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className={styles.content}>
          <p className={styles.intro}>
            At TrueLency, we take your privacy seriously. This Privacy Policy describes how we collect, use, and share your personal information when you use our website and services.
          </p>

          <section className={styles.section}>
            <h2>1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, such as when you create an account, claim a business, submit a review, or contact support.</p>
            <h3>Personal Information</h3>
            <ul>
              <li>Name and contact details (email address, phone number)</li>
              <li>Account credentials (username, password)</li>
              <li>Business ownership verification documents</li>
              <li>Payment information (processed securely by third-party providers)</li>
            </ul>
            <h3>Usage Data</h3>
            <p>We automatically collect certain information about your device and how you interact with our platform, including IP address, browser type, and pages visited.</p>
          </section>

          <section className={styles.section}>
            <h2>2. How We Use Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li>To provide, maintain, and improve our services</li>
              <li>To verify the authenticity of reviews and business claims</li>
              <li>To process transactions and send related information</li>
              <li>To communicate with you about products, services, and events</li>
              <li>To detect and prevent fraud, abuse, and security incidents</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul>
              <li><strong>With Service Providers:</strong> We share data with vendors who perform services on our behalf (e.g., hosting, analytics, payment processing).</li>
              <li><strong>Public Content:</strong> Reviews and business profile information you submit are intended for public consumption.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid requests by public authorities.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze trends, and administer the website. You can control the use of cookies at the individual browser level.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Your Rights and Choices</h2>
            <p>Depending on your location, you may have rights regarding your personal information, including:</p>
            <ul>
              <li>Accessing and updating your information</li>
              <li>Requesting deletion of your data</li>
              <li>Opting out of marketing communications</li>
            </ul>
            <p>To exercise these rights, please contact us at support@truelency.com.</p>
          </section>

          <section className={styles.section}>
            <h2>6. International Data Transfers</h2>
            <p>
              TrueLency operates globally. Your information may be transferred to and processed in countries other than your own, where data protection laws may differ.
            </p>
          </section>

          <section className={styles.section}>
            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              <strong>TrueLency Privacy Team</strong><br />
              <a href="mailto:privacy@truelency.com" className={styles.link}>privacy@truelency.com</a>
            </p>
          </section>

          <div className={styles.footer}>
            <p>By using TrueLency, you agree to the collection and use of information in accordance with this policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}