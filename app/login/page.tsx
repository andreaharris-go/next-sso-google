import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignInButton } from "@/components/SignInButton";

interface LoginPageProps {
  // Next.js 16: dynamic APIs (searchParams) are async.
  searchParams: Promise<{ callbackUrl?: string }>;
}

/**
 * Public sign-in page. Already-authenticated users are redirected to the
 * dashboard so they don't see this page after logging in.
 */
export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.JSX.Element> {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session?.user) {
    redirect(callbackUrl ?? "/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Employee Service Portal
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with your company Google Workspace account to continue.
          </p>
        </div>

        <SignInButton callbackUrl={callbackUrl ?? "/"} />

        <p className="mt-6 text-center text-xs text-slate-500">
          Access is restricted to authorized employees. Personal Gmail accounts
          will be denied.
        </p>
      </div>
    </main>
  );
}
