import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OAuthButtonGroup } from "../components/OAuthButtonGroup";
import { PasswordLoginForm } from "../components/PasswordLoginForm";
import { PasswordRegisterForm } from "../components/PasswordRegisterForm";
import { Separator } from "../components/Separator";
import { Button } from "../components/Button";
import { useAuth } from "../helpers/useAuth";
import { useI18n } from "../helpers/i18n";
import { Skeleton } from "../components/Skeleton";
import styles from "./login.module.css";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { authState } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.type === "authenticated") {
      navigate("/", { replace: true });
    }
  }, [authState, navigate]);

  if (authState.type === "loading") {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <Skeleton className={styles.logoSkeleton} />
            <Skeleton className={styles.titleSkeleton} />
            <Skeleton className={styles.subtitleSkeleton} />
          </div>
          <div className={styles.content}>
            <Skeleton className={styles.oauthSkeleton} />
            <Skeleton className={styles.separatorSkeleton} />
            <Skeleton className={styles.formSkeleton} />
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, we are redirecting, so render nothing or a spinner
  if (authState.type === "authenticated") {
    return null; 
  }

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img
            src="https://assets.floot.app/1ad752c0-7e37-498a-a3d7-4a44c4132923/9b4d70b4-ce61-4da1-9e6c-e10633101513.png"
            alt="TrueLency Logo"
            className={styles.logoImage}
          />
          <h1 className={styles.title}>
            {mode === "login" ? t("login.title") : t("login.register")}
          </h1>
          <p className={styles.subtitle}>
            {mode === "login"
              ? t("login.subtitle")
              : t("landing.heroSubtitle")}
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.oauthSection}>
            <OAuthButtonGroup />
          </div>

          <div className={styles.separatorContainer}>
            <div className={styles.separatorLine}>
              <Separator />
            </div>
            <span className={styles.separatorText}>{t("login.orContinueWith")}</span>
            <div className={styles.separatorLine}>
              <Separator />
            </div>
          </div>

          <div className={styles.formSection}>
            {mode === "login" ? (
              <PasswordLoginForm />
            ) : (
              <PasswordRegisterForm />
            )}
          </div>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              {mode === "login"
                ? t("login.noAccount") + " "
                : t("login.haveAccount") + " "}
              <Button
                variant="link"
                onClick={toggleMode}
                className={styles.toggleButton}
              >
                {mode === "login" ? t("login.register") : t("login.signIn")}
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}