import { schema, OutputType } from "./businesses_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { sql } from "kysely";

export async function handle(request: Request) {
  try {
    // 1. Auth check
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

    // 2. Build query
    let query = db.selectFrom('businesses').selectAll();
    let countQuery = db.selectFrom('businesses').select(db.fn.count('id').as('total'));

    if (input.search) {
      const searchPattern = `%${input.search}%`;
      query = query.where('name', 'ilike', searchPattern);
      countQuery = countQuery.where('name', 'ilike', searchPattern);
    }

    if (input.status) {
      query = query.where('status', '=', input.status);
      countQuery = countQuery.where('status', '=', input.status);
    }

    if (input.visibilityStatus) {
      query = query.where('visibilityStatus', '=', input.visibilityStatus);
      countQuery = countQuery.where('visibilityStatus', '=', input.visibilityStatus);
    }

    if (input.ownershipStatus) {
      query = query.where('ownershipStatus', '=', input.ownershipStatus);
      countQuery = countQuery.where('ownershipStatus', '=', input.ownershipStatus);
    }

    // 3. Execute queries
    const businesses = await query
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    const totalResult = await countQuery.executeTakeFirst();
    const total = Number(totalResult?.total || 0);

    return new Response(superjson.stringify({ businesses, total } satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}