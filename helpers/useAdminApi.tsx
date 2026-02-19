import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminBusinesses, InputType as AdminBusinessesInput } from "../endpoints/admin/businesses_GET.schema";
import { getAdminReviews, InputType as AdminReviewsInput } from "../endpoints/admin/reviews_GET.schema";
import { getAdminUsers, InputType as AdminUsersInput } from "../endpoints/admin/users_GET.schema";
import { deleteReview, InputType as DeleteReviewInput } from "../endpoints/admin/review/delete_POST.schema";
import { deleteBusiness, InputType as DeleteBusinessInput } from "../endpoints/admin/business/delete_POST.schema";
import { moderateBusiness, InputType as ModerateBusinessInput } from "../endpoints/admin/business/moderate_POST.schema";
import { getAdminClaimsList, InputType as AdminClaimsInput } from "../endpoints/admin/claims/list_GET.schema";
import { reviewClaim, InputType as ReviewClaimInput } from "../endpoints/admin/claims/review_POST.schema";
import { getClaimAuditLog, InputType as ClaimAuditLogInput } from "../endpoints/admin/claims/audit-log_GET.schema";
import { businessKeys, claimKeys } from "./useBusinessApi";
import { notificationKeys } from "./useNotifications";

// Query Keys
export const adminKeys = {
  all: ['admin'] as const,
  businesses: (params: AdminBusinessesInput) => [...adminKeys.all, 'businesses', params] as const,
  reviews: (params: AdminReviewsInput) => [...adminKeys.all, 'reviews', params] as const,
  users: (params: AdminUsersInput) => [...adminKeys.all, 'users', params] as const,
  claims: (params: AdminClaimsInput) => [...adminKeys.all, 'claims', params] as const,
  claimAuditLog: (claimId: number) => [...adminKeys.all, 'claimAuditLog', claimId] as const,
};

// Hooks

export function useAdminBusinesses(params: AdminBusinessesInput) {
  return useQuery({
    queryKey: adminKeys.businesses(params),
    queryFn: () => getAdminBusinesses(params),
    placeholderData: (prev) => prev, // Keep previous data while fetching new page
  });
}

export function useAdminReviews(params: AdminReviewsInput) {
  return useQuery({
    queryKey: adminKeys.reviews(params),
    queryFn: () => getAdminReviews(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminUsers(params: AdminUsersInput) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => getAdminUsers(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminClaims(params: AdminClaimsInput) {
  return useQuery({
    queryKey: adminKeys.claims(params),
    queryFn: () => getAdminClaimsList(params),
    placeholderData: (prev) => prev,
  });
}

export function useClaimAuditLog(claimId: number) {
  return useQuery({
    queryKey: adminKeys.claimAuditLog(claimId),
    queryFn: () => getClaimAuditLog({ claimId }),
    enabled: claimId > 0,
  });
}

export function useReviewClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReviewClaimInput) => reviewClaim(data),
    onSuccess: () => {
      // Invalidate admin queries (claims list, etc)
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      // Invalidate public business queries (since ownership might change)
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
      // Invalidate claim status queries
      queryClient.invalidateQueries({ queryKey: claimKeys.all });
      // Invalidate notifications (since user gets notified)
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: DeleteReviewInput) => deleteReview(data),
    onSuccess: (data, variables) => {
      // Invalidate admin reviews list
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      
      // Also invalidate public business data since stats changed
      // We don't know the businessId here easily without returning it from the endpoint, 
      // but invalidating all business details is safer or we could rely on the user refreshing.
      // Ideally the endpoint returns the businessId, but for now we invalidate all business details to be safe
      // or just let the specific page refresh if the user navigates there.
      // A better approach is to invalidate the specific business if we knew it, but 'businessKeys.all' covers it.
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
    },
  });
}

export function useDeleteBusiness() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: DeleteBusinessInput) => deleteBusiness(data),
    onSuccess: () => {
      // Invalidate admin lists
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      // Invalidate public business lists
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
    },
  });
}

export function useModerateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ModerateBusinessInput) => moderateBusiness(data),
    onSuccess: () => {
      // Invalidate admin lists to reflect status change
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      // Invalidate public business lists (e.g. if a business is approved/rejected)
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
      // Invalidate claims since ownership status might change
      queryClient.invalidateQueries({ queryKey: claimKeys.all });
      // Invalidate notifications (since user gets notified)
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}