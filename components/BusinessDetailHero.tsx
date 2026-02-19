import { MapPin, Globe, CheckCircle, Building2, ShieldCheck, Clock, EyeOff } from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Skeleton } from "./Skeleton";
import { Selectable } from "kysely";
import { Businesses, VerificationTier } from "../helpers/schema";
import { BusinessClaimForm } from "./BusinessClaimForm";
import { BusinessClaimStatus } from "./BusinessClaimStatus";
import { useAuth } from "../helpers/useAuth";
import { useClaimStatus } from "../helpers/useBusinessApi";
import { useI18n } from "../helpers/i18n";
import { useState } from "react";
import styles from "./BusinessDetailHero.module.css";

interface BusinessDetailHeroProps {
  business: Selectable<Businesses> | undefined;
  isLoading: boolean;
}

export const BusinessDetailHero = ({ business, isLoading }: BusinessDetailHeroProps) => {
  const { t } = useI18n();
  const { authState } = useAuth();
  const [showClaimForm, setShowClaimForm] = useState(false);

  const isAuthenticated = authState.type === "authenticated";
  
  // Fetch claim status for this business if user is authenticated
  // We only enable this query if we have a business ID and user is logged in
  const { data: claimStatusData } = useClaimStatus(
    business?.id && isAuthenticated ? business.id : 0
  );

  if (isLoading) {
    return (
      <div className={styles.hero}>
        <Skeleton style={{ height: "3rem", width: "60%" }} />
        <div className={styles.badges}>
          <Skeleton style={{ height: "1.5rem", width: "6rem" }} />
          <Skeleton style={{ height: "1.5rem", width: "5rem" }} />
        </div>
        <div className={styles.info}>
          <Skeleton style={{ height: "1.25rem", width: "10rem" }} />
          <Skeleton style={{ height: "1.25rem", width: "8rem" }} />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className={styles.hero}>
        <h1 className={styles.title}>{t("business.notFound")}</h1>
      </div>
    );
  }

  const categoryLabel = business.category.replace(/_/g, " ").split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Check if user has an existing claim (pending, under review, or verified/rejected)
  const hasExistingClaim = !!claimStatusData?.claim;
  
  // Logic for showing claim UI:
  // 1. If user has any claim record -> Show Status (covers pending/review/verified)
  // 2. If business is claimed by current user (via business object) -> Show Status (redundant with #1 usually but good fallback)
  // 3. If business is NOT claimed AND user has NO claim AND is auth -> Show Claim Button
  
  const isBusinessOwned = business.ownershipStatus === 'claimed' || business.ownershipStatus === 'verified';
  const shouldShowStatus = hasExistingClaim || (isBusinessOwned && isAuthenticated && business.claimedByUserId === authState.user.id);
  
  // Logic updated: Allow claiming if unclaimed or community listed (and not already claimed by someone else, implied by ownershipStatus check usually)
  // And user doesn't have an existing claim in progress
  const canShowClaimButton = !isBusinessOwned && !hasExistingClaim;

  return (
    <div className={styles.hero}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{business.name}</h1>
        {canShowClaimButton && !showClaimForm && (
          isAuthenticated ? (
            <Button
              variant="secondary"
              onClick={() => setShowClaimForm(true)}
              className={styles.claimButton}
            >
              Manage Your Business Profile
            </Button>
          ) : (
            <Button
              variant="outline"
              asChild
              className={styles.claimButton}
            >
              <a href="/login">Sign in to manage this business</a>
            </Button>
          )
        )}
      </div>
      
      {/* Show claim form if user can claim and clicked the button */}
      {showClaimForm && canShowClaimButton && isAuthenticated && (
        <BusinessClaimForm
          businessId={business.id}
          onCancel={() => setShowClaimForm(false)}
          onSuccess={() => setShowClaimForm(false)}
        />
      )}

      {/* Show claim status if user has a claim or is the owner */}
      {shouldShowStatus && (
        <BusinessClaimStatus businessId={business.id} />
      )}

      <div className={styles.badges}>
        <Badge variant="outline">
          {categoryLabel}
        </Badge>

        {/* Verification Tier Badges */}
        {business.verificationTier === 'trusted_verified' ? (
          <Badge variant="success">
            <ShieldCheck size={14} />
            Trusted Verified
          </Badge>
        ) : business.verificationTier === 'basic_verified' ? (
          <Badge variant="default">
            <CheckCircle size={14} />
            Owner Verified
          </Badge>
        ) : (
          <Badge variant="outline" style={{ color: "var(--muted-foreground)", borderColor: "var(--border)" }}>
            <Building2 size={14} />
            Community Listed
          </Badge>
        )}

        {/* Visibility Status Badge (only if not published) */}
        {business.visibilityStatus === 'pending_review' ? (
          <Badge variant="warning">
            <Clock size={14} />
            Pending Review
          </Badge>
        ) : business.visibilityStatus === 'hidden' ? (
          <Badge variant="destructive">
            <EyeOff size={14} />
            Hidden
          </Badge>
        ) : null}
      </div>

      <div className={styles.info}>
        {business.location && (
          <div className={styles.infoItem}>
            <MapPin size={16} />
            <span>{business.location}</span>
          </div>
        )}
        {business.website && (
          <div className={styles.infoItem}>
            <Globe size={16} />
            <Button asChild variant="link" size="sm">
              <a href={business.website} target="_blank" rel="noopener noreferrer">
                {t("business.visitWebsite")}
              </a>
            </Button>
          </div>
        )}
      </div>

      {business.description && (
        <p className={styles.description}>{business.description}</p>
      )}
    </div>
  );
};