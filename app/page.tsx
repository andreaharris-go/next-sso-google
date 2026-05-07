import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ServiceCard } from "@/components/ServiceCard";
import { SignOutButton } from "@/components/SignOutButton";

/**
 * Static list of placeholder employee services rendered on the dashboard.
 * In a real portal these would link out to dedicated tools/pages.
 */
const SERVICES: ReadonlyArray<{
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    title: "Leave Request",
    description: "Submit and track vacation, sick, and personal time off.",
    icon: <span aria-hidden>🏖️</span>,
  },
  {
    title: "Payroll",
    description: "View pay stubs, tax documents, and direct-deposit settings.",
    icon: <span aria-hidden>💰</span>,
  },
  {
    title: "IT Support",
    description: "Open a ticket for hardware, software, or account issues.",
    icon: <span aria-hidden>🛠️</span>,
  },
  {
    title: "Benefits",
    description: "Review and manage your health, dental, and retirement plans.",
    icon: <span aria-hidden>❤️</span>,
  },
  {
    title: "Directory",
    description: "Find colleagues across the company by name, team, or office.",
    icon: <span aria-hidden>📇</span>,
  },
  {
    title: "Learning",
    description: "Browse training catalogs and track required compliance courses.",
    icon: <span aria-hidden>🎓</span>,
  },
];

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const session = await auth();

  // Defense-in-depth: middleware should have already redirected unauthenticated
  // users, but we re-check here so this Server Component can never render
  // sensitive data without a session.
  if (!session?.user) {
    redirect("/login");
  }

  const { name, email, image } = session.user;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="flex flex-col items-start justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          {image ? (
            <Image
              src={image}
              alt={name ? `${name}'s profile picture` : "Profile picture"}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full border border-slate-200"
              priority
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-lg font-semibold text-slate-600">
              {name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Welcome, {name ?? "colleague"}!
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Signed in as <span className="font-medium">{email}</span>
            </p>
          </div>
        </div>

        <SignOutButton />
      </header>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">
          Employee Services
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Quick access to the tools you use every day. More integrations are on
          the way.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              icon={service.icon}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
