import { schema, OutputType } from "./audit-log_GET.schema";
import superjson from 'superjson';
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== 'admin') {
      return new Response(superjson.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const input = schema.parse(queryParams);

    const auditLogs = await db.selectFrom('claimAuditLog')
      .innerJoin('users', 'claimAuditLog.actorId', 'users.id')
      .select([
        'claimAuditLog.id',
        'claimAuditLog.claimId',
        'claimAuditLog.actorId',
        'users.displayName as actorName',
        'claimAuditLog.action',
        'claimAuditLog.oldValue',
        'claimAuditLog.newValue',
        'claimAuditLog.details',
        'claimAuditLog.createdAt'
      ])
      .where('claimAuditLog.claimId', '=', input.claimId)
      .orderBy('claimAuditLog.createdAt', 'asc')
      .execute();

    return new Response(superjson.stringify({ logs: auditLogs } satisfies OutputType));

  } catch (error) {
    if (error instanceof Error && error.name === 'NotAuthenticatedError') {
      return new Response(superjson.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}