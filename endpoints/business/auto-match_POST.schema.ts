import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  matchedCount: number;
  matchedBusinessIds: number[];
  message: string;
};

export const postAutoMatchBusinesses = async (
  body: z.infer<typeof schema> = {}, 
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/business/auto-match`, {
    method: "POST",
    body: superjson.stringify(body),
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