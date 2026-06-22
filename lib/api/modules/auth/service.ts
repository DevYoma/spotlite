import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) return null;

  // 1. Check if user exists in database
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (existingUser) return existingUser;

  // 2. Fetch email from Clerk to insert a new user
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const [newUser] = await db
    .insert(users)
    .values({
      clerkUserId: userId,
      email: email,
    })
    .returning();

  return newUser;
}
