import { z } from "zod";
import superjson from 'superjson';
import { UserRole } from "../../helpers/schema";

export const schema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  users: {
    id: number;
    displayName: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  }[];
  total: number;
};

export const getAdminUsers = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const url = new URL("/_api/admin/users", "http://dummy.com");
  if (params.page) url.searchParams.set("page", params.page.toString());
  if (params.limit) url.searchParams.set("limit", params.limit.toString());
  if (params.search) url.searchParams.set("search", params.search);

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