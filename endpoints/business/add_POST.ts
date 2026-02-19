import { schema, OutputType } from "./add_POST.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";
import { detectSubmissionRisks } from "../../helpers/businessSafety";
import { getServerUserSession } from "../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Try to get session (optional - don't require it)
    let userId: number | null = null;
    try {
      const { user } = await getServerUserSession(request);
      userId = user.id;
      console.log(`Business submission by authenticated user: ${user.email}`);
    } catch (error) {
      console.log('Business submission by unauthenticated user');
    }

    // Run risk detection
    const riskCheck = detectSubmissionRisks(
      input.name,
      input.description,
      input.website,
      input.phone
    );

    // Check for duplicate businesses using ILIKE
    const duplicateCheck = await db.selectFrom('businesses')
      .selectAll()
      .where('name', 'ilike', input.name)
      .executeTakeFirst();

    if (duplicateCheck) {
      riskCheck.flags.push(`Exact duplicate found: ${duplicateCheck.name}`);
      riskCheck.riskLevel = 'high';
    }

    // Check for recent similar submissions (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentSimilar = await db.selectFrom('businesses')
      .selectAll()
      .where('name', 'ilike', `%${input.name}%`)
      .where('createdAt', '>', fiveMinutesAgo)
      .executeTakeFirst();

    if (recentSimilar) {
      riskCheck.flags.push('Recent similar submission detected');
      if (riskCheck.riskLevel === 'low') {
        riskCheck.riskLevel = 'medium';
      }
    }

    // Determine status fields based on risk level
    // Update: All submissions now require manual review
    const visibilityStatus: 'published' | 'pending_review' = 'pending_review';
    const status: 'approved' | 'pending' = 'pending';
    const ownershipStatus = 'unclaimed';
    
    // Determine listing source based on authentication
    // If authenticated, we assume they are the owner (or at least claiming to be adding it directly)
    // If unauthenticated, it's a community submission
    const listingSource = userId ? 'owner' : 'community';

    console.log(`Business submission requiring review. Risk: ${riskCheck.riskLevel}, Flags: ${riskCheck.flags.join(', ')}`);

    const newBusiness = await db.insertInto('businesses')
      .values({
        name: input.name,
        description: input.description ?? null,
        category: input.category,
        website: input.website ?? null,
        location: input.location ?? null,
        phone: input.phone ?? null,
        contactEmail: input.contactEmail ?? null,
        addedByUserId: userId,
        listingSource,
        status,
        visibilityStatus,
        ownershipStatus,
        averageRating: 0,
        totalReviews: 0,
        isClaimed: false,
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // Create admin notification (always needed now since all submissions are pending review)
    // Find all admin users
    const admins = await db.selectFrom('users')
      .select(['id'])
      .where('role', '=', 'admin')
      .execute();

    // Create notifications for each admin
    for (const admin of admins) {
      await db.insertInto('notifications')
        .values({
          userId: admin.id,
          businessId: newBusiness.id,
          type: 'new_review',
          message: `New business submission requires review: ${newBusiness.name}. Risk flags: ${riskCheck.flags.join(', ')}`,
          isRead: false,
        })
        .execute();
    }

    console.log(`Created admin notifications for business ${newBusiness.id}`);

    return new Response(superjson.stringify(newBusiness satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}