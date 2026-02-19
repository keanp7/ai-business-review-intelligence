import { z } from "zod";
import superjson from 'superjson';
import { ClaimVerificationStatus, ProofType } from "../../../helpers/schema";

export const schema = z.object({
  businessId: z.coerce.number(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  claim: {
    id: number;
    businessId: number;
    userId: number;
    ownerName: string;
    ownerEmail: string;
    proofType: ProofType;
    proofDescription: string;
    verificationStatus: ClaimVerificationStatus;
    adminNotes: string | null;
    createdAt: string;
    updatedAt: string;
    documents: Array<{
      id: number;
      fileName: string;
      fileType: string;
      fileSize: number;
      createdAt: string;
    }>;
  } | null;
};

export const getClaimStatus = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const url = new URL("/_api/business/claim/status", "http://dummy.com");
  url.searchParams.set("businessId", params.businessId.toString());

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