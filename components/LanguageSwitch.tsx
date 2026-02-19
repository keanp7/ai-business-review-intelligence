"use client";

import React from "react";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Button } from "./Button";
import { useI18n, LanguageCode } from "../helpers/i18n";
import styles from "./LanguageSwitch.module.css";

export interface LanguageSwitchProps {
  /**
   * Optional CSS class to apply to the component
   */
  className?: string;
}

export const LanguageSwitch = ({ className }: LanguageSwitchProps) => {
  const { language, setLanguage, languages } = useI18n();

  const handleLanguageChange = (code: LanguageCode) => {
    setLanguage(code);
  };

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-md"
            aria-label={`Current language: ${language}. Click to change language`}
            className={styles.langButton}
          >
            <Globe className={styles.icon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={styles.menuContent}>
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              className={language === lang.code ? styles.activeItem : ""}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className={styles.flag}>{lang.flag}</span>
              {lang.label}
              {language === lang.code && <span className={styles.checkmark}>✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};