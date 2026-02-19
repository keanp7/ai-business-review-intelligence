import { schema, OutputType } from "./moderate_POST.schema";
import superjson from 'superjson';
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { BusinessStatus, NotificationType, VisibilityStatus } from "../../../helpers/schema";
import { resendEmail } from "../../../helpers/resendEmail";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== 'admin') {
      return new Response(superjson.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Fetch current business to check ownership status
    const currentBusiness = await db.selectFrom('businesses')
      .selectAll()
      .where('id', '=', input.businessId)
      .executeTakeFirst();

    if (!currentBusiness) {
      return new Response(superjson.stringify({ error: "Business not found" }), { status: 404 });
    }

    let updatedBusiness;

    if (input.action === 'approve') {
      // Approve: Make visible and approved
      updatedBusiness = await db
        .updateTable('businesses')
        .set({ 
          visibilityStatus: 'published' as VisibilityStatus,
          status: 'approved' as BusinessStatus
        })
        .where('id', '=', input.businessId)
        .returningAll()
        .executeTakeFirst();
    } else if (input.action === 'reject') {
      // Reject: Hide and mark as rejected
      updatedBusiness = await db
        .updateTable('businesses')
        .set({ 
          visibilityStatus: 'hidden' as VisibilityStatus,
          status: 'rejected' as BusinessStatus
        })
        .where('id', '=', input.businessId)
        .returningAll()
        .executeTakeFirst();
    } else if (input.action === 'verify_owner') {
      // Verify owner: Only if already claimed
      if (currentBusiness.ownershipStatus !== 'claimed') {
        return new Response(
          superjson.stringify({ error: "Business must be claimed before it can be verified" }), 
          { status: 400 }
        );
      }

      updatedBusiness = await db
        .updateTable('businesses')
        .set({ 
          ownershipStatus: 'verified',
          isClaimed: true
        })
        .where('id', '=', input.businessId)
        .returningAll()
        .executeTakeFirst();
    }

    if (!updatedBusiness) {
      return new Response(superjson.stringify({ error: "Failed to update business" }), { status: 500 });
    }

    // Find the user who owns/claimed this business
    let ownerId: number | null = null;
    
    const claim = await db
      .selectFrom('businessClaims')
      .select('userId')
      .where('businessId', '=', input.businessId)
      .executeTakeFirst();
    
    if (claim) {
      ownerId = claim.userId;
    } else if (updatedBusiness.claimedByUserId) {
      ownerId = updatedBusiness.claimedByUserId;
    }

    // Create notification if we found an owner and it's approve/reject action
    if (ownerId && (input.action === 'approve' || input.action === 'reject')) {
      const notificationType: NotificationType = input.action === 'approve' ? 'claim_approved' : 'claim_rejected';
      const message = input.action === 'approve' 
        ? `Your business ${updatedBusiness.name} has been approved and is now listed on TrueLency!`
        : `Your business ${updatedBusiness.name} has been rejected. Please contact support for more information.`;

      await db
        .insertInto('notifications')
        .values({
          userId: ownerId,
          businessId: input.businessId,
          type: notificationType,
          message: message,
          isRead: false,
        })
        .execute();

      console.log(`Created ${notificationType} notification for user ${ownerId} and business ${input.businessId}`);

      // Send email notification to business owner
      const ownerUser = await db.selectFrom('users')
        .select(['email', 'displayName'])
        .where('id', '=', ownerId)
        .executeTakeFirst();

      if (ownerUser) {
        if (input.action === 'approve') {
          resendEmail.sendClaimApprovedEmail({
            userEmail: ownerUser.email,
            userName: ownerUser.displayName,
            businessName: updatedBusiness.name,
          });
        } else {
          resendEmail.sendClaimRejectedEmail({
            userEmail: ownerUser.email,
            userName: ownerUser.displayName,
            businessName: updatedBusiness.name,
            reason: 'Your business listing did not meet our verification criteria.',
          });
        }
      }
    } else if (input.action === 'verify_owner' && ownerId) {
      // Notification for owner verification
      await db
        .insertInto('notifications')
        .values({
          userId: ownerId,
          businessId: input.businessId,
          type: 'claim_approved',
          message: `Your ownership of ${updatedBusiness.name} has been verified!`,
          isRead: false,
        })
        .execute();

      console.log(`Created owner verification notification for user ${ownerId} and business ${input.businessId}`);
    } else if (!ownerId && input.action !== 'verify_owner') {
      console.log(`No owner found for business ${input.businessId}, skipping notification`);
    }

    return new Response(superjson.stringify({ 
      success: true, 
      business: updatedBusiness 
    } satisfies OutputType));

  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}