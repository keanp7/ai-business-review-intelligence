import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchBusinesses, InputType as SearchInput } from "../endpoints/business/search_GET.schema";
import { getBusinessDetail, InputType as DetailInput } from "../endpoints/business/detail_GET.schema";
import { getBusinessReviews, InputType as ReviewsInput } from "../endpoints/business/reviews_GET.schema";
import { getBusinessAiInsights, InputType as InsightsInput } from "../endpoints/business/ai-insights_GET.schema";
import { addBusiness, InputType as AddBusinessInput } from "../endpoints/business/add_POST.schema";
import { addReview, InputType as AddReviewInput } from "../endpoints/business/review/add_POST.schema";
import { claimBusiness, InputType as ClaimBusinessInput } from "../endpoints/business/claim_POST.schema";
import { quickAddBusiness, InputType as QuickAddInput } from "../endpoints/business/quick-add_POST.schema";
import { getClaimStatus, InputType as ClaimStatusInput } from "../endpoints/business/claim/status_GET.schema";
import { getClaimDocument, InputType as ClaimDocumentInput } from "../endpoints/business/claim/documents_GET.schema";
import { postAutoMatchBusinesses } from "../endpoints/business/auto-match_POST.schema";

// Query Keys
export const businessKeys = {
  all: ['businesses'] as const,
  search: (query: string, category?: string) => [...businessKeys.all, 'search', query, category] as const,
  detail: (id: number) => [...businessKeys.all, 'detail', id] as const,
  reviews: (businessId: number) => [...businessKeys.all, 'reviews', businessId] as const,
  insights: (businessId: number) => [...businessKeys.all, 'insights', businessId] as const,
};

export const claimKeys = {
  all: ['business-claims'] as const,
  status: (businessId: number) => [...claimKeys.all, 'status', businessId] as const,
};

// Hooks

export function useSearchBusinesses(query: string, category?: string) {
  return useQuery({
    queryKey: businessKeys.search(query, category),
    queryFn: () => searchBusinesses({ q: query, category: category as any }),
    enabled: true, // Always enabled to allow initial load of all businesses if query is empty
    placeholderData: (prev) => prev,
  });
}

export function useBusinessDetail(id: number | undefined) {
  return useQuery({
    queryKey: businessKeys.detail(id!),
    queryFn: () => getBusinessDetail({ id: id! }),
    enabled: !!id,
  });
}

export function useBusinessReviews(businessId: number | undefined) {
  return useQuery({
    queryKey: businessKeys.reviews(businessId!),
    queryFn: () => getBusinessReviews({ businessId: businessId! }),
    enabled: !!businessId,
  });
}

export function useBusinessAiInsights(businessId: number | undefined) {
  return useQuery({
    queryKey: businessKeys.insights(businessId!),
    queryFn: () => getBusinessAiInsights({ businessId: businessId! }),
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5, // Cache insights for 5 minutes as they are expensive to generate
  });
}

export function useClaimStatus(businessId: number) {
  return useQuery({
    queryKey: claimKeys.status(businessId),
    queryFn: () => getClaimStatus({ businessId }),
    enabled: businessId > 0,
  });
}

export function useAddBusiness() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AddBusinessInput) => addBusiness(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
    },
  });
}

export function useAddReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AddReviewInput) => addReview(data),
    onSuccess: (data, variables) => {
      // Invalidate reviews for this business
      queryClient.invalidateQueries({ queryKey: businessKeys.reviews(variables.businessId) });
      // Invalidate business detail (for updated rating/counts)
      queryClient.invalidateQueries({ queryKey: businessKeys.detail(variables.businessId) });
      // Invalidate insights (as new review might change them)
      queryClient.invalidateQueries({ queryKey: businessKeys.insights(variables.businessId) });
    },
  });
}

export function useClaimBusiness() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ClaimBusinessInput) => claimBusiness(data),
    onSuccess: (data, variables) => {
      // Invalidate all business queries to update the claimed status
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
      // Specifically invalidate the detail page for this business
      queryClient.invalidateQueries({ queryKey: businessKeys.detail(variables.businessId) });
      // Invalidate claim status queries
      queryClient.invalidateQueries({ queryKey: claimKeys.all });
    },
  });
}

export function useClaimDocument() {
  return useMutation({
    mutationFn: (data: ClaimDocumentInput) => getClaimDocument(data),
  });
}

export function useQuickAddBusiness() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: QuickAddInput) => quickAddBusiness(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
    },
  });
}

export function useAutoMatchBusinesses() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => postAutoMatchBusinesses({}),
    onSuccess: () => {
      // Invalidate business list to show newly matched businesses
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
      // Invalidate claim status as auto-match creates claims
      queryClient.invalidateQueries({ queryKey: claimKeys.all });
    },
  });
}