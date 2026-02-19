import { OutputType } from "./analytics_GET.schema";
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

    // Define time windows
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Execute queries in parallel for performance
    const [
      totalUsersResult,
      totalBusinessesResult,
      totalReviewsResult,
      businessesByStatusResult,
      reviewsBySentimentResult,
      recentActivityResult,
      avgRatingResult,
      newUsersResult
    ] = await Promise.all([
      // 1. Total users count
      db.selectFrom('users')
        .select(db.fn.count('id').as('count'))
        .executeTakeFirst(),

      // 2. Total businesses count
      db.selectFrom('businesses')
        .select(db.fn.count('id').as('count'))
        .executeTakeFirst(),

      // 3. Total reviews count
      db.selectFrom('reviews')
        .select(db.fn.count('id').as('count'))
        .executeTakeFirst(),

      // 4. Businesses by status
      db.selectFrom('businesses')
        .select(['status', db.fn.count('id').as('count')])
        .groupBy('status')
        .execute(),

      // 5. Reviews by sentiment
      db.selectFrom('reviews')
        .select(['sentiment', db.fn.count('id').as('count')])
        .groupBy('sentiment')
        .execute(),

      // 6. Recent activity (last 7 days)
      db.selectFrom('businesses')
        .select(db.fn.count('id').as('count'))
        .where('createdAt', '>=', sevenDaysAgo)
        .executeTakeFirst()
        .then(async (bizRes) => {
          const reviewRes = await db.selectFrom('reviews')
            .select(db.fn.count('id').as('count'))
            .where('createdAt', '>=', sevenDaysAgo)
            .executeTakeFirst();
          return {
            recentBusinesses: bizRes?.count ?? 0,
            recentReviews: reviewRes?.count ?? 0
          };
        }),

      // 7. Average rating across all businesses (using reviews table for raw average)
      db.selectFrom('reviews')
        .select(db.fn.avg('rating').as('average'))
        .executeTakeFirst(),

      // 8. New users in last 30 days
      db.selectFrom('users')
        .select(db.fn.count('id').as('count'))
        .where('createdAt', '>=', thirtyDaysAgo)
        .executeTakeFirst(),
    ]);

    // Format results
    const businessesByStatus = {
      pending: 0,
      approved: 0,
      rejected: 0
    };
    businessesByStatusResult.forEach(row => {
      if (row.status === 'pending') businessesByStatus.pending = Number(row.count);
      if (row.status === 'approved') businessesByStatus.approved = Number(row.count);
      if (row.status === 'rejected') businessesByStatus.rejected = Number(row.count);
    });

    const reviewsBySentiment = {
      positive: 0,
      negative: 0,
      neutral: 0,
      mixed: 0
    };
    reviewsBySentimentResult.forEach(row => {
      if (row.sentiment === 'positive') reviewsBySentiment.positive = Number(row.count);
      if (row.sentiment === 'negative') reviewsBySentiment.negative = Number(row.count);
      if (row.sentiment === 'neutral') reviewsBySentiment.neutral = Number(row.count);
      if (row.sentiment === 'mixed') reviewsBySentiment.mixed = Number(row.count);
    });

    const response: OutputType = {
      totalUsers: Number(totalUsersResult?.count ?? 0),
      totalBusinesses: Number(totalBusinessesResult?.count ?? 0),
      totalReviews: Number(totalReviewsResult?.count ?? 0),
      businessesByStatus,
      reviewsBySentiment,
      recentBusinesses: Number(recentActivityResult.recentBusinesses),
      recentReviews: Number(recentActivityResult.recentReviews),
      averageRating: Number(avgRatingResult?.average ?? 0),
      newUsersLast30Days: Number(newUsersResult?.count ?? 0)
    };

    return new Response(superjson.stringify(response), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Analytics error:", error);
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}