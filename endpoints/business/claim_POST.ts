import { schema, OutputType } from "./claim_POST.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { supabaseStorage } from "../../helpers/supabaseStorage";
import { nanoid } from "nanoid";
import { ClaimAuditAction, NotificationType } from "../../helpers/schema";
import { resendEmail } from "../../helpers/resendEmail";

export async function handle(request: Request) {
  try {
    // Authenticate user
    const { user } = await getServerUserSession(request);

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Use fallback values from user session if not provided
    const ownerName = input.ownerName ?? user.displayName;
    const ownerEmail = input.ownerEmail ?? user.email;

    // Check if business exists
    const business = await db.selectFrom('businesses')
      .select(['id', 'isClaimed', 'name', 'claimedByUserId'])
      .where('id', '=', input.businessId)
      .executeTakeFirst();

    if (!business) {
      return new Response(superjson.stringify({ error: "Business not found" }), { status: 404 });
    }

    // Check if business is already claimed by someone else
    if (business.isClaimed && business.claimedByUserId !== user.id) {
      return new Response(superjson.stringify({ 
        error: "This business is already managed by another owner. If you believe this is an error, please contact support to dispute." 
      }), { status: 400 });
    }

    // Check if user already has a claim for this business
    const existingClaim = await db.selectFrom('businessClaims')
      .select(['id', 'verificationStatus'])
      .where('businessId', '=', input.businessId)
      .where('userId', '=', user.id)
      .executeTakeFirst();

    if (existingClaim) {
      // If already verified, just return success
      if (existingClaim.verificationStatus === 'verified') {
        const result: OutputType = {
          claimId: existingClaim.id,
          verificationStatus: 'verified',
          verificationTier: 'basic_verified',
          message: "You now have owner access to this business.",
        };
        return new Response(superjson.stringify(result));
      }
      return new Response(superjson.stringify({ error: "You already have a pending claim for this business" }), { status: 400 });
    }

    // Insert claim into business_claims table with verified status
    const claim = await db.insertInto('businessClaims')
      .values({
        businessId: input.businessId,
        userId: user.id,
        ownerName: ownerName,
        ownerEmail: ownerEmail,
        proofType: input.proofType,
        proofDescription: input.proofDescription,
        verificationStatus: 'verified',
        adminNotes: null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // Upload documents to Supabase Storage if provided
    if (input.documents && input.documents.length > 0) {
      for (const doc of input.documents) {
        // Generate unique storage path to prevent filename collisions
        const storagePath = `claims/${claim.id}/${nanoid()}_${doc.fileName}`;
        
        // Upload to Supabase Storage
        await supabaseStorage.uploadFile(storagePath, doc.fileData, doc.fileType);
        
        // Store metadata with storage path in database
        await db.insertInto('claimDocuments')
          .values({
            claimId: claim.id,
            fileName: doc.fileName,
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            storagePath: storagePath,
          })
          .execute();
      }
    }

    // Update business record to mark as claimed
    await db.updateTable('businesses')
      .set({
        isClaimed: true,
        claimedByUserId: user.id,
        ownershipStatus: 'claimed',
        verificationTier: 'basic_verified',
      })
      .where('id', '=', input.businessId)
      .execute();

    // Create audit log entry
    await db.insertInto('claimAuditLog')
      .values({
        claimId: claim.id,
        actorId: user.id,
        action: 'claim_approved' as ClaimAuditAction,
        newValue: 'verified',
        details: `Business auto-claimed by ${ownerName} (${ownerEmail}) with proof type: ${input.proofType}`,
      })
      .execute();

    // Create notifications for all admin users (as FYI)
    const admins = await db.selectFrom('users')
      .select(['id', 'email', 'displayName'])
      .where('role', '=', 'admin')
      .execute();

    if (admins.length > 0) {
      await db.insertInto('notifications')
        .values(
          admins.map(admin => ({
            userId: admin.id,
            businessId: input.businessId,
            type: 'claim_approved' as NotificationType,
            message: `Business auto-claimed by owner: ${business.name} by ${ownerName}`,
            isRead: false,
          }))
        )
        .execute();

      // Send email notifications to all admins (fire-and-forget, as FYI)
      Promise.allSettled(
        admins.map(admin =>
          resendEmail.sendClaimSubmittedEmail({
            adminEmail: admin.email,
            adminName: admin.displayName,
            businessName: business.name,
            claimantName: ownerName,
            claimantEmail: ownerEmail,
            proofType: input.proofType,
            claimId: claim.id,
          })
        )
      );
    }

    // Send welcome email to the owner (fire-and-forget)
    resendEmail.sendClaimApprovedEmail({
      userEmail: ownerEmail,
      userName: ownerName,
      businessName: business.name,
    }).catch(error => {
      console.error('Failed to send welcome email to owner:', error);
    });

    console.log(`Business ${business.name} auto-claimed by ${ownerName} (claim ID: ${claim.id})`);

    const result: OutputType = {
      claimId: claim.id,
      verificationStatus: 'verified',
      verificationTier: 'basic_verified',
      message: "You now have owner access to this business.",
    };

    return new Response(superjson.stringify(result));
  } catch (error) {
    // Handle authentication errors specifically if needed, or generic errors
    if (error instanceof Error && error.name === 'NotAuthenticatedError') {
        return new Response(superjson.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}