import { z } from "zod";
import superjson from 'superjson';
import { Selectable } from "kysely";
import { Notifications } from "../../helpers/schema";

export const schema = z.object({
  unreadOnly: z.coerce.boolean().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  notifications: (Selectable<Notifications> & { businessName: string })[];
  unreadCount: number;
};

export const getNotifications = async (params: InputType = {}, init?: RequestInit): Promise<OutputType> => {
  const url = new URL("/_api/notifications/list", "http://dummy.com");
  if (params.unreadOnly !== undefined) url.searchParams.set("unreadOnly", params.unreadOnly.toString());

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