import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";
import { Badge } from "./Badge";
import styles from "./ReviewCard.module.css";

interface ReviewCardProps {
  review: {
    id: number;
    businessId: number;
    reviewerName: string;
    rating: number;
    content: string;
    sentiment: "mixed" | "negative" | "neutral" | "positive" | null;
    createdAt: Date;
    businessName?: string;
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {review.reviewerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className={styles.userName}>{review.reviewerName}</div>
            <div className={styles.reviewDate}>
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <Badge
          variant={
            review.sentiment === "positive"
              ? "success"
              : review.sentiment === "negative"
              ? "destructive"
              : review.sentiment === "mixed"
              ? "warning"
              : "secondary"
          }
          className={styles.sentimentBadge}
        >
          {review.sentiment || "neutral"}
        </Badge>
      </div>

      <div className={styles.rating}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < review.rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>

      <div className={styles.content}>"{review.content}"</div>

      {review.businessName && (
        <div className={styles.footer}>
          <Link
            to={`/business/${review.businessId}`}
            className={styles.businessLink}
          >
            <span>{review.businessName}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}