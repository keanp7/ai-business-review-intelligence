import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "../helpers/i18n";
import { Tabs, TabsList, TabsTrigger } from "../components/Tabs";
import { Skeleton } from "../components/Skeleton";
import { ReviewCard } from "../components/ReviewCard";
import {
  getRecentReviews,
  RecentReview,
} from "../endpoints/reviews/recent_GET.schema";
import { ReviewSentimentArrayValues } from "../helpers/schema";
import styles from "./reviews.module.css";

// Type for the sentiment filter, extending the schema values with "all"
type SentimentFilter = "all" | (typeof ReviewSentimentArrayValues)[number];

export default function ReviewsPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<SentimentFilter>("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["recentReviews", activeTab],
    queryFn: () =>
      getRecentReviews({
        limit: 20, // default limit from endpoint is 20, max 50
        sentiment: activeTab === "all" ? undefined : activeTab,
      }),
    placeholderData: (prev) => prev,
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("reviews.title")}</h1>
        <p className={styles.subtitle}>{t("reviews.subtitle")}</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as SentimentFilter)}
        className={styles.tabs}
      >
        <div className={styles.tabsListWrapper}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="all">{t("reviews.all")}</TabsTrigger>
            {ReviewSentimentArrayValues.map((sentiment) => (
              <TabsTrigger key={sentiment} value={sentiment}>
                {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.grid}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.cardSkeleton}>
                  <div className={styles.skeletonHeader}>
                    <Skeleton className={styles.skeletonAvatar} />
                    <Skeleton className={styles.skeletonMeta} />
                  </div>
                  <Skeleton className={styles.skeletonLine} />
                  <Skeleton className={styles.skeletonLine} />
                  <Skeleton className={styles.skeletonLineShort} />
                </div>
              ))
            ) : isError ? (
              <div className={styles.emptyState}>
                Failed to load reviews. Please try again later.
              </div>
            ) : data?.reviews.length === 0 ? (
              <div className={styles.emptyState}>
                No reviews found matching your criteria.
              </div>
            ) : (
              data?.reviews.map((review: RecentReview) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}