import { schema, OutputType } from "./reviews_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const input = schema.parse(queryParams);

    const reviews = await db.selectFrom('reviews')
      .selectAll()
      .where('businessId', '=', input.businessId)
      .orderBy('createdAt', 'desc')
      .execute();

    return new Response(superjson.stringify(reviews satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}