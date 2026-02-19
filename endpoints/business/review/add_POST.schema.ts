import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { Reviews } from "../../../helpers/schema";

export const schema = z.object({
  businessId: z.number(),
  reviewerName: z.string().optional(),
  rating: z.number().min(1).max(5),
  content: z.string().min(1, "Review content is required"),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<Reviews>;

export const addReview = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/business/review/add`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
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