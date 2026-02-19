import { schema, OutputType } from "./list_GET.schema";
import superjson from 'superjson';
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { sql } from "kysely";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== 'admin') {
      return new Response(superjson.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const input = schema.parse(queryParams);

    const page = input.page || 1;
    const limit = input.limit || 10;
    const offset = (page - 1) * limit;

    // Base query for claims
    let query = db.selectFrom('businessClaims')
      .innerJoin('businesses', 'businessClaims.businessId', 'businesses.id')
      .innerJoin('users', 'businessClaims.userId', 'users.id')
      .select([
        'businessClaims.id',
        'businessClaims.businessId',
        'businesses.name as businessName',
        'businessClaims.userId',
        'users.displayName as userDisplayName',
        'users.email as userEmail',
        'businessClaims.ownerName',
        'businessClaims.ownerEmail',
        'businessClaims.proofType',
        'businessClaims.proofDescription',
        'businessClaims.verificationStatus',
        'businessClaims.adminNotes',
        'businessClaims.createdAt',
        'businessClaims.updatedAt',
      ]);

    // Count query should mirror the filters
    let countQuery = db.selectFrom('businessClaims')
      .innerJoin('businesses', 'businessClaims.businessId', 'businesses.id')
      .innerJoin('users', 'businessClaims.userId', 'users.id')
      .select(db.fn.count('businessClaims.id').as('total'));

    if (input.verificationStatus) {
      query = query.where('businessClaims.verificationStatus', '=', input.verificationStatus);
      countQuery = countQuery.where('businessClaims.verificationStatus', '=', input.verificationStatus);
    }

    // Execute queries
    const claims = await query
      .orderBy('businessClaims.createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    const totalResult = await countQuery.executeTakeFirst();
    const total = Number(totalResult?.total || 0);

    // Fetch documents for the retrieved claims
    const claimIds = claims.map(c => c.id);
    const documentsMap = new Map();

    if (claimIds.length > 0) {
      const documents = await db.selectFrom('claimDocuments')
        .selectAll()
        .where('claimId', 'in', claimIds)
        .execute();

      documents.forEach(doc => {
        if (!documentsMap.has(doc.claimId)) {
          documentsMap.set(doc.claimId, []);
        }
        documentsMap.get(doc.claimId).push(doc);
      });
    }

    // Combine results
    const enrichedClaims = claims.map(claim => {
      const docs = documentsMap.get(claim.id) || [];
      return {
        ...claim,
        documentCount: docs.length,
        documents: docs,
      };
    });

    return new Response(superjson.stringify({ claims: enrichedClaims, total } satisfies OutputType));

  } catch (error) {
    if (error instanceof Error && error.name === 'NotAuthenticatedError') {
      return new Response(superjson.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}