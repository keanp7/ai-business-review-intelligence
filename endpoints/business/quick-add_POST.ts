import { schema, OutputType } from "./quick-add_POST.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";
import { checkSafety, detectSubmissionRisks } from "../../helpers/businessSafety";

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // 1. Enhanced Risk Detection
    const riskCheck = detectSubmissionRisks(input.name);
    
    // 2. Keyword Safety Check
    const safetyCheck = checkSafety(input.name);
    if (safetyCheck.riskLevel === 'high') {
        return new Response(superjson.stringify({
            business: null,
            riskLevel: 'high',
            blocked: true,
            duplicateWarning: "Name contains unsafe keywords."
        } satisfies OutputType), { status: 400 }); 
    }

    // 3. Check for exact duplicates
    const exactMatch = await db.selectFrom('businesses')
        .selectAll()
        .where('name', 'ilike', input.name)
        .executeTakeFirst();

    if (exactMatch) {
         return new Response(superjson.stringify({
            business: exactMatch,
            riskLevel: 'high',
            blocked: true,
            duplicateWarning: `Business already exists: ${exactMatch.name}`
        } satisfies OutputType), { status: 409 });
    }

    // 4. Check for recent similar submissions (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentSimilar = await db.selectFrom('businesses')
        .selectAll()
        .where('name', 'ilike', `%${input.name}%`)
        .where('createdAt', '>', fiveMinutesAgo)
        .executeTakeFirst();

    if (recentSimilar) {
        riskCheck.flags.push('Rapid submission detected');
        if (riskCheck.riskLevel === 'low') {
            riskCheck.riskLevel = 'medium';
        }
    }

    // 5. Check for potential fuzzy duplicates
    const potentialDuplicates = await db.selectFrom('businesses')
        .selectAll()
        .where((eb) => eb.or([
            eb('name', 'ilike', `%${input.name}%`),
            eb('name', 'ilike', input.name)
        ]))
        .limit(5)
        .execute();

    let finalRiskLevel: 'low' | 'medium' | 'high' = riskCheck.riskLevel;
    let duplicateWarning: string | undefined = undefined;

    if (potentialDuplicates.length > 0) {
        if (finalRiskLevel === 'low') {
            finalRiskLevel = 'medium';
        }
        duplicateWarning = `Possible duplicate found: ${potentialDuplicates[0].name}`;
    }

    // 6. Determine status fields
    // Update: All submissions now require manual review regardless of risk level
    const visibilityStatus: 'published' | 'pending_review' = 'pending_review';
    const status: 'approved' | 'pending' = 'pending';
    const ownershipStatus = 'unclaimed';

    // 7. Create Business
    const newBusiness = await db.insertInto('businesses')
      .values({
        name: input.name,
        category: input.category ?? 'other',
        status,
        visibilityStatus,
        ownershipStatus,
        averageRating: 0,
        totalReviews: 0,
        isClaimed: false,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // 8. Create admin notifications (always needed now)
    const admins = await db.selectFrom('users')
        .select(['id'])
        .where('role', '=', 'admin')
        .execute();

    for (const admin of admins) {
        await db.insertInto('notifications')
            .values({
                userId: admin.id,
                businessId: newBusiness.id,
                type: 'new_review',
                message: `Quick-add business requires review: ${newBusiness.name}. Flags: ${riskCheck.flags.join(', ')}`,
                isRead: false,
            })
            .execute();
    }

    console.log(`Created admin notifications for quick-add business ${newBusiness.id}`);

    return new Response(superjson.stringify({
        business: newBusiness,
        riskLevel: finalRiskLevel,
        blocked: false,
        duplicateWarning
    } satisfies OutputType));

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(superjson.stringify({ 
        business: null,
        riskLevel: 'high', 
        blocked: true, 
        duplicateWarning: message 
    } satisfies OutputType), { status: 400 });
  }
}