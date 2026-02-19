import { LucideIcon } from "lucide-react";
import styles from "./AdminAnalyticsStatCard.module.css";

interface Props {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: "default" | "warning";
  className?: string;
}

export const AdminAnalyticsStatCard = ({
  title,
  value,
  icon: Icon,
  variant = "default",
  className,
}: Props) => {
  return (
    <div className={`${styles.statCard} ${styles[variant]} ${className || ""}`}>
      <div className={styles.iconContainer}>
        <Icon className={styles.icon} size={24} />
      </div>
      <div className={styles.content}>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{title}</div>
      </div>
    </div>
  );
};