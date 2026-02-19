import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  businessId: z.coerce.number(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  trustScore: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  };
  pricingPerception: string;
  overallSummary: string;
  strengths: string[];
  weaknesses: string[];
  recommendationScore: number;
  dataConfidence: 'low' | 'medium' | 'high';
  totalReviews: number;
  trustMessage: string | null;
};

export const getBusinessAiInsights = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const url = new URL("/_api/business/ai-insights", "http://dummy.com");
  url.searchParams.set("businessId", params.businessId.toString());

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