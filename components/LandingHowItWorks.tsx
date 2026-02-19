import { Search, BarChart3, CheckCircle, Sparkles } from "lucide-react";
import styles from "./LandingHowItWorks.module.css";

interface Props {
  className?: string;
}

export const LandingHowItWorks = ({ className }: Props) => {
  return (
    <section className={`${styles.container} ${className || ""}`}>
      <div className={styles.sectionLabel}>
        <Sparkles size={14} className={styles.sectionLabelIcon} />
        <span className={styles.sectionLabelText}>HOW IT WORKS</span>
      </div>
      <h2 className={styles.sectionTitle}>Get Started in Three Simple Steps</h2>
      <p className={styles.sectionSubtitle}>
        From search to actionable insights in minutes
      </p>

      <div className={styles.stepsWrapper}>
        <div className={styles.stepCard}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepIconWrapper}>
            <Search size={32} />
          </div>
          <h3 className={styles.stepTitle}>Search</h3>
          <p className={styles.stepDescription}>
            Enter any business name to discover detailed insights
          </p>
        </div>

        <div className={styles.stepCard}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepIconWrapper}>
            <BarChart3 size={32} />
          </div>
          <h3 className={styles.stepTitle}>Analyze</h3>
          <p className={styles.stepDescription}>
            Our AI processes reviews, ratings, and public data
          </p>
        </div>

        <div className={styles.stepCard}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepIconWrapper}>
            <CheckCircle size={32} />
          </div>
          <h3 className={styles.stepTitle}>Decide</h3>
          <p className={styles.stepDescription}>
            Get trust scores, sentiment analysis, and actionable recommendations
          </p>
        </div>
      </div>
    </section>
  );
};