import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { Businesses, BusinessCategoryArrayValues } from "../../helpers/schema";

export const schema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  category: z.enum(BusinessCategoryArrayValues).optional().default('other'),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
    business: Selectable<Businesses> | null;
    riskLevel: "low" | "medium" | "high";
    duplicateWarning?: string;
    blocked: boolean;
};

export const quickAddBusiness = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/business/quick-add`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
      // Even in error cases (like 409 conflict for duplicate), we try to parse the structured error response
      // if it matches our output type structure (which contains error info fields)
      try {
        const errorData = superjson.parse<OutputType>(await result.text());
        return errorData;
      } catch (e) {
          // If response isn't structured JSON, throw generic error
          throw new Error(`Request failed with status ${result.status}`);
      }
  }
  
  return superjson.parse<OutputType>(await result.text());
};