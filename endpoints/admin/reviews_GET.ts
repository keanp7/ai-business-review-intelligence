import { schema, OutputType } from "./reviews_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== 'admin') {
      return new Response(superjson.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const input = schema.parse(queryParams);

    const page = input.page || 1;
    const limit = input.limit || 10;
    const offset = (page - 1) * limit;

    let query = db.selectFrom('reviews')
      .innerJoin('businesses', 'reviews.businessId', 'businesses.id')
      .select([
        'reviews.id',
        'reviews.businessId',
        'reviews.content',
        'reviews.rating',
        'reviews.reviewerName',
        'reviews.sentiment',
        'reviews.createdAt',
        'businesses.name as businessName'
      ]);

    let countQuery = db.selectFrom('reviews')
      .innerJoin('businesses', 'reviews.businessId', 'businesses.id')
      .select(db.fn.count('reviews.id').as('total'));

    if (input.sentiment) {
      query = query.where('reviews.sentiment', '=', input.sentiment);
      countQuery = countQuery.where('reviews.sentiment', '=', input.sentiment);
    }

    if (input.businessId) {
      query = query.where('reviews.businessId', '=', input.businessId);
      countQuery = countQuery.where('reviews.businessId', '=', input.businessId);
    }

    const reviews = await query
      .orderBy('reviews.createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    const totalResult = await countQuery.executeTakeFirst();
    const total = Number(totalResult?.total || 0);

    return new Response(superjson.stringify({ reviews, total } satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}