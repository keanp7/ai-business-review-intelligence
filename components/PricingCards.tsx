import React from "react";
import { Check, AlertTriangle, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./Button";
import { Badge } from "./Badge";
import styles from "./PricingCards.module.css";

export const PricingCards = () => {
  const handleActivate = () => {
    toast.success("Beta access activated! Payment processing coming soon.");
  };

  return (
    <div className={styles.grid}>
      {/* Starter Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.planName}>Starter</h3>
          <div className={styles.priceWrapper}>
            <span className={styles.currency}>$</span>
            <span className={styles.price}>0</span>
          </div>
          <p className={styles.planSubtitle}>Basic exploration</p>
        </div>
        
        <div className={styles.cardBody}>
          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} />
              <span>Limited company searches</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} />
              <span>Basic trust score preview</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} />
              <span>Short AI summary</span>
            </li>
          </ul>
        </div>
        
        <div className={styles.cardFooter}>
          <Button variant="ghost" className={styles.actionBtn} onClick={handleActivate}>
            Activate Beta Access
          </Button>
          <p className={styles.smallNote}>Upgrade anytime</p>
        </div>
      </div>

      {/* Insight Pro Card */}
      <div className={`${styles.card} ${styles.popularCard}`}>
        <div className={styles.badgeWrapper}>
          <Badge variant="secondary" className={styles.popularBadge}>Most Popular</Badge>
        </div>
        <div className={styles.cardHeader}>
          <div className={styles.planNameWrapper}>
            <h3 className={styles.planName}>Insight Pro</h3>
            <Badge className={styles.betaBadge}>BETA</Badge>
          </div>
          <div className={styles.priceWrapper}>
            <span className={styles.currency}>$</span>
            <span className={styles.price}>29</span>
            <span className={styles.period}>/month</span>
          </div>
          <p className={styles.planSubtitle}>Decision intelligence</p>
        </div>
        
        <div className={styles.cardBody}>
          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIconPrimary} />
              <span>Full AI sentiment analysis</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIconPrimary} />
              <span>Strength vs weakness breakdown</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIconPrimary} />
              <span>Pricing insights</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIconPrimary} />
              <span>Trust score + confidence metrics</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIconPrimary} />
              <span>Save reports</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIconPrimary} />
              <span>Company comparisons</span>
            </li>
          </ul>
        </div>
        
        <div className={styles.cardFooter}>
          <Button variant="primary" className={styles.actionBtn} onClick={handleActivate}>
            Activate Beta Access
          </Button>
          <p className={styles.smallNote}>Free during beta • No credit card required</p>
        </div>
      </div>

      {/* Business Monitor Card */}
      <div className={`${styles.card} ${styles.monitorCard}`}>
        <div className={styles.highlightHeader}>
          <AlertTriangle size={16} />
          <span>Real-Time Bad Review Alerts</span>
        </div>
        
        <div className={styles.cardHeader}>
          <div className={styles.planNameWrapper}>
            <h3 className={styles.planName}>Business Monitor</h3>
            <Badge className={styles.betaBadge}>BETA</Badge>
          </div>
          <div className={styles.priceWrapper}>
            <span className={styles.currency}>$</span>
            <span className={styles.price}>49</span>
            <span className={styles.period}>/month</span>
          </div>
          <p className={styles.planSubtitle}>Reputation protection</p>
        </div>
        
        <div className={styles.cardBody}>
          <div className={styles.featureHighlight}>
            <Zap size={16} className={styles.highlightIcon} />
            <p>Get notified instantly when negative sentiment appears.</p>
          </div>
          
          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIconMonitor} />
              <span>Everything in Insight Pro</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIconMonitor} />
              <span>Reputation dashboard</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIconMonitor} />
              <span>Sentiment tracking</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIconMonitor} />
              <span>Real-time bad-review alerts</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIconMonitor} />
              <span>Business response tools</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIconMonitor} />
              <span>Export analytics</span>
            </li>
          </ul>
        </div>
        
        <div className={styles.cardFooter}>
          <Button className={`${styles.actionBtn} ${styles.gradientBtn}`} onClick={handleActivate}>
            Activate Beta Access
          </Button>
          <p className={styles.smallNote}>Free during beta • No credit card required</p>
        </div>
      </div>
    </div>
  );
};