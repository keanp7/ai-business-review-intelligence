import { useQuery } from "@tanstack/react-query";
import { getAdminAnalytics, OutputType } from "../endpoints/admin/analytics_GET.schema";

export const ADMIN_ANALYTICS_QUERY_KEY = ["admin", "analytics"] as const;

export function useAdminAnalytics() {
  return useQuery<OutputType, Error>({
    queryKey: ADMIN_ANALYTICS_QUERY_KEY,
    queryFn: async () => {
      return await getAdminAnalytics();
    },
    // Don't refetch too often as analytics data doesn't change every second
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}