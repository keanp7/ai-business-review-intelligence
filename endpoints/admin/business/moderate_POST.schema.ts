import { z } from "zod";
import superjson from 'superjson';
import { Businesses } from "../../../helpers/schema";
import { Selectable } from "kysely";

export const schema = z.object({
  businessId: z.number(),
  action: z.enum(["approve", "reject", "verify_owner"]),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  business: Selectable<Businesses>;
};

export const moderateBusiness = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/admin/business/moderate`, {
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