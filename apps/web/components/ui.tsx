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
        "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan px-4 text-sm font-semibold text-ink transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-ink",
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
        "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan px-4 text-sm font-semibold text-ink transition hover:bg-white",
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={clsx("rounded-lg border border-line bg-panel p-5 shadow-glow", className)} {...props} />;
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warn" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "success" && "border-success/40 bg-success/10 text-success",
        tone === "warn" && "border-amber-400/40 bg-amber-400/10 text-amber-200",
        tone === "default" && "border-cyan/40 bg-cyan/10 text-cyan"
      )}
    >
      {children}
    </span>
  );
}
