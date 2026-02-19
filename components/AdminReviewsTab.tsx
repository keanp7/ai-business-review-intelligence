import React, { useState } from "react";
import { useAdminReviews, useDeleteReview } from "../helpers/useAdminApi";
import { useI18n } from "../helpers/i18n";
import { Button } from "./Button";
import { Badge } from "./Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";
import { Skeleton } from "./Skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Trash2, Star } from "lucide-react";
import { ReviewSentimentArrayValues } from "../helpers/schema";
import styles from "./AdminShared.module.css";
// We need some specific styles for reviews grid that were in the original file
import reviewStyles from "./AdminReviewsTab.module.css";

export function AdminReviewsTab() {
  const { t } = useI18n();
  const [sentiment, setSentiment] = useState<string>("_all");
  const [page, setPage] = useState(1);
  const { data, isFetching } = useAdminReviews({
    page,
    limit: 10,
    sentiment: sentiment === "_all" ? undefined : (sentiment as any),
  });
  const deleteReview = useDeleteReview();
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);

  const handleDelete = async () => {
    if (reviewToDelete) {
      await deleteReview.mutateAsync({ reviewId: reviewToDelete });
      setReviewToDelete(null);
    }
  };

  return (
    <div className={styles.tabContainer}>
      <div className={styles.toolbar}>
        <div className={styles.filterWrapper}>
          <Select value={sentiment} onValueChange={setSentiment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Sentiments</SelectItem>
              {ReviewSentimentArrayValues.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={reviewStyles.reviewsGrid}>
        {isFetching && !data ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={reviewStyles.reviewCardSkeleton}>
              <div className="flex justify-between mb-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))
        ) : data?.reviews.length === 0 ? (
          <div className={styles.emptyState}>{t("admin.noData")}</div>
        ) : (
          data?.reviews.map((review) => (
            <div key={review.id} className={reviewStyles.reviewCard}>
              <div className={reviewStyles.reviewHeader}>
                <div>
                  <h4 className={reviewStyles.reviewerName}>{review.reviewerName}</h4>
                  <p className={reviewStyles.businessName}>on {review.businessName}</p>
                </div>
                <Badge 
                  variant={
                    review.sentiment === "positive" ? "success" : 
                    review.sentiment === "negative" ? "destructive" : 
                    review.sentiment === "mixed" ? "warning" : "secondary"
                  }
                  className="capitalize"
                >
                  {review.sentiment || "neutral"}
                </Badge>
              </div>
              
              <div className={reviewStyles.ratingRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                  />
                ))}
                <span className={reviewStyles.date}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p className={reviewStyles.reviewContent}>{review.content}</p>
              
              <div className={reviewStyles.reviewActions}>
                <Dialog open={reviewToDelete === review.id} onOpenChange={(open) => !open && setReviewToDelete(null)}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                      onClick={() => setReviewToDelete(review.id)}
                    >
                      <Trash2 size={14} className="mr-1" /> Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("admin.deleteConfirm")}</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this review? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setReviewToDelete(null)}>Cancel</Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDelete}
                        disabled={deleteReview.isPending}
                      >
                        {deleteReview.isPending ? "Deleting..." : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.pagination}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || isFetching}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {Math.ceil((data?.total || 0) / 10) || 1}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setPage(p => p + 1)}
          disabled={!data || page >= Math.ceil(data.total / 10) || isFetching}
        >
          Next
        </Button>
      </div>
    </div>
  );
}