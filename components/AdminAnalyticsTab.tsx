import { Users, Building2, MessageSquare, Clock, Star, TrendingUp } from "lucide-react";
import { useAdminAnalytics } from "../helpers/useAdminAnalytics";
import { AdminAnalyticsStatCard } from "./AdminAnalyticsStatCard";
import { Badge } from "./Badge";
import { Skeleton } from "./Skeleton";
import styles from "./AdminAnalyticsTab.module.css";

export const AdminAnalyticsTab = ({ className }: { className?: string }) => {
  const { data, isFetching } = useAdminAnalytics();

  if (isFetching && !data) {
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <div className={styles.statsGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.statCardSkeleton}>
              <Skeleton style={{ width: "3rem", height: "3rem", borderRadius: "var(--radius)" }} />
              <div style={{ flex: 1 }}>
                <Skeleton style={{ width: "4rem", height: "2rem", marginBottom: "var(--spacing-2)" }} />
                <Skeleton style={{ width: "6rem", height: "1rem" }} />
              </div>
            </div>
          ))}
        </div>
        <div className={styles.breakdownGrid}>
          <Skeleton style={{ height: "300px" }} />
          <Skeleton style={{ height: "300px" }} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <div className={styles.emptyState}>No analytics data available</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.statsGrid}>
        <AdminAnalyticsStatCard
          title="Total Users"
          value={data.totalUsers}
          icon={Users}
        />
        <AdminAnalyticsStatCard
          title="Total Businesses"
          value={data.totalBusinesses}
          icon={Building2}
        />
        <AdminAnalyticsStatCard
          title="Total Reviews"
          value={data.totalReviews}
          icon={MessageSquare}
        />
        <AdminAnalyticsStatCard
          title="Pending Approvals"
          value={data.businessesByStatus.pending}
          icon={Clock}
          variant={data.businessesByStatus.pending > 0 ? "warning" : "default"}
        />
        <AdminAnalyticsStatCard
          title="Average Rating"
          value={data.averageRating.toFixed(1)}
          icon={Star}
        />
        <AdminAnalyticsStatCard
          title="New Users (30d)"
          value={data.newUsersLast30Days}
          icon={TrendingUp}
        />
      </div>

      <div className={styles.breakdownGrid}>
        {/* Reviews by Sentiment */}
        <div className={styles.breakdownSection}>
          <h3 className={styles.sectionTitle}>Reviews by Sentiment</h3>
          <div className={styles.breakdownContent}>
            <div className={styles.barItem}>
              <div className={styles.barLabel}>
                <Badge variant="success">Positive</Badge>
                <span className={styles.barValue}>{data.reviewsBySentiment.positive}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.barFill} ${styles.positive}`}
                  style={{
                    width: `${(data.reviewsBySentiment.positive / data.totalReviews) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className={styles.barItem}>
              <div className={styles.barLabel}>
                <Badge variant="destructive">Negative</Badge>
                <span className={styles.barValue}>{data.reviewsBySentiment.negative}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.barFill} ${styles.negative}`}
                  style={{
                    width: `${(data.reviewsBySentiment.negative / data.totalReviews) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className={styles.barItem}>
              <div className={styles.barLabel}>
                <Badge variant="secondary">Neutral</Badge>
                <span className={styles.barValue}>{data.reviewsBySentiment.neutral}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.barFill} ${styles.neutral}`}
                  style={{
                    width: `${(data.reviewsBySentiment.neutral / data.totalReviews) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className={styles.barItem}>
              <div className={styles.barLabel}>
                <Badge variant="warning">Mixed</Badge>
                <span className={styles.barValue}>{data.reviewsBySentiment.mixed}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.barFill} ${styles.mixed}`}
                  style={{
                    width: `${(data.reviewsBySentiment.mixed / data.totalReviews) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Businesses by Status */}
        <div className={styles.breakdownSection}>
          <h3 className={styles.sectionTitle}>Businesses by Status</h3>
          <div className={styles.breakdownContent}>
            <div className={styles.barItem}>
              <div className={styles.barLabel}>
                <Badge variant="warning">Pending</Badge>
                <span className={styles.barValue}>{data.businessesByStatus.pending}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.barFill} ${styles.pending}`}
                  style={{
                    width: `${(data.businessesByStatus.pending / data.totalBusinesses) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className={styles.barItem}>
              <div className={styles.barLabel}>
                <Badge variant="success">Approved</Badge>
                <span className={styles.barValue}>{data.businessesByStatus.approved}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.barFill} ${styles.approved}`}
                  style={{
                    width: `${(data.businessesByStatus.approved / data.totalBusinesses) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className={styles.barItem}>
              <div className={styles.barLabel}>
                <Badge variant="destructive">Rejected</Badge>
                <span className={styles.barValue}>{data.businessesByStatus.rejected}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.barFill} ${styles.rejected}`}
                  style={{
                    width: `${(data.businessesByStatus.rejected / data.totalBusinesses) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};