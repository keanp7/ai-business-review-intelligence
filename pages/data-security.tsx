import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Lock, Shield, Server, Eye, FileCheck, AlertTriangle } from "lucide-react";
import { Button } from "../components/Button";
import styles from "./data-security.module.css";

export default function DataSecurityPage() {
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

      <div className={styles.heroSection}>
        <div className={styles.shieldWrapper}>
          <Shield size={64} />
        </div>
        <h1 className={styles.title}>Data Security</h1>
        <p className={styles.subtitle}>
          Your trust is our foundation. We employ industry-leading security measures to protect your data and privacy.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.iconBox}>
            <Lock size={24} />
          </div>
          <h3>Encryption Everywhere</h3>
          <p>
            All data transmitted between your browser and our servers is encrypted using TLS 1.2 or higher. 
            Sensitive data at rest is encrypted using AES-256 standards.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.iconBox}>
            <Server size={24} />
          </div>
          <h3>Secure Infrastructure</h3>
          <p>
            We host our platform on world-class cloud providers with ISO 27001 certification. Our data centers 
            feature 24/7 physical security and redundancy.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.iconBox}>
            <Eye size={24} />
          </div>
          <h3>Access Controls</h3>
          <p>
            We follow the principle of least privilege. Access to production data is strictly limited to 
            authorized personnel and logged for audit purposes.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.iconBox}>
            <FileCheck size={24} />
          </div>
          <h3>Compliance & Standards</h3>
          <p>
            TrueLency is committed to GDPR and CCPA compliance. We are currently in the process of obtaining 
            SOC 2 Type II certification.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.iconBox}>
            <AlertTriangle size={24} />
          </div>
          <h3>Incident Response</h3>
          <p>
            We maintain a comprehensive incident response plan to promptly address any security events. 
            We are transparent about security issues that affect our users.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.iconBox}>
            <Shield size={24} />
          </div>
          <h3>Regular Audits</h3>
          <p>
            We conduct regular security assessments, vulnerability scans, and penetration testing to identify 
            and remediate potential risks proactively.
          </p>
        </div>
      </div>

      <div className={styles.complianceSection}>
        <h3>Security Certifications & Standards</h3>
        <div className={styles.badges}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}><Shield size={18} /></span>
            <span>SOC 2 Ready</span>
          </div>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}><Lock size={18} /></span>
            <span>GDPR Compliant</span>
          </div>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}><Server size={18} /></span>
            <span>99.9% Uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
}