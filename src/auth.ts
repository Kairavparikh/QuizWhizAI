import NextAuth, { type Session, type User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db/index";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow the sign in
      return true;
    },
    async redirect({ url, baseUrl }) {
      // If the URL is already on our domain, use it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // After OAuth sign in (from external provider), redirect to role selection
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Default redirect to role selection after sign in
      return `${baseUrl}/role-selection`;
    },
    async session({ session, user }: { session: Session; user?: User }) {
      if (user && session?.user) {
        session.user.id = user.id;

        // Fetch the user's role from the database
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, user.id),
        });

        if (dbUser) {
          (session.user as any).role = dbUser.role;
        }
      }
      return session;
    },
  },
});