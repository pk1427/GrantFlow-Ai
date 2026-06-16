"use client";

import { useEffect, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

export function ApiStatus() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${apiBaseUrl}/health`)
      .then((response) => setOnline(response.ok))
      .catch(() => setOnline(false));
  }, []);

  if (online !== false) return null;

  return (
    <div className="border-b border-amber-400/30 bg-amber-400/10 px-4 py-2 text-center text-sm text-amber-100">
      Backend API is offline. Start it with `npm run dev:api` before using dashboard, grant, and payment flows.
    </div>
  );
}
