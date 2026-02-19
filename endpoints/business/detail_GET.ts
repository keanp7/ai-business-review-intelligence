import { schema, OutputType } from "./detail_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const input = schema.parse(queryParams);

    const business = await db.selectFrom('businesses')
      .selectAll()
      .where('id', '=', input.id)
      .executeTakeFirst();

    if (!business) {
      return new Response(superjson.stringify({ error: "Business not found" }), { status: 404 });
    }

    // Add visibility flag for UI messaging
    const response = {
      ...business,
      isPubliclyVisible: business.visibilityStatus === 'published'
    };

    return new Response(superjson.stringify(response satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}