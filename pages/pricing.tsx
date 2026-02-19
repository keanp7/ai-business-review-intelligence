import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Bell } from "lucide-react";
import { Button } from "../components/Button";
import { PricingCards } from "../components/PricingCards";
import { PricingComparisonTable } from "../components/PricingComparisonTable";
import { useI18n } from "../helpers/i18n";
import styles from "./pricing.module.css";

export default function PricingPage() {
  const { t } = useI18n();

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blobTurquoise}`} />
        <div className={`${styles.blob} ${styles.blobBlue}`} />
        <div className={`${styles.blob} ${styles.blobAqua}`} />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.sectionLabel}>
            <span className={styles.sparkle}>💎</span>
            <span className={styles.labelText}>PRICING</span>
          </div>
          <h1 className={styles.title}>Choose your right plan</h1>
          <p className={styles.subtitle}>
            Select from best plans, ensuring a perfect match. Need more or less?<br />
            Customize your subscription for a seamless fit!
          </p>
        </div>

        {/* Section 1: Pricing Cards */}
        <section className={styles.section}>
          <PricingCards />
        </section>

        {/* Alert Feature Callout Banner */}
        <section className={styles.bannerSection}>
          <div className={styles.alertBanner}>
            <div className={styles.alertIconWrapper}>
              <Bell className={styles.alertIcon} size={28} />
              <span className={styles.pulseRing}></span>
            </div>
            <div className={styles.alertContent}>
              <h3 className={styles.alertTitle}>
                Never miss a reputation risk.
              </h3>
              <p className={styles.alertText}>
                TrueLency Business Monitor alerts you the moment negative
                feedback appears — so you can respond before it escalates.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Competitor Comparison Table */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Why Choose TrueLency?</h2>
          <PricingComparisonTable />
        </section>

        <footer className={styles.pageFooter}>
          <p>
            TrueLency transforms reviews into actionable intelligence — and alerts
            you before problems grow.
          </p>
        </footer>
      </div>
    </div>
  );
}