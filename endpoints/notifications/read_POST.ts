import { schema, OutputType } from "./read_POST.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    if (input.markAllRead) {
      await db.updateTable('notifications')
        .set({ isRead: true })
        .where('userId', '=', user.id)
        .execute();
    } else if (input.notificationId) {
      await db.updateTable('notifications')
        .set({ isRead: true })
        .where('id', '=', input.notificationId)
        .where('userId', '=', user.id) // Ensure user owns the notification
        .execute();
    }

    return new Response(superjson.stringify({ success: true } satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}