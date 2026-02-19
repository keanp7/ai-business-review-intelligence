import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { Businesses } from "../../helpers/schema";

export const schema = z.object({
  id: z.coerce.number(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<Businesses> & {
  isPubliclyVisible: boolean;
};

export const getBusinessDetail = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const url = new URL("/_api/business/detail", "http://dummy.com");
  url.searchParams.set("id", params.id.toString());

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