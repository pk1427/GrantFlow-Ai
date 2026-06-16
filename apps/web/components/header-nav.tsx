"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, type IndexerState } from "@/lib/api";

export function HeaderNav() {
  const [latestGrantId, setLatestGrantId] = useState("grant-001");

  useEffect(() => {
    apiFetch<IndexerState>("/indexer/state")
      .then((state) => {
        const latest = state.grants.at(-1);
        if (latest) setLatestGrantId(latest.id);
      })
      .catch(() => undefined);
  }, []);

  return (
    <nav className="hidden items-center gap-5 text-sm text-slate-300 sm:flex">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/grants/new">Create Grant</Link>
      <Link href={`/grants/${latestGrantId}`}>Latest Grant</Link>
    </nav>
  );
}
