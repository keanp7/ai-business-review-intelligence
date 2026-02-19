import { FileText, Image as ImageIcon, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Badge } from "./Badge";
import { Skeleton } from "./Skeleton";
import { useClaimStatus } from "../helpers/useBusinessApi";
import { ClaimVerificationStatus, ProofType } from "../helpers/schema";
import styles from "./BusinessClaimStatus.module.css";

interface BusinessClaimStatusProps {
  className?: string;
  businessId: number;
}

const PROOF_TYPE_LABELS: Record<ProofType, string> = {
  business_registration: "Business Registration Document",
  domain_ownership: "Domain Ownership Proof",
  email_verification: "Official Business Email Verification",
  payment_processor: "Payment Processor Account",
  platform_admin: "Platform Admin Dashboard",
  tax_id: "Government Tax ID Document",
  signed_declaration: "Signed Ownership Declaration + ID",
};

export const BusinessClaimStatus = ({ className, businessId }: BusinessClaimStatusProps) => {
  const { data, isFetching } = useClaimStatus(businessId);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isFetching) {
    return (
      <div className={`${styles.statusCard} ${className || ""}`}>
        <Skeleton style={{ height: "3rem", width: "80%" }} />
        <Skeleton style={{ height: "1rem", width: "70%", marginTop: "var(--spacing-4)" }} />
        <Skeleton style={{ height: "1rem", width: "60%", marginTop: "var(--spacing-2)" }} />
      </div>
    );
  }

  if (!data?.claim) {
    return null;
  }

  const { claim } = data;
  const isAutoVerified = claim.proofType === 'email_verification' && claim.proofDescription === 'Auto-claimed via email match';

  const renderStatusBanner = () => {
    if (claim.verificationStatus === 'verified') {
      return (
        <div className={`${styles.banner} ${styles.bannerSuccess}`}>
          <div className={styles.bannerIcon}><CheckCircle2 size={24} /></div>
          <div className={styles.bannerContent}>
            <h3 className={styles.bannerTitle}>Owner Access Active — Basic Verified</h3>
            <p className={styles.bannerDescription}>
              You have full access to manage this business profile.
            </p>
          </div>
        </div>
      );
    }
    
    if (claim.verificationStatus === 'rejected') {
      return (
        <div className={`${styles.banner} ${styles.bannerError}`}>
          <div className={styles.bannerIcon}><AlertCircle size={24} /></div>
          <div className={styles.bannerContent}>
            <h3 className={styles.bannerTitle}>Claim Rejected</h3>
            <p className={styles.bannerDescription}>
              Your claim could not be verified. Please contact support.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className={`${styles.banner} ${styles.bannerPending}`}>
        <div className={styles.bannerIcon}><Clock size={24} /></div>
        <div className={styles.bannerContent}>
          <h3 className={styles.bannerTitle}>Pending Review</h3>
          <p className={styles.bannerDescription}>
            We are reviewing your claim request.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.statusCard} ${className || ""}`}>
      {renderStatusBanner()}

      <div className={styles.contentSection}>
        {claim.verificationStatus === 'verified' && (
           <div className={styles.tierInfo}>
             <Badge variant="secondary" className={styles.tierBadge}>Basic Verified</Badge>
             <p className={styles.tierUpsell}>
               Upgrade to Trusted Verified for premium features like priority support and advanced analytics.
             </p>
           </div>
        )}

        <div className={styles.statusDetails}>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Submitted:</span>
            <span className={styles.statusValue}>{formatDate(claim.createdAt)}</span>
          </div>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Owner Name:</span>
            <span className={styles.statusValue}>{claim.ownerName}</span>
          </div>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Contact Email:</span>
            <span className={styles.statusValue}>{claim.ownerEmail}</span>
          </div>
          
          {/* Only show proof type if it's not the default auto-verification */}
          {!isAutoVerified && (
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>Proof Type:</span>
              <span className={styles.statusValue}>
                {PROOF_TYPE_LABELS[claim.proofType] || claim.proofType}
              </span>
            </div>
          )}
          
          {claim.adminNotes && (
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>Admin Notes:</span>
              <span className={styles.statusValue}>{claim.adminNotes}</span>
            </div>
          )}
        </div>

        {claim.documents && claim.documents.length > 0 && (
          <div className={styles.documentsSection}>
            <h4 className={styles.documentsTitle}>Submitted Documents</h4>
            <div className={styles.documentsList}>
              {claim.documents.map((doc) => (
                <div key={doc.id} className={styles.documentItem}>
                  <div className={styles.documentIcon}>
                    {doc.fileType === "application/pdf" ? (
                      <FileText size={18} />
                    ) : (
                      <ImageIcon size={18} />
                    )}
                  </div>
                  <div className={styles.documentInfo}>
                    <span className={styles.documentName}>{doc.fileName}</span>
                    <span className={styles.documentSize}>{formatFileSize(doc.fileSize)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};