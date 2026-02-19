import { z } from "zod";
import superjson from 'superjson';
import { ClaimVerificationStatus, ClaimVerificationStatusArrayValues, ProofType } from "../../../helpers/schema";

export const schema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  verificationStatus: z.enum(ClaimVerificationStatusArrayValues).optional(),
});

export type InputType = z.infer<typeof schema>;

export type ClaimWithDetails = {
  id: number;
  businessId: number;
  businessName: string;
  userId: number;
  userDisplayName: string;
  userEmail: string;
  ownerName: string;
  ownerEmail: string;
  proofType: ProofType;
  proofDescription: string;
  verificationStatus: ClaimVerificationStatus;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  documentCount: number;
  documents: Array<{
    id: number;
    claimId: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    storagePath: string;
    createdAt: Date;
  }>;
};

export type OutputType = {
  claims: ClaimWithDetails[];
  total: number;
};

export const getAdminClaimsList = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const url = new URL("/_api/admin/claims/list", "http://dummy.com");
  if (params.page) url.searchParams.set("page", params.page.toString());
  if (params.limit) url.searchParams.set("limit", params.limit.toString());
  if (params.verificationStatus) url.searchParams.set("verificationStatus", params.verificationStatus);

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