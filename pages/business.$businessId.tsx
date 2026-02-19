import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Star } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
import { BusinessDetailHero } from "../components/BusinessDetailHero";
import { AiInsightsView } from "../components/AiInsightsView";
import { BusinessReviewsTab } from "../components/BusinessReviewsTab";
import { BusinessOverviewTab } from "../components/BusinessOverviewTab";
import { useBusinessDetail, useBusinessReviews, useBusinessAiInsights } from "../helpers/useBusinessApi";
import styles from "./business.$businessId.module.css";

export default function BusinessDetailPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const id = parseInt(businessId || "0", 10);

  const { data: business, isFetching: isLoadingBusiness } = useBusinessDetail(id);
  const { data: reviews, isFetching: isLoadingReviews } = useBusinessReviews(id);
  const { data: insights, isFetching: isLoadingInsights } = useBusinessAiInsights(id);

  const pageTitle = business?.name
    ? `${business.name} - Business Details`
    : "Business Details";

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <div className={styles.container}>
        <BusinessDetailHero business={business} isLoading={isLoadingBusiness} />

        {business && !isLoadingBusiness && (
          <div className={styles.ratingSummaryBar}>
            <Star className={styles.ratingStar} fill="currentColor" size={24} />
            <span className={styles.ratingValue}>
              {business.averageRating
                ? Number(business.averageRating).toFixed(1)
                : "N/A"}
            </span>
            <span className={styles.ratingCount}>
              ({business.totalReviews || 0}{" "}
              {(business.totalReviews || 0) === 1 ? "Review" : "Reviews"})
            </span>
          </div>
        )}

        <Tabs defaultValue="insights" className={styles.tabs}>
          <TabsList>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className={styles.tabContent}>
            <AiInsightsView insights={insights} isLoading={isLoadingInsights} />
          </TabsContent>

          <TabsContent value="reviews" className={styles.tabContent}>
            <BusinessReviewsTab
              businessId={id}
              reviews={reviews}
              isLoading={isLoadingReviews}
            />
          </TabsContent>

          <TabsContent value="overview" className={styles.tabContent}>
            <BusinessOverviewTab business={business} isLoading={isLoadingBusiness} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}