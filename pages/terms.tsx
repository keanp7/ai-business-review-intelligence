import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "../components/Button";
import styles from "./terms.module.css";

export default function TermsPage() {
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
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className={styles.content}>
          <p className={styles.intro}>
            Welcome to TrueLency. These Terms of Service ("Terms") govern your access to and use of the TrueLency website, applications, and services (collectively, the "Platform"). By using the Platform, you agree to be bound by these Terms.
          </p>

          <div className={styles.alertBox}>
            <p>If you do not agree, do not use the Platform.</p>
          </div>

          <section className={styles.section}>
            <h2>Platform Purpose</h2>
            <p>
              TrueLency is an AI-powered business intelligence and review platform that aggregates information, analyzes publicly available signals, and hosts user-generated feedback to provide transparency and decision-support insights.
            </p>
            <p>
              TrueLency does not guarantee accuracy, completeness, or suitability of any analysis or user content.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Eligibility</h2>
            <p>
              You must be at least 18 years old to use the Platform. By accessing TrueLency, you confirm you have the legal capacity to enter into this agreement.
            </p>
          </section>

          <section className={styles.section}>
            <h2>User Accounts</h2>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate account information</li>
              <li>Maintain account security</li>
              <li>Notify us of unauthorized access</li>
            </ul>
            <p>
              You are responsible for all activity under your account. TrueLency may suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          <section className={styles.section}>
            <h2>User-Generated Content</h2>
            <p>Users may submit reviews, comments, or reports. You agree that:</p>
            <ul>
              <li>You own or have permission to submit the content</li>
              <li>Your submissions are truthful and lawful</li>
              <li>Your content does not defame, harass, or violate rights</li>
            </ul>
            <p>
              You grant TrueLency a non-exclusive license to display and process your submissions. TrueLency is not the publisher or creator of user-generated content.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Platform Analysis & AI Output</h2>
            <p>
              TrueLency provides AI-generated summaries, sentiment analysis, and scoring for informational purposes only.
            </p>
            <p>AI outputs:</p>
            <ul>
              <li>Are probabilistic interpretations</li>
              <li>May contain inaccuracies</li>
              <li>Should not be treated as professional advice</li>
            </ul>
            <p>
              Users assume all responsibility for decisions made using Platform insights.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Business Profiles</h2>
            <p>
              Businesses may claim profiles and submit contextual responses. TrueLency does not guarantee placement, ranking, or scoring outcomes. Businesses agree not to manipulate reviews or misrepresent information.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Moderation & Content Removal</h2>
            <p>TrueLency reserves the right to:</p>
            <ul>
              <li>Remove or restrict content</li>
              <li>Investigate abuse</li>
              <li>Enforce community standards</li>
            </ul>
            <p>
              Moderation actions are taken in good faith to maintain platform integrity.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Reporting & Disputes</h2>
            <p>
              Users may report content they believe violates policy. TrueLency will review reports but is not obligated to remove content unless it violates applicable standards or law.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Section 230 Notice</h2>
            <p>
              TrueLency operates as an interactive computer service provider. User-generated content represents the views of the submitting party. TrueLency is not treated as the publisher or speaker of such content and moderates in good faith to promote a safe environment.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Submit false or misleading content</li>
              <li>Harass or defame others</li>
              <li>Attempt to manipulate scores</li>
              <li>Interfere with platform operation</li>
              <li>Reverse engineer systems</li>
            </ul>
            <p>Violations may result in account termination.</p>
          </section>

          <section className={styles.section}>
            <h2>Intellectual Property</h2>
            <p>
              All platform design, branding, and AI systems are owned by TrueLency. Users may not copy, distribute, or exploit platform content without permission.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Disclaimers</h2>
            <p>The Platform is provided "as is." TrueLency disclaims all warranties including:</p>
            <ul>
              <li>Accuracy of AI analysis</li>
              <li>Availability or uptime</li>
              <li>Suitability for decisions</li>
            </ul>
            <p>Use the Platform at your own risk.</p>
          </section>

          <section className={styles.section}>
            <h2>Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, TrueLency is not liable for:</p>
            <ul>
              <li>Decisions based on platform insights</li>
              <li>User-generated content</li>
              <li>Indirect or consequential damages</li>
            </ul>
            <p>
              Total liability is limited to the amount paid for services in the prior 12 months.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Indemnification</h2>
            <p>
              You agree to indemnify TrueLency from claims arising from:
            </p>
            <ul>
              <li>Your content</li>
              <li>Misuse of the Platform</li>
              <li>Violation of these Terms</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Termination</h2>
            <p>
              TrueLency may suspend or terminate access at its discretion. Upon termination, rights granted under these Terms cease.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Changes to Terms</h2>
            <p>
              TrueLency may update these Terms. Continued use constitutes acceptance of revisions.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Governing Law</h2>
            <p>
              These Terms are governed by the laws of [Insert Jurisdiction], without regard to conflict principles.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Contact</h2>
            <p>For questions:</p>
            <p>
              <strong>TrueLency Support</strong><br />
              <a href="mailto:support@truelency.com" className={styles.link}>support@truelency.com</a>
            </p>
          </section>

          <div className={styles.footer}>
            <p>By using the Platform, you acknowledge that you have read and agree to these Terms.</p>
          </div>
        </div>
      </div>
    </div>
  );
}