import { z } from "zod";
import superjson from 'superjson';

// No input parameters needed for basic analytics dashboard
export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  totalUsers: number;
  totalBusinesses: number;
  totalReviews: number;
  businessesByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  reviewsBySentiment: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  };
  recentBusinesses: number; // last 7 days
  recentReviews: number; // last 7 days
  averageRating: number;
  newUsersLast30Days: number;
};

export const getAdminAnalytics = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/admin/analytics`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string }>(await result.text());
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};