import { z } from "zod";
import superjson from 'superjson';
import { ClaimVerificationStatus, ProofTypeArrayValues } from "../../helpers/schema";

export const schema = z.object({
  businessId: z.number(),
  ownerName: z.string().min(1, "Owner name is required").optional(),
  ownerEmail: z.string().email("Valid email is required").optional(),
  proofType: z.enum(ProofTypeArrayValues).optional().default('email_verification'),
  proofDescription: z.string().optional().default('Auto-claimed via email match'),
  documents: z.array(z.object({
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    fileData: z.string(), // base64 encoded
  })).optional().default([]),
});

export type InputType = z.input<typeof schema>;

export type OutputType = {
  claimId: number;
  verificationStatus: ClaimVerificationStatus;
  verificationTier: 'basic_verified';
  message: string;
};

export const claimBusiness = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/business/claim`, {
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