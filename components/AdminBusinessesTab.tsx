import React, { useState } from "react";
import {
  useAdminBusinesses,
  useDeleteBusiness,
  useModerateBusiness,
} from "../helpers/useAdminApi";
import { useI18n } from "../helpers/i18n";
import { Button } from "./Button";
import { Input } from "./Input";
import { Badge } from "./Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";
import { Skeleton } from "./Skeleton";
import { Trash2, Search, Star, Check, X, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useDebounce } from "../helpers/useDebounce";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import styles from "./AdminShared.module.css";

export function AdminBusinessesTab() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // New toggle state for visibility filter: 'all' | 'pending' | 'published'
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "published">("all");
  
  const [page, setPage] = useState(1);
  
  // Map activeFilter to API params
  const visibilityStatusParam = 
    activeFilter === "pending" ? "pending_review" :
    activeFilter === "published" ? "published" :
    undefined;

  const { data, isFetching } = useAdminBusinesses({
    page,
    limit: 10,
    search: debouncedSearch,
    visibilityStatus: visibilityStatusParam,
    // Removed ownershipStatus param as requested
  });
  
  const deleteBusiness = useDeleteBusiness();
  const moderateBusiness = useModerateBusiness();
  const [businessToDelete, setBusinessToDelete] = useState<number | null>(null);

  const handleDelete = async () => {
    if (businessToDelete) {
      await deleteBusiness.mutateAsync({ businessId: businessToDelete });
      setBusinessToDelete(null);
    }
  };

  return (
    <div className={styles.tabContainer}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={16} />
          <Input
            placeholder={t("search.placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        {/* Visibility Filter Toggle Group */}
        <div className={styles.filterToggleGroup}>
          <Button 
            size="sm" 
            variant={activeFilter === "all" ? "primary" : "outline"}
            onClick={() => { setActiveFilter("all"); setPage(1); }}
          >
            All
          </Button>
          <Button 
            size="sm" 
            variant={activeFilter === "pending" ? "primary" : "outline"}
            onClick={() => { setActiveFilter("pending"); setPage(1); }}
          >
            Pending
          </Button>
          <Button 
            size="sm" 
            variant={activeFilter === "published" ? "primary" : "outline"}
            onClick={() => { setActiveFilter("published"); setPage(1); }}
          >
            Published
          </Button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Category</th>
              <th className={styles.th}>Rating</th>
              <th className={styles.th}>Reviews</th>
              <th className={styles.th}>Status</th>
              <th className={`${styles.th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isFetching && !data ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.td}><Skeleton className="h-4 w-32" /></td>
                  <td className={styles.td}><Skeleton className="h-4 w-24" /></td>
                  <td className={styles.td}><Skeleton className="h-4 w-16" /></td>
                  <td className={styles.td}><Skeleton className="h-4 w-12" /></td>
                  <td className={styles.td}><Skeleton className="h-6 w-24 rounded-full" /></td>
                  <td className={styles.td}><Skeleton className="h-8 w-24 ml-auto" /></td>
                </tr>
              ))
            ) : data?.businesses.length === 0 ? (
              <tr className={styles.tr}>
                <td colSpan={6} className={`${styles.td} ${styles.emptyState}`}>
                  {t("admin.noData")}
                </td>
              </tr>
            ) : (
              data?.businesses.map((business) => (
                <tr key={business.id} className={styles.tr}>
                  <td className={`${styles.td} font-medium`}>{business.name}</td>
                  <td className={`${styles.td} capitalize`}>{business.category.replace("_", " ")}</td>
                  <td className={styles.td}>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-primary text-primary" />
                      {Number(business.averageRating || 0).toFixed(1)}
                    </div>
                  </td>
                  <td className={styles.td}>{business.totalReviews || 0}</td>
                  <td className={styles.td}>
                    {business.visibilityStatus === "published" && (
                      <Badge variant="success">Published</Badge>
                    )}
                    {business.visibilityStatus === "pending_review" && (
                      <Badge variant="warning">Pending</Badge>
                    )}
                    {business.visibilityStatus === "hidden" && (
                      <Badge variant="destructive">Hidden</Badge>
                    )}
                  </td>
                  <td className={`${styles.td} text-right`}>
                    <div className={styles.actionButtons}>
                      {/* Actions for Pending Review */}
                      {business.visibilityStatus === "pending_review" && (
                        <>
                          <Button
                            size="sm"
                            className={styles.approveButton}
                            onClick={() =>
                              moderateBusiness.mutate({
                                businessId: business.id,
                                action: "approve",
                              })
                            }
                            disabled={moderateBusiness.isPending}
                          >
                            <Check size={14} /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={styles.rejectButtonOutline}
                            onClick={() =>
                              moderateBusiness.mutate({
                                businessId: business.id,
                                action: "reject",
                              })
                            }
                            disabled={moderateBusiness.isPending}
                          >
                            <X size={14} /> Reject
                          </Button>
                        </>
                      )}

                      {/* Actions for Published */}
                      {business.visibilityStatus === "published" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                moderateBusiness.mutate({
                                  businessId: business.id,
                                  action: "reject",
                                })
                              }
                              disabled={moderateBusiness.isPending}
                            >
                              <EyeOff size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Hide Business</TooltipContent>
                        </Tooltip>
                      )}

                      {/* Actions for Hidden */}
                      {business.visibilityStatus === "hidden" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-success"
                              onClick={() =>
                                moderateBusiness.mutate({
                                  businessId: business.id,
                                  action: "approve",
                                })
                              }
                              disabled={moderateBusiness.isPending}
                            >
                              <Eye size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Publish Business</TooltipContent>
                        </Tooltip>
                      )}

                      {/* Ownership Verification Action */}
                      {business.ownershipStatus === "claimed" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() =>
                                moderateBusiness.mutate({
                                  businessId: business.id,
                                  action: "verify_owner",
                                })
                              }
                              disabled={moderateBusiness.isPending}
                            >
                              <ShieldCheck size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Verify Ownership</TooltipContent>
                        </Tooltip>
                      )}

                      {/* Delete Action */}
                      <Dialog open={businessToDelete === business.id} onOpenChange={(open) => !open && setBusinessToDelete(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setBusinessToDelete(business.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t("admin.deleteConfirm")}</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will permanently delete the business
                              "{business.name}" and all associated data.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setBusinessToDelete(null)}>
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={handleDelete}
                              disabled={deleteBusiness.isPending}
                            >
                              {deleteBusiness.isPending ? "Deleting..." : "Delete"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Simple Pagination */}
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
    </div>
  );
}