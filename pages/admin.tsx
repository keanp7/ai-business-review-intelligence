import React, { useState } from "react";
import { useI18n } from "../helpers/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import { AdminAnalyticsTab } from "../components/AdminAnalyticsTab";
import { AdminClaimsTab } from "../components/AdminClaimsTab";
import { AdminBusinessesTab } from "../components/AdminBusinessesTab";
import { AdminReviewsTab } from "../components/AdminReviewsTab";
import { AdminUsersTab } from "../components/AdminUsersTab";
import styles from "./admin.module.css";

export default function AdminPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("admin.title")}</h1>
        <p className={styles.subtitle}>{t("admin.subtitle")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className={styles.tabs}>
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="analytics">{t("admin.analytics")}</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="businesses">{t("admin.businesses")}</TabsTrigger>
          <TabsTrigger value="reviews">{t("admin.reviews")}</TabsTrigger>
          <TabsTrigger value="users">{t("admin.users")}</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className={styles.tabContent}>
          <div className={styles.tabContainer}>
            <AdminAnalyticsTab />
          </div>
        </TabsContent>

        <TabsContent value="claims" className={styles.tabContent}>
          <AdminClaimsTab />
        </TabsContent>

        <TabsContent value="businesses" className={styles.tabContent}>
          <AdminBusinessesTab />
        </TabsContent>

        <TabsContent value="reviews" className={styles.tabContent}>
          <AdminReviewsTab />
        </TabsContent>

        <TabsContent value="users" className={styles.tabContent}>
          <AdminUsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}