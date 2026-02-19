import { schema, OutputType } from "./status_GET.schema";
import superjson from 'superjson';
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    // Authenticate user
    const { user } = await getServerUserSession(request);

    // Parse input
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const input = schema.parse(queryParams);

    // Build the query
    let query = db.selectFrom('businessClaims')
      .selectAll('businessClaims')
      .where('businessId', '=', input.businessId);

    // Apply access control logic
    if (user.role !== 'admin') {
      query = query.where('userId', '=', user.id);
    }

    const claim = await query.executeTakeFirst();

    if (!claim) {
      return new Response(superjson.stringify({ claim: null } satisfies OutputType));
    }

    // Fetch document metadata for this claim
    const documents = await db.selectFrom('claimDocuments')
      .select(['id', 'fileName', 'fileType', 'fileSize', 'createdAt'])
      .where('claimId', '=', claim.id)
      .execute();

    // Construct the response object
    const result: OutputType = {
      claim: {
        id: claim.id,
        businessId: claim.businessId,
        userId: claim.userId,
        ownerName: claim.ownerName,
        ownerEmail: claim.ownerEmail,
        proofType: claim.proofType,
        proofDescription: claim.proofDescription,
        verificationStatus: claim.verificationStatus,
        adminNotes: claim.adminNotes,
        // Convert dates to ISO strings for consistent transport, though superjson handles dates well, 
        // the spec requested string types in the OutputType definition.
        createdAt: claim.createdAt.toISOString(),
        updatedAt: claim.updatedAt.toISOString(),
        documents: documents.map(doc => ({
          ...doc,
          createdAt: doc.createdAt.toISOString(),
        })),
      }
    };

    return new Response(superjson.stringify(result));

  } catch (error) {
    if (error instanceof Error && error.name === 'NotAuthenticatedError') {
      return new Response(superjson.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}