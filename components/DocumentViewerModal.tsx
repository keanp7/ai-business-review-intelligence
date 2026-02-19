import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./Dialog";
import { Button } from "./Button";
import { Skeleton } from "./Skeleton";
import { ZoomIn, ZoomOut, Download, AlertCircle, RefreshCw } from "lucide-react";
import { getClaimDocument } from "../endpoints/business/claim/documents_GET.schema";
import { toast } from "sonner";
import styles from "./DocumentViewerModal.module.css";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number | null;
  fileName: string;
  fileType: string;
}

export const DocumentViewerModal = ({
  isOpen,
  onClose,
  documentId,
  fileName,
  fileType,
}: DocumentViewerModalProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (isOpen && documentId) {
      fetchDocumentUrl();
    } else {
      setSignedUrl(null);
      setLoading(false);
      setError(null);
      setZoom(100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, documentId]);

  const fetchDocumentUrl = async () => {
    if (!documentId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getClaimDocument({ documentId });
      setSignedUrl(result.signedUrl);
    } catch (err) {
      console.error("Failed to fetch document:", err);
      setError("Failed to load document. Please try downloading instead.");
      toast.error("Could not load document preview.");
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 25));
  const handleResetZoom = () => setZoom(100);

  const handleDownload = () => {
    if (!signedUrl) return;
    const link = document.createElement("a");
    link.href = signedUrl;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = fileType.startsWith("image/");
  const isPdf = fileType === "application/pdf";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={styles.modalContent}>
        <div className={styles.header}>
          <DialogTitle className={styles.title}>{fileName}</DialogTitle>
          
          <div className={styles.controls}>
            {(isImage || isPdf) && !loading && !error && (
              <div className={styles.zoomControls}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 25}
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </Button>
                <span className={styles.zoomLevel} onClick={handleResetZoom}>
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 300}
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!signedUrl || loading}
              className={styles.downloadBtn}
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className={styles.previewArea}>
          {loading ? (
            <div className={styles.loadingState}>
              <Skeleton className={styles.skeleton} />
              <p>Loading preview...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <AlertCircle size={48} className="text-destructive mb-4" />
              <p>{error}</p>
              <Button onClick={fetchDocumentUrl} variant="outline" className="mt-4">
                <RefreshCw size={16} className="mr-2" /> Retry
              </Button>
            </div>
          ) : signedUrl ? (
            <div className={styles.contentContainer}>
              {isImage ? (
                <div 
                  className={styles.imageWrapper}
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
                >
                  <img src={signedUrl} alt={fileName} className={styles.previewImage} />
                </div>
              ) : isPdf ? (
                <iframe
                  src={`${signedUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=${zoom}`}
                  className={styles.previewFrame}
                  title={fileName}
                  style={{ width: `${zoom > 100 ? zoom : 100}%` }}
                />
              ) : (
                <div className={styles.unsupportedState}>
                  <div className={styles.fileIcon}>
                    {fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                  </div>
                  <p>Preview not available for this file type.</p>
                  <Button onClick={handleDownload}>Download to View</Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};