import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  PlusCircle,
  Home,
  LogOut,
  MessageSquare,
  HelpCircle,
  Shield,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import { Button } from "./Button";
import { NotificationBell } from "./NotificationBell";
import { AiAssistantChat } from "./AiAssistantChat";
import { Avatar, AvatarFallback } from "./Avatar";
import { Skeleton } from "./Skeleton";
import { ThemeModeSwitch } from "./ThemeModeSwitch";
import { LanguageSwitch } from "./LanguageSwitch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./DropdownMenu";
import { useAuth } from "../helpers/useAuth";
import { useI18n } from "../helpers/i18n";
import { AppFooter } from "./AppFooter";
import styles from "./AppLayout.module.css";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { authState, logout } = useAuth();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
  };

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            <img
              src="https://assets.floot.app/1ad752c0-7e37-498a-a3d7-4a44c4132923/9b4d70b4-ce61-4da1-9e6c-e10633101513.png"
              alt="TrueLency"
              className={styles.logoImage}
            />
          </Link>

          {/* Mobile Header Right Section */}
          <div className={styles.mobileHeaderRight}>
            <button
              className={styles.hamburgerButton}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Auth Section */}
            <div className={styles.mobileAuthSection}>
              {authState.type === "authenticated" && <NotificationBell />}

              {authState.type === "loading" && (
                <Skeleton
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "var(--radius-full)",
                  }}
                />
              )}
              {authState.type === "unauthenticated" && (
                <Button asChild variant="outline" className={styles.signInBtn}>
                  <Link to="/login">{t("nav.signIn")}</Link>
                </Button>
              )}
              {authState.type === "authenticated" && (
                <DropdownMenu>
                  <DropdownMenuTrigger className={styles.avatarTrigger}>
                    <Avatar>
                      <AvatarFallback>
                        {authState.user.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {authState.user.displayName}
                    </DropdownMenuLabel>
                    <DropdownMenuLabel className={styles.userEmail}>
                      {authState.user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut size={16} />
                      {t("nav.signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className={styles.nav}>
            <Button
              asChild
              variant="ghost"
              className={isActive("/") ? styles.activeNavLink : styles.navLink}
            >
              <Link to="/">
                <Home size={18} />
                {t("nav.home")}
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className={
                isActive("/search") ? styles.activeNavLink : styles.navLink
              }
            >
              <Link to="/search">
                <Search size={18} />
                {t("nav.search")}
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={
                isActive("/reviews") ? styles.activeNavLink : styles.navLink
              }
            >
              <Link to="/reviews">
                <MessageSquare size={18} />
                {t("nav.reviews")}
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={
                isActive("/faq") ? styles.activeNavLink : styles.navLink
              }
            >
              <Link to="/faq">
                <HelpCircle size={18} />
                {t("nav.faq")}
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={
                isActive("/pricing") ? styles.activeNavLink : styles.navLink
              }
            >
              <Link to="/pricing">
                <CreditCard size={18} />
                Pricing
              </Link>
            </Button>

            {authState.type === "authenticated" &&
              authState.user.role === "admin" && (
                <Button
                  asChild
                  variant="ghost"
                  className={
                    isActive("/admin") ? styles.activeNavLink : styles.navLink
                  }
                >
                  <Link to="/admin">
                    <Shield size={18} />
                    {t("nav.admin")}
                  </Link>
                </Button>
              )}

            <Button
              asChild
              variant="primary"
              className={styles.addBusinessBtn}
            >
              <Link to="/add-business">
                <PlusCircle size={18} />
                <span className={styles.navText}>{t("nav.addBusiness")}</span>
              </Link>
            </Button>

            {/* Settings Section */}
            <div className={styles.settingsSection}>
              <ThemeModeSwitch />
              <LanguageSwitch />
            </div>

            {/* Auth Section */}
            <div className={styles.authSection}>
              {authState.type === "authenticated" && <NotificationBell />}

              {authState.type === "loading" && (
                <Skeleton
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "var(--radius-full)",
                  }}
                />
              )}
              {authState.type === "unauthenticated" && (
                <Button asChild variant="outline" className={styles.signInBtn}>
                  <Link to="/login">{t("nav.signIn")}</Link>
                </Button>
              )}
              {authState.type === "authenticated" && (
                <DropdownMenu>
                  <DropdownMenuTrigger className={styles.avatarTrigger}>
                    <Avatar>
                      <AvatarFallback>
                        {authState.user.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {authState.user.displayName}
                    </DropdownMenuLabel>
                    <DropdownMenuLabel className={styles.userEmail}>
                      {authState.user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut size={16} />
                      {t("nav.signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <>
            <div
              className={styles.mobileMenuOverlay}
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className={styles.mobileMenu}>
              <Button
                asChild
                variant="ghost"
                className={isActive("/") ? styles.activeNavLink : styles.navLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/">
                  <Home size={18} />
                  {t("nav.home")}
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className={
                  isActive("/search") ? styles.activeNavLink : styles.navLink
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/search">
                  <Search size={18} />
                  {t("nav.search")}
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className={
                  isActive("/reviews") ? styles.activeNavLink : styles.navLink
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/reviews">
                  <MessageSquare size={18} />
                  {t("nav.reviews")}
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className={
                  isActive("/faq") ? styles.activeNavLink : styles.navLink
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/faq">
                  <HelpCircle size={18} />
                  {t("nav.faq")}
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className={
                  isActive("/pricing") ? styles.activeNavLink : styles.navLink
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/pricing">
                  <CreditCard size={18} />
                  Pricing
                </Link>
              </Button>
              {authState.type === "authenticated" &&
                authState.user.role === "admin" && (
                  <Button
                    asChild
                    variant="ghost"
                    className={
                      isActive("/admin") ? styles.activeNavLink : styles.navLink
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/admin">
                      <Shield size={18} />
                      {t("nav.admin")}
                    </Link>
                  </Button>
                )}
              <Button
                asChild
                variant="primary"
                className={styles.addBusinessBtn}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/add-business">
                  <PlusCircle size={18} />
                  {t("nav.addBusiness")}
                </Link>
              </Button>

              <div className={styles.mobileMenuSettings}>
                <ThemeModeSwitch />
                <LanguageSwitch />
              </div>
            </div>
          </>
        )}
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <AppFooter />
      <AiAssistantChat />
    </div>
  );
};