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
      // 1. Get the review to find businessId before deleting
      const review = await trx.selectFrom('reviews')
        .select('businessId')
        .where('id', '=', input.reviewId)
        .executeTakeFirst();

      if (!review) {
        throw new Error("Review not found");
      }

      // 2. Delete the review
      await trx.deleteFrom('reviews')
        .where('id', '=', input.reviewId)
        .execute();

      // 3. Recalculate stats for the business
      const stats = await trx.selectFrom('reviews')
        .where('businessId', '=', review.businessId)
        .select((eb) => [
          eb.fn.count<number>('id').as('totalReviews'),
          eb.fn.avg<number>('rating').as('averageRating')
        ])
        .executeTakeFirst();

      // 4. Update business stats
      await trx.updateTable('businesses')
        .set({
          totalReviews: stats?.totalReviews || 0,
          averageRating: stats?.averageRating || 0,
          updatedAt: new Date()
        })
        .where('id', '=', review.businessId)
        .execute();
    });

    return new Response(superjson.stringify({ success: true } satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}