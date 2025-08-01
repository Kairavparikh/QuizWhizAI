import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createSubscription({
  stripeCustomerId,
}: {
  stripeCustomerId: string;
}) {
  await db
    .update(users)
    .set({
      subscribed: true,
    })
    .where(eq(users.stripeCustomerId, stripeCustomerId))
    .execute(); 
}

export async function deleteSubscription({
  stripeCustomerId,
}: {
  stripeCustomerId: string;
}) {
  await db
    .update(users)
    .set({
      subscribed: false,
    })
    .where(eq(users.stripeCustomerId, stripeCustomerId))
    .execute(); 
}

export async function getUserSubscriptions({
  userId,
}: {
  userId: string;
}) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  return user?.subscribed;
}
