import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { Businesses, BusinessCategoryArrayValues } from "../../helpers/schema";

export const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.enum(BusinessCategoryArrayValues),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
  phone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<Businesses>;

export const addBusiness = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/business/add`, {
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