import { schema, OutputType } from "./list_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const input = schema.parse(queryParams);

    let query = db.selectFrom('notifications')
      .innerJoin('businesses', 'notifications.businessId', 'businesses.id')
      .select([
        'notifications.id',
        'notifications.userId',
        'notifications.businessId',
        'notifications.reviewId',
        'notifications.type',
        'notifications.message',
        'notifications.isRead',
        'notifications.createdAt',
        'businesses.name as businessName'
      ])
      .where('notifications.userId', '=', user.id);

    if (input.unreadOnly) {
      query = query.where('notifications.isRead', '=', false);
    }

    const notifications = await query
      .orderBy('notifications.createdAt', 'desc')
      .execute();

    // Get unread count separately to always show badge count correctly
    const unreadCountResult = await db.selectFrom('notifications')
      .where('userId', '=', user.id)
      .where('isRead', '=', false)
      .select(db.fn.count('id').as('count'))
      .executeTakeFirst();
    
    const unreadCount = Number(unreadCountResult?.count || 0);

    return new Response(superjson.stringify({ notifications, unreadCount } satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}