import { schema, OutputType } from "./recent_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const input = schema.parse(queryParams);

    let query = db.selectFrom('reviews')
      .innerJoin('businesses', 'reviews.businessId', 'businesses.id')
      .select([
        'reviews.id',
        'reviews.businessId',
        'businesses.name as businessName',
        'reviews.reviewerName',
        'reviews.rating',
        'reviews.content',
        'reviews.sentiment',
        'reviews.createdAt'
      ])
      .orderBy('reviews.createdAt', 'desc')
      .limit(input.limit);

    if (input.sentiment) {
      query = query.where('reviews.sentiment', '=', input.sentiment);
    }

    const reviews = await query.execute();

    return new Response(superjson.stringify({ reviews } satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}