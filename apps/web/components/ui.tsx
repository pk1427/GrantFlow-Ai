import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Button({
  className,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      className={clsx(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan px-4 text-sm font-semibold text-ink shadow-[0_0_24px_rgba(34,211,238,0.18)] transition hover:-translate-y-0.5 hover:bg-white disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-55 focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-ink",
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      className={clsx(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan px-4 text-sm font-semibold text-ink shadow-[0_0_24px_rgba(34,211,238,0.18)] transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-ink",
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={clsx(
        "rounded-lg border border-line bg-panel/90 p-5 shadow-glow transition-colors hover:border-slate-600/80",
        className
      )}
      {...props}
    />
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warn" | "error" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "success" && "border-success/40 bg-success/10 text-success",
        tone === "warn" && "border-amber-400/40 bg-amber-400/10 text-amber-200",
        tone === "error" && "border-red-400/40 bg-red-400/10 text-red-200",
        tone === "default" && "border-cyan/40 bg-cyan/10 text-cyan"
      )}
    >
      {children}
    </span>
  );
}

export function PageShell({ className, ...props }: ComponentProps<"div">) {
  return <div className={clsx("mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8", className)} {...props} />;
}

export function SectionHeader({
  eyebrow,
  title,
  children,
  action
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow ? <p className="text-sm font-medium text-cyan">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-50 sm:text-4xl">{title}</h1>
        {children ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{children}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Field({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={clsx(
        "h-10 rounded-md border border-line bg-ink px-3 text-sm text-slate-100 outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/20",
        className
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={clsx(
        "rounded-md border border-line bg-ink px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/20",
        className
      )}
      {...props}
    />
  );
}

export function ProgressRing({
  value,
  label,
  tone = "cyan"
}: {
  value: number;
  label: string;
  tone?: "cyan" | "success" | "warn";
}) {
  const clamped = Math.max(0, Math.min(value, 100));
  const color = tone === "success" ? "#22C55E" : tone === "warn" ? "#FBBF24" : "#22D3EE";

  return (
    <div className="flex items-center gap-4">
      <div
        aria-label={`${label}: ${clamped}%`}
        className="grid size-20 place-items-center rounded-full"
        style={{ background: `conic-gradient(${color} ${clamped * 3.6}deg, rgba(148,163,184,0.16) 0deg)` }}
      >
        <div className="grid size-16 place-items-center rounded-full bg-panel text-lg font-semibold text-slate-50">{clamped}%</div>
      </div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-1 text-sm text-slate-300">{clamped >= 80 ? "Strong signal" : clamped >= 50 ? "Needs review" : "Low confidence"}</p>
      </div>
    </div>
  );
}
