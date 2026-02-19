import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { Reviews, ReviewSentimentArrayValues } from "../../helpers/schema";

export const schema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sentiment: z.enum(ReviewSentimentArrayValues).optional(),
  businessId: z.coerce.number().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  reviews: (Selectable<Reviews> & { businessName: string })[];
  total: number;
};

export const getAdminReviews = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const url = new URL("/_api/admin/reviews", "http://dummy.com");
  if (params.page) url.searchParams.set("page", params.page.toString());
  if (params.limit) url.searchParams.set("limit", params.limit.toString());
  if (params.sentiment) url.searchParams.set("sentiment", params.sentiment);
  if (params.businessId) url.searchParams.set("businessId", params.businessId.toString());

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