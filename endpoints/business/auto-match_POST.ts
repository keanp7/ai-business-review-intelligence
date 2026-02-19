import { schema, OutputType } from "./auto-match_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { autoMatchBusinesses } from "../../helpers/autoMatchBusinesses";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    // 1. Authenticate user
    const { user } = await getServerUserSession(request);

    // 2. Parse input (even if empty, just to validate format)
    const json = superjson.parse(await request.text());
    schema.parse(json);

    // 3. Run auto-match logic
    const matchResult = await autoMatchBusinesses(user.id, user.email);

    // 4. Return result
    return new Response(superjson.stringify({
      matchedCount: matchResult.matchedCount,
      matchedBusinessIds: matchResult.matchedBusinessIds,
      message: matchResult.matchedCount > 0 
        ? `Successfully matched ${matchResult.matchedCount} business(es) to your account.`
        : "No matching businesses found."
    } satisfies OutputType));

  } catch (error) {
    // Handle authentication errors specifically or generic errors
    const status = error instanceof Error && error.message.includes("Not authenticated") ? 401 : 400;
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    return new Response(superjson.stringify({ error: errorMessage }), { status });
  }
}