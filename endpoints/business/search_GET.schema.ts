import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { Businesses, BusinessCategoryArrayValues } from "../../helpers/schema";

export const schema = z.object({
  q: z.string().optional(),
  category: z.enum(BusinessCategoryArrayValues).optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<Businesses>[];

export const searchBusinesses = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const url = new URL("/_api/business/search", "http://dummy.com"); // Base URL is ignored by fetch but needed for URL constructor
  if (params.q) url.searchParams.set("q", params.q);
  if (params.category) url.searchParams.set("category", params.category);

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