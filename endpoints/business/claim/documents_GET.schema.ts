import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  documentId: z.coerce.number(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  fileName: string;
  fileType: string;
  signedUrl: string;
};

export const getClaimDocument = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const url = new URL("/_api/business/claim/documents", "http://dummy.com");
  url.searchParams.set("documentId", params.documentId.toString());

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