import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Domain that employees must use in their Google Workspace email address.
 * Configurable via the `ALLOWED_WORKSPACE_DOMAIN` env var. Falls back to a
 * sensible default for local dev — but in production this MUST be set.
 */
const ALLOWED_DOMAIN: string =
  process.env.ALLOWED_WORKSPACE_DOMAIN?.toLowerCase().trim() || "yourcompany.com";

/**
 * Auth.js v5 configuration.
 *
 * - Uses the Google provider for SSO.
 * - The `signIn` callback enforces that the authenticated user belongs to the
 *   configured Google Workspace domain. Personal `@gmail.com` accounts (or any
 *   other domain) are rejected and redirected to the auth error page.
 * - The `session` callback exposes the user `id` on the typed session object.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          // Hint Google to surface the correct Workspace account chooser and
          // restrict the consent screen to the company's hosted domain.
          hd: ALLOWED_DOMAIN,
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    /**
     * Server-side enforcement of the Workspace-domain restriction. The `hd`
     * authorization param above is only a hint — never trust the client to
     * honor it. We re-check the verified email here.
     */
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return false;
      }

      // Google's `email_verified` claim and `email` come from the verified
      // ID token, so they can be trusted.
      const email = profile?.email?.toLowerCase();
      const emailVerified =
        (profile as { email_verified?: boolean } | undefined)?.email_verified ?? false;

      if (!email || !emailVerified) {
        return false;
      }

      const expectedSuffix = `@${ALLOWED_DOMAIN}`;
      if (!email.endsWith(expectedSuffix)) {
        // Returning false sends the user to the configured error page with
        // `error=AccessDenied`, which our `/auth/error` page handles.
        return false;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
