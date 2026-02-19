import React from "react";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./Tooltip";
import styles from "./PricingComparisonTable.module.css";

export const PricingComparisonTable = () => {
  return (
    <div className={styles.tableWrapper}>
      <TooltipProvider>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.featureHeader}>Feature Name</th>
              <th className={styles.headerCell}>Google Reviews</th>
              <th className={styles.headerCell}>Yelp</th>
              <th className={styles.headerCell}>Trustpilot</th>
              <th className={styles.headerCell}>G2 / Capterra</th>
              <th className={`${styles.headerCell} ${styles.trueLencyHeader}`}>
                TrueLency<br/><span className={styles.planSub}>Insight Pro</span>
              </th>
              <th className={`${styles.headerCell} ${styles.trueLencyHeader} ${styles.highlightHeader}`}>
                TrueLency<br/><span className={styles.planSub}>Business Monitor</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.featureName}>Business lookup</td>
              <td className={styles.checkCell}><Check size={20} className={styles.check} /></td>
              <td className={styles.checkCell}><Check size={20} className={styles.check} /></td>
              <td className={styles.checkCell}><Check size={20} className={styles.check} /></td>
              <td className={styles.checkCell}><Check size={20} className={styles.check} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell}`}><Check size={20} className={styles.checkPrimary} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell} ${styles.highlightCell}`}><Check size={20} className={styles.checkPrimary} /></td>
            </tr>
            <tr>
              <td className={styles.featureName}>AI sentiment analysis</td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell}`}><Check size={20} className={styles.checkPrimary} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell} ${styles.highlightCell}`}><Check size={20} className={styles.checkPrimary} /></td>
            </tr>
            <tr>
              <td className={styles.featureName}>Strength vs weakness breakdown</td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell}`}><Check size={20} className={styles.checkPrimary} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell} ${styles.highlightCell}`}><Check size={20} className={styles.checkPrimary} /></td>
            </tr>
            <tr>
              <td className={styles.featureName}>Pricing insights</td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell}`}><Check size={20} className={styles.checkPrimary} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell} ${styles.highlightCell}`}><Check size={20} className={styles.checkPrimary} /></td>
            </tr>
            <tr>
              <td className={styles.featureName}>Trust score</td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.checkCell}><Check size={20} className={styles.check} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell}`}><Check size={20} className={styles.checkPrimary} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell} ${styles.highlightCell}`}><Check size={20} className={styles.checkPrimary} /></td>
            </tr>
            <tr>
              <td className={styles.featureName}>Save & compare reports</td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell}`}><Check size={20} className={styles.checkPrimary} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell} ${styles.highlightCell}`}><Check size={20} className={styles.checkPrimary} /></td>
            </tr>
            <tr>
              <td className={styles.featureName}>Reputation dashboard</td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={`${styles.crossCell} ${styles.trueLencyCell}`}><X size={20} className={styles.crossMuted} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell} ${styles.highlightCell}`}><Check size={20} className={styles.checkPrimary} /></td>
            </tr>
            <tr>
              <td className={styles.featureName}>
                <div className={styles.featureWithTooltip}>
                  Bad-review alerts
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className={styles.infoButton}>
                        <Info size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Instant notification when negative sentiment spikes.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={`${styles.crossCell} ${styles.trueLencyCell}`}><X size={20} className={styles.crossMuted} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell} ${styles.highlightCell}`}>
                <div className={styles.alertCheck}>
                  <AlertTriangle size={16} />
                </div>
              </td>
            </tr>
            <tr>
              <td className={styles.featureName}>Business response tools</td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={styles.crossCell}><X size={20} className={styles.cross} /></td>
              <td className={`${styles.crossCell} ${styles.trueLencyCell}`}><X size={20} className={styles.crossMuted} /></td>
              <td className={`${styles.checkCell} ${styles.trueLencyCell} ${styles.highlightCell}`}><Check size={20} className={styles.checkPrimary} /></td>
            </tr>
          </tbody>
        </table>
      </TooltipProvider>
    </div>
  );
};