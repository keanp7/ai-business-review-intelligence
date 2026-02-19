import { schema, OutputType } from "./delete_POST.schema";
import superjson from 'superjson';
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== 'admin') {
      return new Response(superjson.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    await db.transaction().execute(async (trx) => {
      // 1. Delete all notifications related to this business
      await trx.deleteFrom('notifications')
        .where('businessId', '=', input.businessId)
        .execute();

      // 2. Delete all reviews related to this business
      await trx.deleteFrom('reviews')
        .where('businessId', '=', input.businessId)
        .execute();

      // 3. Delete the business itself
      const result = await trx.deleteFrom('businesses')
        .where('id', '=', input.businessId)
        .executeTakeFirst();
      
      if (Number(result.numDeletedRows) === 0) {
        throw new Error("Business not found");
      }
    });

    return new Response(superjson.stringify({ success: true } satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}