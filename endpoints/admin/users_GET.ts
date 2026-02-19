import { schema, OutputType } from "./users_GET.schema";
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

    let query = db.selectFrom('users')
      .select(['id', 'displayName', 'email', 'role', 'createdAt']);
    
    let countQuery = db.selectFrom('users')
      .select(db.fn.count('id').as('total'));

    if (input.search) {
      const searchPattern = `%${input.search}%`;
      query = query.where((eb) => eb.or([
        eb('displayName', 'ilike', searchPattern),
        eb('email', 'ilike', searchPattern)
      ]));
      countQuery = countQuery.where((eb) => eb.or([
        eb('displayName', 'ilike', searchPattern),
        eb('email', 'ilike', searchPattern)
      ]));
    }

    const users = await query
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    const totalResult = await countQuery.executeTakeFirst();
    const total = Number(totalResult?.total || 0);

    return new Response(superjson.stringify({ users, total } satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}