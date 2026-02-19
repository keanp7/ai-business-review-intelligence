import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "./Badge";
import { useI18n } from "../helpers/i18n";
import styles from "./BusinessCard.module.css";

interface BusinessData {
  id: number;
  name: string;
  description: string | null;
  category: string;
  website: string | null;
  location: string | null;
  averageRating: string | null;
  totalReviews: number | null;
  isClaimed: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  phone: string | null;
}

interface BusinessCardProps {
  business: BusinessData;
}

export const BusinessCard = ({ business }: BusinessCardProps) => {
  const { t } = useI18n();
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "restaurant":
      case "hospitality":
        return "secondary"; // Orange
      case "healthcare":
      case "finance":
        return "default"; // Primary/Turquoise
      case "technology":
      case "automotive":
        return "success"; // Green
      default:
        return "outline";
    }
  };

  const totalReviews = Number(business.totalReviews) || 0;
  const hasNoReviews = totalReviews === 0;

  return (
    <Link to={`/business/${business.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h3 className={styles.name}>{business.name}</h3>
            <Badge variant={getCategoryColor(String(business.category))}>
              {String(business.category).replace("_", " ")}
            </Badge>
          </div>
          
          {business.location && (
            <div className={styles.location}>
              <MapPin size={14} />
              <span>{business.location}</span>
            </div>
          )}
        </div>

        <div className={styles.description}>
          {business.description ? (
            <p className={styles.descriptionText}>{business.description}</p>
          ) : (
            <p className={styles.noDescription}>No description available.</p>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.stats}>
            <div className={styles.rating}>
              <Star size={16} className={styles.starIcon} fill="currentColor" />
              <span className={styles.ratingValue}>
                {business.averageRating ? Number(business.averageRating).toFixed(1) : "N/A"}
              </span>
            </div>
            <div className={styles.reviews}>
              <MessageSquare size={16} />
              <span>{totalReviews} {t("business.reviews")}</span>
            </div>
          </div>
          
          <span className={styles.viewBtn}>
            View Details
          </span>
        </div>
        
        {hasNoReviews && (
          <div className={styles.beFirstBadge}>
            <Sparkles size={14} />
            <span>{t("business.beFirstToReview")}</span>
          </div>
        )}
      </div>
    </Link>
  );
};