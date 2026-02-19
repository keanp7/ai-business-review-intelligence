import { z } from "zod";
import superjson from 'superjson';
import { ClaimAuditAction } from "../../../helpers/schema";

export const schema = z.object({
  claimId: z.coerce.number(),
});

export type InputType = z.infer<typeof schema>;

export type AuditLogEntry = {
  id: number;
  claimId: number;
  actorId: number;
  actorName: string;
  action: ClaimAuditAction;
  oldValue: string | null;
  newValue: string | null;
  details: string | null;
  createdAt: Date;
};

export type OutputType = {
  logs: AuditLogEntry[];
};

export const getClaimAuditLog = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const url = new URL("/_api/admin/claims/audit-log", "http://dummy.com");
  url.searchParams.set("claimId", params.claimId.toString());

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