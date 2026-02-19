import { schema, OutputType } from "./add_POST.schema";
import superjson from 'superjson';
import { db } from "../../../helpers/db";
import { ReviewSentiment } from "../../../helpers/schema";

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // 1. Analyze sentiment using Gemini
    let sentiment: ReviewSentiment = "neutral";
    
    if (process.env.GOOGLE_GEMINI_API_KEY) {
      try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ 
                text: "You are a sentiment analysis expert. Analyze the following review content and determine if the sentiment is 'positive', 'negative', 'neutral', or 'mixed'. Return ONLY the single word sentiment.\n\nReview: " + input.content 
              }]
            }]
          })
        });

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          const content = data.candidates[0]?.content?.parts[0]?.text?.trim().toLowerCase();
          if (["positive", "negative", "neutral", "mixed"].includes(content)) {
            sentiment = content as ReviewSentiment;
          }
        } else {
            console.error("Gemini API error:", await geminiResponse.text());
        }
      } catch (e) {
        console.error("Failed to analyze sentiment:", e);
        // Fallback to neutral if AI fails, don't block the review submission
      }
    } else {
        console.warn("GOOGLE_GEMINI_API_KEY is not set, skipping sentiment analysis.");
    }

    // 2. Insert review and update business stats in a transaction
    const result = await db.transaction().execute(async (trx) => {
      const newReview = await trx.insertInto('reviews')
        .values({
          businessId: input.businessId,
          reviewerName: input.reviewerName || 'Anonymous',
          rating: input.rating,
          content: input.content,
          sentiment: sentiment,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      // Recalculate average rating and total reviews
      // We do this by querying the table to ensure accuracy
      const stats = await trx.selectFrom('reviews')
        .where('businessId', '=', input.businessId)
        .select((eb) => [
          eb.fn.count<number>('id').as('totalReviews'),
          eb.fn.avg<number>('rating').as('averageRating')
        ])
        .executeTakeFirst();

      if (stats) {
        await trx.updateTable('businesses')
          .set({
            totalReviews: stats.totalReviews,
            averageRating: stats.averageRating,
            updatedAt: new Date()
          })
          .where('id', '=', input.businessId)
          .execute();
      }

      // Check if this is a bad review and notify the business owner if claimed
      const isBadReview = input.rating <= 2 || sentiment === 'negative';
      if (isBadReview) {
        const business = await trx.selectFrom('businesses')
          .select(['claimedByUserId', 'name'])
          .where('id', '=', input.businessId)
          .executeTakeFirst();

        if (business && business.claimedByUserId !== null) {
          await trx.insertInto('notifications')
            .values({
              userId: business.claimedByUserId,
              businessId: input.businessId,
              reviewId: newReview.id,
              type: 'bad_review',
              message: `A negative review (${input.rating}/5 stars) was posted on your business "${business.name}" by ${input.reviewerName || 'Anonymous'}.`,
              isRead: false
            })
            .execute();
          
          console.log(`Notification created for bad review on business ${input.businessId} for user ${business.claimedByUserId}`);
        }
      }

      return newReview;
    });

    return new Response(superjson.stringify(result satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}