import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Target, Users, Shield, Lightbulb } from "lucide-react";
import { Button } from "../components/Button";
import styles from "./about.module.css";

export default function AboutPage() {
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
        <img
          src="https://assets.floot.app/1ad752c0-7e37-498a-a3d7-4a44c4132923/9b4d70b4-ce61-4da1-9e6c-e10633101513.png"
          alt="TrueLency"
          className={styles.logoImage}
        />
        <h1 className={styles.title}>About TrueLency</h1>
        <p className={styles.subtitle}>
          Bringing clarity to business reputation through AI-powered intelligence.
        </p>
      </div>

      <div className={styles.card}>
        <section className={styles.missionSection}>
          <h2>Our Mission</h2>
          <p>
            In a digital world overflowing with noise, finding the truth about a business can be overwhelming. 
            TrueLency exists to cut through the clutter. We leverage advanced artificial intelligence to aggregate, 
            analyze, and interpret business reviews and public signals, providing consumers and business owners 
            alike with a crystal-clear picture of reputation and trust.
          </p>
        </section>

        <section className={styles.valuesSection}>
          <h2>Core Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <div className={styles.iconBox}>
                <Shield size={24} />
              </div>
              <h3>Trust</h3>
              <p>We believe in data integrity and unbiased analysis as the foundation of every insight we provide.</p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.iconBox}>
                <Target size={24} />
              </div>
              <h3>Transparency</h3>
              <p>Our algorithms are designed to highlight the truth, not manipulate it. We show you what matters.</p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.iconBox}>
                <Lightbulb size={24} />
              </div>
              <h3>Innovation</h3>
              <p>We constantly push the boundaries of what AI can do to understand human sentiment and business context.</p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.iconBox}>
                <Users size={24} />
              </div>
              <h3>Community</h3>
              <p>We empower a community of informed consumers and responsible business owners to thrive together.</p>
            </div>
          </div>
        </section>

        <section className={styles.teamSection}>
          <h2>Our Vision</h2>
          <p>
            We envision a marketplace where quality is the only metric that matters. By democratizing access to 
            enterprise-grade reputation intelligence, we level the playing field for small businesses doing great 
            work and protect consumers from misleading practices. TrueLency is building the standard for the 
            future of trust online.
          </p>
        </section>

        <div className={styles.ctaSection}>
          <h3>Ready to see the truth?</h3>
          <p>Start exploring businesses with our AI-powered search today.</p>
          <Button asChild size="lg" className={styles.ctaButton}>
            <Link to="/search">Find a Business</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}