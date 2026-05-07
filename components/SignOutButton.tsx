import { signOut } from "@/auth";

/**
 * Server-action powered "Sign Out" button.
 *
 * Renders an inline form that, when submitted, invokes Auth.js's `signOut`
 * server action and redirects the user back to `/login`. Using a server
 * action means we don't ship any client JS for this button.
 */
export function SignOutButton(): React.JSX.Element {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
      >
        Sign out
      </button>
    </form>
  );
}
