import type { ReactNode } from "react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  /** Marked as "coming soon" placeholder — not yet wired to a real service. */
  comingSoon?: boolean;
}

/**
 * Reusable card for the dashboard's "Employee Services" grid (Leave Request,
 * Payroll, IT Support, etc.). Currently rendered as static placeholders.
 */
export function ServiceCard({
  title,
  description,
  icon,
  comingSoon = true,
}: ServiceCardProps): React.JSX.Element {
  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      {comingSoon ? (
        <span className="absolute right-4 top-4 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          Coming soon
        </span>
      ) : null}
    </div>
  );
}
