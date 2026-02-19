import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck, Heart, Star, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { LandingHowItWorks } from "../components/LandingHowItWorks";
import { LandingTestimonials } from "../components/LandingTestimonials";
import { useI18n } from "../helpers/i18n";
import styles from "./_index.module.css";

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroCard}>
          <div className={styles.betaBadge}>
            <Sparkles size={14} className={styles.betaIcon} />
            <span className={styles.betaText}>BETA RELEASE</span>
          </div>
          <h1 className={styles.headline}>
            Business Clarity You Can Trust
          </h1>
          <p className={styles.subheadline}>
            {t("landing.heroSubtitle")}
          </p>

          <form onSubmit={handleSearch} className={styles.searchWrapper}>
            <div className={styles.searchBar}>
              <Search className={styles.searchIcon} size={20} />
              <Input
                type="text"
                placeholder={t("landing.searchPlaceholder")}
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="primary" className={styles.searchButton}>
                {t("landing.searchButton")}
              </Button>
            </div>
          </form>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>10k+</span>
              <span className={styles.statLabel}>Businesses Analyzed</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>5M+</span>
              <span className={styles.statLabel}>Reviews Processed</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>1M+</span>
              <span className={styles.statLabel}>AI Insights Generated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image Section */}
      <section className={styles.heroImageSection}>
        <div className={styles.heroImageCard}>
          <img
            src="https://assets.floot.app/1ad752c0-7e37-498a-a3d7-4a44c4132923/a4ea3f3c-ec3a-4e99-969f-9a3dad77e7ae.png"
            alt="Dashboard Preview"
            className={styles.heroImage}
          />
        </div>
      </section>

      {/* How It Works Section */}
      <LandingHowItWorks />

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionLabel}>
          <Sparkles size={14} className={styles.sectionLabelIcon} />
          <span className={styles.sectionLabelText}>FEATURES</span>
        </div>
        <h2 className={styles.sectionTitle}>Powerful Insights at Your Fingertips</h2>
        <p className={styles.sectionSubtitle}>
          Leverage AI-driven intelligence to make informed business decisions
        </p>
        
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={`${styles.iconWrapper} ${styles.iconTurquoise}`}>
              <ShieldCheck size={32} />
            </div>
            <h3 className={styles.featureTitle}>AI Trust Scoring</h3>
            <p className={styles.featureDesc}>
              Our proprietary algorithm analyzes thousands of data points to generate 
              an unbiased trust score for every business.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={`${styles.iconWrapper} ${styles.iconOrange}`}>
              <Heart size={32} />
            </div>
            <h3 className={styles.featureTitle}>Sentiment Analysis</h3>
            <p className={styles.featureDesc}>
              Go beyond star ratings. Understand the emotional context behind customer 
              feedback with advanced NLP.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={`${styles.iconWrapper} ${styles.iconGreen}`}>
              <Star size={32} />
            </div>
            <h3 className={styles.featureTitle}>Review Intelligence</h3>
            <p className={styles.featureDesc}>
              Identify strengths, weaknesses, and pricing perceptions instantly 
              without reading through hundreds of reviews.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className={styles.trustBannerSection}>
        <div className={styles.trustBannerCard}>
          <img
            src="https://assets.floot.app/1ad752c0-7e37-498a-a3d7-4a44c4132923/f69cc182-a612-40a7-aa63-b60d5ce3a9a1.png"
            alt="Trust built by customers — Real experiences, transparent context"
            className={styles.trustBannerImage}
          />
        </div>
      </section>

      {/* Testimonials Section */}
      <LandingTestimonials />

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
          <p className={styles.ctaText}>
            Join thousands of businesses making smarter decisions with AI-powered insights
          </p>
          <Button asChild size="lg" variant="primary" className={styles.ctaButton}>
            <a href="/search">
              {t("landing.searchButton")} <ArrowRight size={20} />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}