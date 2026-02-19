import { schema, OutputType } from "./search_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";
import { sql } from "kysely";

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    // Validate input
    const input = schema.parse(queryParams);

    let query = db.selectFrom('businesses')
      .selectAll()
      .where('visibilityStatus', '=', 'published');

    if (input.q) {
      // Use PostgreSQL full-text search
      // We use plainto_tsquery to handle spaces and special characters gracefully
      query = query.where(
        sql`to_tsvector('english', name)`,
        '@@',
        sql`plainto_tsquery('english', ${input.q})`
      );
    }

    if (input.category) {
      query = query.where('category', '=', input.category);
    }

    // Order by relevance if searching, otherwise by name
    if (input.q) {
       query = query.orderBy(
        sql`ts_rank(to_tsvector('english', name), plainto_tsquery('english', ${input.q}))`,
        'desc'
      );
    } else {
      query = query.orderBy('name', 'asc');
    }

    const results = await query.execute();

    // If full-text search returned no results and we have a query, fall back to ILIKE
    if (results.length === 0 && input.q) {
      console.log(`Full-text search returned no results for query "${input.q}", falling back to ILIKE search`);
      
      let fallbackQuery = db.selectFrom('businesses')
        .selectAll()
        .where('visibilityStatus', '=', 'published')
        .where('name', 'ilike', `%${input.q}%`);

      if (input.category) {
        fallbackQuery = fallbackQuery.where('category', '=', input.category);
      }

      fallbackQuery = fallbackQuery.orderBy('name', 'asc');

      const fallbackResults = await fallbackQuery.execute();
      return new Response(superjson.stringify(fallbackResults satisfies OutputType));
    }

    return new Response(superjson.stringify(results satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}