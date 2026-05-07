import Link from "next/link";

interface AuthErrorPageProps {
  // Next.js 16: dynamic APIs (searchParams) are async.
  searchParams: Promise<{ error?: string }>;
}

/**
 * Maps the `?error=` codes Auth.js can append to the redirect URL to
 * human-friendly messages. The most common one for this app is
 * `AccessDenied`, which is what the `signIn` callback in `auth.ts` returns
 * when a non-Workspace email tries to log in.
 *
 * See: https://authjs.dev/reference/core/errors
 */
function describeError(code: string | undefined): {
  title: string;
  message: string;
} {
  switch (code) {
    case "AccessDenied":
      return {
        title: "Access Denied",
        message:
          "Please sign in using your official company Google Workspace email. Personal Gmail accounts and other domains are not permitted.",
      };
    case "Verification":
      return {
        title: "Verification Failed",
        message:
          "The sign-in link is invalid or has expired. Please try signing in again.",
      };
    case "Configuration":
      return {
        title: "Configuration Error",
        message:
          "The authentication service is misconfigured. Please contact your IT administrator.",
      };
    default:
      return {
        title: "Sign-in Error",
        message:
          "Something went wrong while signing you in. Please try again, and contact IT support if the issue persists.",
      };
  }
}

export default async function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps): Promise<React.JSX.Element> {
  const { error } = await searchParams;
  const { title, message } = describeError(error);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-2xl">
          <span aria-hidden>⚠️</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{message}</p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Try signing in again
          </Link>
        </div>

        {error ? (
          <p className="mt-6 text-xs text-slate-400">Error code: {error}</p>
        ) : null}
      </div>
    </main>
  );
}
