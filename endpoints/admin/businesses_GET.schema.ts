import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { Businesses, BusinessStatusArrayValues, VisibilityStatusArrayValues, OwnershipStatusArrayValues } from "../../helpers/schema";

export const schema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  status: z.enum(BusinessStatusArrayValues).optional(),
  visibilityStatus: z.enum(VisibilityStatusArrayValues).optional(),
  ownershipStatus: z.enum(OwnershipStatusArrayValues).optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  businesses: Selectable<Businesses>[];
  total: number;
};

export const getAdminBusinesses = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const url = new URL("/_api/admin/businesses", "http://dummy.com");
  if (params.page) url.searchParams.set("page", params.page.toString());
  if (params.limit) url.searchParams.set("limit", params.limit.toString());
  if (params.search) url.searchParams.set("search", params.search);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.visibilityStatus) url.searchParams.set("visibilityStatus", params.visibilityStatus);
  if (params.ownershipStatus) url.searchParams.set("ownershipStatus", params.ownershipStatus);

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