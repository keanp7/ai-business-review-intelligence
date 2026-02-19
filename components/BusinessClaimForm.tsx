import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import { useClaimBusiness } from "../helpers/useBusinessApi";
import { useAuth } from "../helpers/useAuth";
import { toast } from "sonner";
import styles from "./BusinessClaimForm.module.css";

interface BusinessClaimFormProps {
  className?: string;
  businessId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

export const BusinessClaimForm = ({
  className,
  businessId,
  onCancel,
  onSuccess,
}: BusinessClaimFormProps) => {
  const { authState } = useAuth();
  const claimMutation = useClaimBusiness();
  
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  // Pre-fill form with user data when available
  useEffect(() => {
    if (authState.type === "authenticated") {
      setOwnerName(authState.user.displayName || "");
      setOwnerEmail(authState.user.email || "");
    }
  }, [authState]);

  const handleSubmit = () => {
    claimMutation.mutate(
      {
        businessId,
        ownerName,
        ownerEmail,
        // The backend handles defaults for proofType ('email_verification') 
        // and proofDescription ('Auto-claimed via email match')
      },
      {
        onSuccess: () => {
          toast.success("You now have owner access to this business!");
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to claim business");
        },
      }
    );
  };

  const isSubmitDisabled =
    !ownerName ||
    !ownerEmail ||
    claimMutation.isPending;

  return (
    <div className={`${styles.claimForm} ${className || ""}`}>
      <div className={styles.claimFormHeader}>
        <div>
          <h3 className={styles.claimFormTitle}>Manage Your Business Profile</h3>
          <p className={styles.claimFormDescription}>
            You'll get instant owner access to manage this business profile, respond to reviews, and view analytics.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onCancel}
          className={styles.closeButton}
          type="button"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Owner Information Section */}
      <div className={styles.section}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Owner Name</label>
          <Input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Your full legal name"
            disabled={claimMutation.isPending}
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Contact Email</label>
          <Input
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="business@example.com"
            disabled={claimMutation.isPending}
          />
        </div>
      </div>

      {/* Submit Actions */}
      <div className={styles.formActions}>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={claimMutation.isPending}
          type="button"
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          type="button"
        >
          {claimMutation.isPending ? "Verifying..." : "Get Owner Access"}
        </Button>
      </div>
    </div>
  );
};