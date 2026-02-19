import { db } from "./db";
import { sql } from "kysely";

// List of common free email providers to skip for domain matching
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "aol.com",
  "icloud.com",
  "protonmail.com",
  "mail.com",
  "live.com",
  "msn.com",
]);

export async function autoMatchBusinesses(
  userId: number,
  userEmail: string
): Promise<{ matchedCount: number; matchedBusinessIds: number[] }> {
  // Extract domain from email
  const emailParts = userEmail.split("@");
  if (emailParts.length !== 2) {
    return { matchedCount: 0, matchedBusinessIds: [] };
  }
  const domain = emailParts[1].toLowerCase();
  const isFreeEmail = FREE_EMAIL_DOMAINS.has(domain);

  // We are looking for businesses that are NOT claimed yet.
  // Criteria:
  // 1. addedByUserId matches
  // 2. contactEmail matches (exact)
  // 3. website contains domain (if not free email)

  let query = db
    .selectFrom("businesses")
    .select("id")
    .where("ownershipStatus", "=", "unclaimed") // Only match unclaimed businesses
    .where((eb) => {
      const conditions = [
        eb("addedByUserId", "=", userId),
        eb("contactEmail", "=", userEmail),
      ];

      if (!isFreeEmail) {
        // Use ILIKE for case-insensitive matching if domain is not a free provider
        // Check if website contains the domain
        conditions.push(eb("website", "ilike", `%${domain}%`));
      }

      return eb.or(conditions);
    });

  const potentialMatches = await query.execute();
  const matchedIds = potentialMatches.map((b) => b.id);

  if (matchedIds.length === 0) {
    return { matchedCount: 0, matchedBusinessIds: [] };
  }

  // Update the matched businesses
  // We use a transaction to ensure data integrity if needed, though a single update statement works fine here too.
  // However, updating multiple rows with 'id in [...]' is atomic in Postgres.
  
  await db
    .updateTable("businesses")
    .set({
      isClaimed: true,
      claimedByUserId: userId,
      ownershipStatus: "claimed",
      verificationTier: "basic_verified",
      updatedAt: new Date(),
    })
    .where("id", "in", matchedIds)
    // Double check they are still unclaimed just in case of race conditions
    .where("ownershipStatus", "=", "unclaimed")
    .execute();

  return {
    matchedCount: matchedIds.length,
    matchedBusinessIds: matchedIds,
  };
}