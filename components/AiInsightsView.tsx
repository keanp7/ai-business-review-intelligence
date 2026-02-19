import React from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip 
} from "recharts";
import { ShieldCheck, TrendingUp, AlertTriangle, DollarSign, ThumbsUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "./Chart";
import { Progress } from "./Progress";
import { Badge } from "./Badge";
import { Skeleton } from "./Skeleton";
import { OutputType as InsightsType } from "../endpoints/business/ai-insights_GET.schema";
import styles from "./AiInsightsView.module.css";

interface AiInsightsViewProps {
  insights: InsightsType | undefined;
  isLoading: boolean;
}

export const AiInsightsView = ({ insights, isLoading }: AiInsightsViewProps) => {
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.topRow}>
          <Skeleton className={styles.scoreSkeleton} />
          <Skeleton className={styles.chartSkeleton} />
        </div>
        <Skeleton className={styles.summarySkeleton} />
        <div className={styles.listsRow}>
          <Skeleton className={styles.listSkeleton} />
          <Skeleton className={styles.listSkeleton} />
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const sentimentData = [
    { name: "Positive", value: insights.sentimentBreakdown.positive, color: "var(--success)" },
    { name: "Neutral", value: insights.sentimentBreakdown.neutral, color: "var(--muted-foreground)" },
    { name: "Negative", value: insights.sentimentBreakdown.negative, color: "var(--error)" },
    { name: "Mixed", value: insights.sentimentBreakdown.mixed, color: "var(--primary)" },
  ].filter(item => item.value > 0);

  const chartConfig = {
    Positive: { label: "Positive", color: "var(--success)" },
    Neutral: { label: "Neutral", color: "var(--muted-foreground)" },
    Negative: { label: "Negative", color: "var(--error)" },
    Mixed: { label: "Mixed", color: "var(--primary)" },
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "var(--success)";
    if (score >= 60) return "var(--primary)";
    if (score >= 40) return "var(--secondary)";
    return "var(--error)";
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Trust Score Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <ShieldCheck className={styles.iconTurquoise} />
            <h3>Trust Score</h3>
          </div>
          <div className={styles.scoreContainer}>
            <div 
              className={styles.scoreCircle}
              style={{ borderColor: getTrustScoreColor(insights.trustScore) }}
            >
              <span className={styles.scoreValue}>{insights.trustScore}</span>
              <span className={styles.scoreLabel}>/100</span>
            </div>
            <div className={styles.recommendation}>
              <span className={styles.recLabel}>Recommendation</span>
              <div className={styles.recScore}>
                <ThumbsUp size={16} />
                {insights.recommendationScore}/10
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment Chart Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <TrendingUp className={styles.iconOrange} />
            <h3>Sentiment Analysis</h3>
          </div>
          <div className={styles.chartWrapper}>
            <ChartContainer config={chartConfig} className={styles.chartContainer}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </div>

        {/* Pricing Perception Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <DollarSign className={styles.iconGreen} />
            <h3>Pricing Perception</h3>
          </div>
          <div className={styles.pricingContent}>
            <Badge variant="outline" className={styles.pricingBadge}>
              {insights.pricingPerception}
            </Badge>
            <p className={styles.pricingDesc}>
              Based on customer feedback regarding value for money.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className={`${styles.card} ${styles.fullWidth}`}>
        <div className={styles.cardHeader}>
          <h3>Executive Summary</h3>
        </div>
        <p className={styles.summaryText}>{insights.overallSummary}</p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className={styles.swGrid}>
        <div className={`${styles.card} ${styles.swCard}`}>
          <div className={styles.cardHeader}>
            <TrendingUp className={styles.iconGreen} />
            <h3>Key Strengths</h3>
          </div>
          <ul className={styles.list}>
            {insights.strengths.map((item, i) => (
              <li key={i} className={styles.listItem}>
                <span className={styles.bulletGreen}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={`${styles.card} ${styles.swCard}`}>
          <div className={styles.cardHeader}>
            <AlertTriangle className={styles.iconOrange} />
            <h3>Areas for Improvement</h3>
          </div>
          <ul className={styles.list}>
            {insights.weaknesses.map((item, i) => (
              <li key={i} className={styles.listItem}>
                <span className={styles.bulletOrange}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};