import { schema, OutputType } from "./documents_GET.schema";
import superjson from 'superjson';
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { supabaseStorage } from "../../../helpers/supabaseStorage";

export async function handle(request: Request) {
  try {
    // Authenticate user
    const { user } = await getServerUserSession(request);

    // Parse input
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const input = schema.parse(queryParams);

    // Fetch the document and join with claim to check ownership
    const document = await db.selectFrom('claimDocuments')
      .innerJoin('businessClaims', 'claimDocuments.claimId', 'businessClaims.id')
      .select([
        'claimDocuments.id',
        'claimDocuments.fileName',
        'claimDocuments.fileType',
        'claimDocuments.storagePath',
        'businessClaims.userId as claimOwnerId'
      ])
      .where('claimDocuments.id', '=', input.documentId)
      .executeTakeFirst();

    if (!document) {
      return new Response(superjson.stringify({ error: "Document not found" }), { status: 404 });
    }

    // Access control: Allow if user is admin OR user is the claim owner
    const isOwner = document.claimOwnerId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return new Response(superjson.stringify({ error: "Forbidden" }), { status: 403 });
    }

    // Generate signed URL for the document (expires in 1 hour)
    const signedUrl = await supabaseStorage.getSignedUrl(document.storagePath, 3600);

    const result: OutputType = {
      fileName: document.fileName,
      fileType: document.fileType,
      signedUrl: signedUrl,
    };

    return new Response(superjson.stringify(result));

  } catch (error) {
    if (error instanceof Error && error.name === 'NotAuthenticatedError') {
      return new Response(superjson.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}