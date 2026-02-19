import { z } from "zod";
import superjson from 'superjson';
import { ReviewSentimentArrayValues } from "../../helpers/schema";

export const schema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  sentiment: z.enum(ReviewSentimentArrayValues).optional(),
});

export type InputType = z.infer<typeof schema>;

export type RecentReview = {
  id: number;
  businessId: number;
  businessName: string;
  reviewerName: string;
  rating: number;
  content: string;
  sentiment: "mixed" | "negative" | "neutral" | "positive" | null;
  createdAt: Date;
};

export type OutputType = {
  reviews: RecentReview[];
};

export const getRecentReviews = async (params: Partial<InputType> = {}, init?: RequestInit): Promise<OutputType> => {
  const url = new URL("/_api/reviews/recent", "http://dummy.com");
  
  if (params.limit) {
    url.searchParams.set("limit", params.limit.toString());
  }
  if (params.sentiment) {
    url.searchParams.set("sentiment", params.sentiment);
  }

  const result = await fetch(url.toString().replace("http://dummy.com", ""), {
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