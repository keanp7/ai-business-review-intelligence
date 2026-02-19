import { schema, OutputType } from "./review_POST.schema";
import superjson from 'superjson';
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { ClaimVerificationStatus } from "../../../helpers/schema";
import { resendEmail } from "../../../helpers/resendEmail";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== 'admin') {
      return new Response(superjson.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Fetch current claim to get old status and business details
    const currentClaim = await db.selectFrom('businessClaims')
      .innerJoin('businesses', 'businessClaims.businessId', 'businesses.id')
      .select(['businessClaims.verificationStatus', 'businessClaims.userId', 'businessClaims.businessId', 'businesses.name as businessName'])
      .where('businessClaims.id', '=', input.claimId)
      .executeTakeFirst();

    if (!currentClaim) {
      return new Response(superjson.stringify({ error: "Claim not found" }), { status: 404 });
    }

    const newStatus: ClaimVerificationStatus = input.action === 'approve' ? 'verified' : 'rejected';
    const oldStatus = currentClaim.verificationStatus;

    // Fetch the claim owner's details for email notification
    const claimOwner = await db.selectFrom('users')
      .select(['email', 'displayName'])
      .where('id', '=', currentClaim.userId)
      .executeTakeFirst();

    // Use a transaction to ensure all updates happen atomically
    await db.transaction().execute(async (trx) => {
      // 1. Update claim status
      await trx.updateTable('businessClaims')
        .set({ 
          verificationStatus: newStatus,
          adminNotes: input.adminNotes || null,
          updatedAt: new Date()
        })
        .where('id', '=', input.claimId)
        .execute();

      // 2. If approved, update business
      if (input.action === 'approve') {
        await trx.updateTable('businesses')
          .set({
            isClaimed: true,
            claimedByUserId: currentClaim.userId,
            ownershipStatus: 'claimed', // Set to claimed (not verified - only admins can verify)
            status: 'approved', // Automatically approve business if claim is verified
            updatedAt: new Date()
          })
          .where('id', '=', currentClaim.businessId)
          .execute();
      }

      // 3. Create audit log
      await trx.insertInto('claimAuditLog')
        .values({
          claimId: input.claimId,
          actorId: user.id,
          action: input.action === 'approve' ? 'claim_approved' : 'claim_rejected',
          oldValue: oldStatus,
          newValue: newStatus,
          details: input.adminNotes || null,
          createdAt: new Date() // Explicitly set if database default is missing/unreliable, though schema has Generated<Timestamp>
        })
        .execute();

      // 4. Create notification
      const message = input.action === 'approve'
        ? `Your claim for ${currentClaim.businessName} has been approved! You are now the verified owner.`
        : `Your claim for ${currentClaim.businessName} has been rejected. Reason: ${input.adminNotes || 'No reason provided'}`;

      await trx.insertInto('notifications')
        .values({
          userId: currentClaim.userId,
          businessId: currentClaim.businessId,
          type: input.action === 'approve' ? 'claim_approved' : 'claim_rejected',
          message: message,
          isRead: false,
          createdAt: new Date()
        })
        .execute();
    });

    // Send email notification to claim owner (fire-and-forget)
    if (claimOwner) {
      if (input.action === 'approve') {
        resendEmail.sendClaimApprovedEmail({
          userEmail: claimOwner.email,
          userName: claimOwner.displayName,
          businessName: currentClaim.businessName,
        });
      } else {
        resendEmail.sendClaimRejectedEmail({
          userEmail: claimOwner.email,
          userName: claimOwner.displayName,
          businessName: currentClaim.businessName,
          reason: input.adminNotes || 'No specific reason provided',
        });
      }
    }

    return new Response(superjson.stringify({ success: true } satisfies OutputType));

  } catch (error) {
    if (error instanceof Error && error.name === 'NotAuthenticatedError') {
      return new Response(superjson.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}