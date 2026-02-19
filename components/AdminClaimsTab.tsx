import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminClaimsList,
  InputType as ClaimsListInput,
} from "../endpoints/admin/claims/list_GET.schema";
import {
  reviewClaim,
  InputType as ReviewClaimInput,
} from "../endpoints/admin/claims/review_POST.schema";
import {
  getClaimAuditLog,
  InputType as AuditLogInput,
} from "../endpoints/admin/claims/audit-log_GET.schema";
import { useI18n } from "../helpers/i18n";
import { useDebounce } from "../helpers/useDebounce";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Textarea } from "./Textarea";
import { Skeleton } from "./Skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { DocumentViewerModal } from "./DocumentViewerModal";
import { ClaimVerificationStatusArrayValues } from "../helpers/schema";
import styles from "./AdminClaimsTab.module.css";

// --- Queries & Mutations ---

const CLAIMS_KEYS = {
  all: ["admin", "claims"] as const,
  list: (params: ClaimsListInput) => [...CLAIMS_KEYS.all, "list", params] as const,
  audit: (claimId: number) => [...CLAIMS_KEYS.all, "audit", claimId] as const,
};

function useAdminClaims(params: ClaimsListInput) {
  return useQuery({
    queryKey: CLAIMS_KEYS.list(params),
    queryFn: () => getAdminClaimsList(params),
    placeholderData: (prev) => prev,
  });
}

function useClaimAuditLog(claimId: number | null) {
  return useQuery({
    queryKey: CLAIMS_KEYS.audit(claimId || 0),
    queryFn: () => getClaimAuditLog({ claimId: claimId! }),
    enabled: !!claimId,
  });
}

function useReviewClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReviewClaimInput) => reviewClaim(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CLAIMS_KEYS.all });
      // Invalidate business details as ownership might have changed
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      // Invalidate notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      const action = variables.action === "approve" ? "approved" : "rejected";
      toast.success(`Claim successfully ${action}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to review claim");
    },
  });
}

// --- Components ---

export const AdminClaimsTab = () => {
  const { t } = useI18n();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [expandedClaimId, setExpandedClaimId] = useState<number | null>(null);

  // Modal State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{
    id: number;
    fileName: string;
    fileType: string;
  } | null>(null);

  const { data, isFetching } = useAdminClaims({
    page,
    limit: 10,
    verificationStatus: statusFilter === "all" ? undefined : (statusFilter as any),
  });

  const toggleExpand = (id: number) => {
    setExpandedClaimId(expandedClaimId === id ? null : id);
  };

  const openDocument = (doc: { id: number; fileName: string; fileType: string }) => {
    setSelectedDoc(doc);
    setViewerOpen(true);
  };

  return (
    <div className={styles.tabContainer}>
      <div className={styles.toolbar}>
        <div className={styles.filterWrapper}>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ClaimVerificationStatusArrayValues.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Business Name</th>
              <th className={styles.th}>Claimant</th>
              <th className={styles.th}>Proof Type</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Submitted</th>
              <th className={styles.th}>Docs</th>
              <th className={`${styles.th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isFetching && !data ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.td}><Skeleton className="h-4 w-32" /></td>
                  <td className={styles.td}><Skeleton className="h-4 w-24" /></td>
                  <td className={styles.td}><Skeleton className="h-4 w-20" /></td>
                  <td className={styles.td}><Skeleton className="h-6 w-24 rounded-full" /></td>
                  <td className={styles.td}><Skeleton className="h-4 w-20" /></td>
                  <td className={styles.td}><Skeleton className="h-4 w-8" /></td>
                  <td className={styles.td}><Skeleton className="h-8 w-20 ml-auto" /></td>
                </tr>
              ))
            ) : data?.claims.length === 0 ? (
              <tr className={styles.tr}>
                <td colSpan={7} className={`${styles.td} text-center py-8 text-muted-foreground`}>
                  No claims found matching your criteria.
                </td>
              </tr>
            ) : (
              data?.claims.map((claim) => (
                <React.Fragment key={claim.id}>
                  <tr 
                    className={`${styles.tr} ${expandedClaimId === claim.id ? styles.expandedRow : ""}`}
                    onClick={() => toggleExpand(claim.id)}
                  >
                    <td className={`${styles.td} font-medium`}>{claim.businessName}</td>
                    <td className={styles.td}>
                      <div className="flex flex-col">
                        <span>{claim.ownerName}</span>
                        <span className="text-xs text-muted-foreground">{claim.ownerEmail}</span>
                      </div>
                    </td>
                    <td className={`${styles.td} capitalize`}>
                      {claim.proofType.replace("_", " ")}
                    </td>
                    <td className={styles.td}>
                      <Badge
                        variant={
                          claim.verificationStatus === "verified" ? "success" :
                          claim.verificationStatus === "rejected" ? "destructive" :
                          claim.verificationStatus === "under_review" ? "warning" : "default"
                        }
                        className="capitalize"
                      >
                        {claim.verificationStatus.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className={styles.td}>
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </td>
                    <td className={styles.td}>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <FileText size={14} />
                        <span>{claim.documentCount}</span>
                      </div>
                    </td>
                    <td className={`${styles.td} text-right`}>
                      <Button
                        variant={expandedClaimId === claim.id ? "primary" : "ghost"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(claim.id);
                        }}
                      >
                        {expandedClaimId === claim.id ? "Close" : "Review"}
                        {expandedClaimId === claim.id ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
                      </Button>
                    </td>
                  </tr>
                  
                  {expandedClaimId === claim.id && (
                    <tr className={styles.detailRow}>
                      <td colSpan={7} className={styles.detailCell}>
                        <ClaimDetailPanel 
                          claim={claim} 
                          onOpenDocument={openDocument} 
                          onClose={() => setExpandedClaimId(null)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || isFetching}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {Math.ceil((data?.total || 0) / 10) || 1}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setPage(p => p + 1)}
          disabled={!data || page >= Math.ceil(data.total / 10) || isFetching}
        >
          Next
        </Button>
      </div>

      {selectedDoc && (
        <DocumentViewerModal
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          documentId={selectedDoc.id}
          fileName={selectedDoc.fileName}
          fileType={selectedDoc.fileType}
        />
      )}
    </div>
  );
};

// --- Detail Panel Subcomponent ---

const ClaimDetailPanel = ({ 
  claim, 
  onOpenDocument,
  onClose
}: { 
  claim: any, 
  onOpenDocument: (doc: any) => void,
  onClose: () => void
}) => {
  const [adminNotes, setAdminNotes] = useState(claim.adminNotes || "");
  const { data: auditLogs } = useClaimAuditLog(claim.id);
  const reviewMutation = useReviewClaim();
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);

  const handleAction = async (action: "approve" | "reject") => {
    await reviewMutation.mutateAsync({
      claimId: claim.id,
      action,
      adminNotes,
    });
    setConfirmAction(null);
    onClose();
  };

  const isPending = reviewMutation.isPending;

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailGrid}>
        
        {/* Left Column: Info & Documents */}
        <div className={styles.leftCol}>
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Proof Description</h4>
            <p className={styles.descriptionText}>{claim.proofDescription}</p>
          </div>

          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Documents ({claim.documents.length})</h4>
            {claim.documents.length === 0 ? (
              <p className="text-muted-foreground italic">No documents uploaded.</p>
            ) : (
              <div className={styles.docsGrid}>
                {claim.documents.map((doc: any) => (
                  <div key={doc.id} className={styles.docCard} onClick={() => onOpenDocument(doc)}>
                    <div className={styles.docIcon}>
                      {doc.fileType.startsWith("image/") ? (
                        <ImageIcon size={24} />
                      ) : (
                        <FileText size={24} />
                      )}
                    </div>
                    <div className={styles.docInfo}>
                      <span className={styles.docName} title={doc.fileName}>{doc.fileName}</span>
                      <span className={styles.docSize}>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className={styles.previewHint}>
                      <ExternalLink size={12} className="mr-1" /> Preview
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Audit History</h4>
            <div className={styles.auditTimeline}>
              {auditLogs?.logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history available.</p>
              ) : (
                auditLogs?.logs.map((log: any) => (
                  <div key={log.id} className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>
                      {log.action.includes("approved") ? (
                        <CheckCircle size={14} className="text-success" />
                      ) : log.action.includes("rejected") ? (
                        <XCircle size={14} className="text-destructive" />
                      ) : (
                        <Clock size={14} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className={styles.timelineContent}>
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm capitalize">
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        By <span className="font-medium text-foreground">{log.actorName}</span>
                      </p>
                      {log.details && (
                        <p className="text-xs italic mt-1 bg-muted/50 p-2 rounded">"{log.details}"</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className={styles.rightCol}>
          <div className={styles.actionPanel}>
            <h4 className={styles.sectionTitle}>Review Actions</h4>
            
            <div className="mb-4">
              <label className={styles.label}>Admin Notes / Rejection Reason</label>
              <Textarea 
                placeholder="Enter notes about this decision..." 
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="mb-4"
              />
            </div>

            {confirmAction ? (
              <div className={styles.confirmBox}>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <AlertTriangle size={16} className={confirmAction === "approve" ? "text-success" : "text-destructive"} />
                  Confirm {confirmAction === "approve" ? "Approval" : "Rejection"}?
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {confirmAction === "approve" 
                    ? "This will transfer ownership of the business to the claimant."
                    : "The user will be notified of the rejection."
                  }
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setConfirmAction(null)}
                    className="flex-1"
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant={confirmAction === "approve" ? "primary" : "destructive"} 
                    className={confirmAction === "approve" ? "bg-green-600 hover:bg-green-700 flex-1" : "flex-1"}
                    size="sm"
                    onClick={() => handleAction(confirmAction)}
                    disabled={isPending}
                  >
                    {isPending ? "Processing..." : "Confirm"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                  onClick={() => setConfirmAction("approve")}
                  disabled={claim.verificationStatus === "verified" || isPending}
                >
                  <ShieldCheck size={16} className="mr-2" />
                  Approve Claim
                </Button>
                
                <Button 
                  variant="destructive"
                  className="w-full"
                  onClick={() => setConfirmAction("reject")}
                  disabled={claim.verificationStatus === "rejected" || isPending}
                >
                  <XCircle size={16} className="mr-2" />
                  Reject Claim
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};