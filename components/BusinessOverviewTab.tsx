import { Star, Users, Phone, Globe, MapPin, Calendar } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { Selectable } from "kysely";
import { Businesses } from "../helpers/schema";
import styles from "./BusinessOverviewTab.module.css";

interface BusinessOverviewTabProps {
  business: Selectable<Businesses> | undefined;
  isLoading: boolean;
}

export const BusinessOverviewTab = ({ business, isLoading }: BusinessOverviewTabProps) => {
  if (isLoading) {
    return (
      <div className={styles.container}>
        <Skeleton style={{ height: "8rem", borderRadius: "var(--radius)" }} />
        <Skeleton style={{ height: "10rem", borderRadius: "var(--radius)" }} />
      </div>
    );
  }

  if (!business) {
    return (
      <div className={styles.card}>
        <p>Business information not available</p>
      </div>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Rating Overview</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <Star size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {business.averageRating ? Number(business.averageRating).toFixed(1) : "N/A"}
              </div>
              <div className={styles.statLabel}>Average Rating</div>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <Users size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{business.totalReviews || 0}</div>
              <div className={styles.statLabel}>Total Reviews</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Contact Information</h3>
        <div className={styles.contactList}>
          {business.phone && (
            <div className={styles.contactItem}>
              <Phone size={18} className={styles.contactIcon} />
              <div>
                <div className={styles.contactLabel}>Phone</div>
                <a href={`tel:${business.phone}`} className={styles.contactValue}>
                  {business.phone}
                </a>
              </div>
            </div>
          )}

          {business.website && (
            <div className={styles.contactItem}>
              <Globe size={18} className={styles.contactIcon} />
              <div>
                <div className={styles.contactLabel}>Website</div>
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactValue}
                >
                  {business.website}
                </a>
              </div>
            </div>
          )}

          {business.location && (
            <div className={styles.contactItem}>
              <MapPin size={18} className={styles.contactIcon} />
              <div>
                <div className={styles.contactLabel}>Location</div>
                <div className={styles.contactValue}>{business.location}</div>
              </div>
            </div>
          )}

          <div className={styles.contactItem}>
            <Calendar size={18} className={styles.contactIcon} />
            <div>
              <div className={styles.contactLabel}>Joined</div>
              <div className={styles.contactValue}>{formatDate(business.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};