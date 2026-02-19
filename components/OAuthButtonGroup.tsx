import React from "react";
import { GoogleLoginButton } from "./GoogleLoginButton";
import styles from "./OAuthButtonGroup.module.css";

interface OAuthButtonGroupProps {
  className?: string;
  disabled?: boolean;
}

export const OAuthButtonGroup: React.FC<OAuthButtonGroupProps> = ({
  className,
  disabled,
}) => {
  return (
    <div className={`${styles.container} ${className || ""}`}>
      <GoogleLoginButton disabled={disabled} />
      {/* Add more buttons here for other oauth providers as needed */}
    </div>
  );
};
