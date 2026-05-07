import type { DefaultSession } from "next-auth";

/**
 * Module augmentation for Auth.js (NextAuth) v5.
 *
 * Extends the default `Session` and `JWT` shapes returned by the Google
 * provider so that `session.user.id` and `token.id` are strongly typed
 * everywhere they are consumed.
 */
declare module "next-auth" {
  /**
   * Shape of the user as exposed by `auth()` / `useSession()`.
   *
   * Google profile fields:
   *   - `name`  : display name from the Google account
   *   - `email` : verified Workspace email (e.g. alice@yourcompany.com)
   *   - `image` : URL of the user's Google profile picture (may be null)
   *   - `id`    : stable Google account subject id (added in our callback)
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** Google subject (`sub`) — the stable user identifier. */
    id?: string;
  }
}

export {};
