import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, InputType as GetNotificationsInput } from "../endpoints/notifications/list_GET.schema";
import { markNotificationsRead, InputType as MarkReadInput } from "../endpoints/notifications/read_POST.schema";

// Query Keys
export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params: GetNotificationsInput) => [...notificationKeys.all, 'list', params] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
};

// Hooks

export function useNotifications(params: GetNotificationsInput = {}) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => getNotifications(params),
    // Refresh notifications more frequently or on window focus to keep them up to date
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useUnreadCount() {
  // We can reuse the main notifications query but select just the count
  // This avoids making a separate request if the data is already there
  return useQuery({
    queryKey: notificationKeys.list({}),
    queryFn: () => getNotifications({}),
    select: (data) => data.unreadCount,
    // Refresh frequently for the badge
    refetchInterval: 1000 * 60, // Every minute
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: MarkReadInput) => markNotificationsRead(data),
    onSuccess: () => {
      // Invalidate all notification queries to update lists and counts
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}