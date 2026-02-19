import React from "react";
import { Link } from "react-router-dom";
import { Search, PlusCircle, Sparkles, Mail, FileText, Shield, Lock } from "lucide-react";
import { Separator } from "./Separator";
import { useI18n } from "../helpers/i18n";
import styles from "./AppFooter.module.css";

export const AppFooter = () => {
  const { t } = useI18n();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          {/* Left column - Brand */}
          <div className={styles.brandColumn}>
            <div className={styles.footerLogo}>
              <img
                src="https://assets.floot.app/1ad752c0-7e37-498a-a3d7-4a44c4132923/9b4d70b4-ce61-4da1-9e6c-e10633101513.png"
                alt="TrueLency"
                className={styles.footerLogoImage}
              />
            </div>
            <p className={styles.tagline}>{t("landing.heroSubtitle")}</p>
          </div>

          {/* Product column */}
          <div className={styles.linkColumn}>
            <h3 className={styles.columnTitle}>{t("footer.product")}</h3>
            <nav className={styles.linkList}>
              <Link to="/search" className={styles.footerLink}>
                <Search size={16} />
                {t("footer.searchBusinesses")}
              </Link>
              <Link to="/add-business" className={styles.footerLink}>
                <PlusCircle size={16} />
                {t("footer.addBusiness")}
              </Link>
              <Link to="/search" className={styles.footerLink}>
                <Sparkles size={16} />
                {t("footer.aiInsights")}
              </Link>
              <Link to="/faq" className={styles.footerLink}>
                <Shield size={16} />
                {t("nav.faq")}
              </Link>
            </nav>
          </div>

          {/* Company column */}
          <div className={styles.linkColumn}>
            <h3 className={styles.columnTitle}>{t("footer.company")}</h3>
            <nav className={styles.linkList}>
              <Link to="/about" className={styles.footerLink}>
                {t("footer.about")}
              </Link>
              <a href="mailto:support@truelency.com" className={styles.footerLink}>
                <Mail size={16} />
                {t("footer.supportEmail")}
              </a>
              <Link to="/blog" className={styles.footerLink}>
                <FileText size={16} />
                {t("footer.blog")}
              </Link>
            </nav>
          </div>

          {/* Legal column */}
          <div className={styles.linkColumn}>
            <h3 className={styles.columnTitle}>{t("footer.legal")}</h3>
            <nav className={styles.linkList}>
              <Link to="/privacy" className={styles.footerLink}>
                <Shield size={16} />
                {t("footer.privacy")}
              </Link>
              <Link to="/terms" className={styles.footerLink}>
                {t("footer.terms")}
              </Link>
              <Link to="/data-security" className={styles.footerLink}>
                <Lock size={16} />
                {t("footer.dataSecurity")}
              </Link>
            </nav>
          </div>
        </div>

        <Separator className={styles.separator} />

        {/* Bottom bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            {t("footer.copyright")}
          </p>
          <div className={styles.securityBadges}>
            <span className={styles.badge}>
              <Lock size={14} />
              {t("footer.ssl")}
            </span>
            <span className={styles.badge}>
              <Shield size={14} />
              {t("footer.soc2")}
            </span>
            <span className={styles.badge}>{t("footer.gdpr")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};