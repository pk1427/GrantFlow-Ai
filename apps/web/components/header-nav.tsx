"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { apiFetch, type IndexerState } from "@/lib/api";

export function HeaderNav() {
  const [latestGrantId, setLatestGrantId] = useState("grant-001");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    apiFetch<IndexerState>("/indexer/state")
      .then((state) => {
        const latest = state.grants.at(-1);
        if (latest) setLatestGrantId(latest.id);
      })
      .catch(() => undefined);
  }, []);

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/grants/new", label: "Create Grant" },
    { href: `/grants/${latestGrantId}`, label: "Latest Grant" }
  ];

  return (
    <div className="relative">
      <nav className="hidden items-center gap-1 rounded-md border border-line bg-panel/60 p-1 text-sm text-slate-300 md:flex">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded px-3 py-1.5 transition hover:bg-cyan/10 hover:text-cyan">
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        aria-label="Toggle navigation"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-9 items-center justify-center rounded-md border border-line text-slate-300 md:hidden"
      >
        {open ? <X size={17} /> : <Menu size={17} />}
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-50 grid w-48 gap-1 rounded-lg border border-line bg-panel p-2 shadow-glow md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-cyan/10 hover:text-cyan"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
