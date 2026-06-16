"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { apiFetch, type Grant } from "@/lib/api";

const defaultBuilder = "account-hash-1130715646e6847e65732ba746ecad6fce0f33ba4ac6c9f4f021674cea2ab3a5";

export function CreateGrantForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);

    try {
      const grant = await apiFetch<Grant>("/grants", {
        method: "POST",
        body: JSON.stringify({
          creator_wallet: window.localStorage.getItem("grantflow.wallet") ?? "casper-wallet-not-connected",
          builder_wallet: String(formData.get("builder_wallet") ?? ""),
          total_amount: Number(formData.get("total_amount") ?? 100),
          title: String(formData.get("title") ?? "Deploy a working MVP")
        })
      });
      router.push(`/grants/${grant.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create grant");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="grid gap-5">
      <label className="grid gap-2">
        <span className="text-sm text-slate-300">Grant title</span>
        <input name="title" className="rounded-md border border-line bg-ink px-3 py-2" defaultValue="Deploy a working MVP" />
      </label>
      <label className="grid gap-2">
        <span className="text-sm text-slate-300">Builder account hash</span>
        <input name="builder_wallet" className="rounded-md border border-line bg-ink px-3 py-2" defaultValue={defaultBuilder} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Reward in CSPR</span>
          <input name="total_amount" type="number" min="1" className="rounded-md border border-line bg-ink px-3 py-2" defaultValue="100" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Network</span>
          <input className="rounded-md border border-line bg-ink px-3 py-2" value="Casper Testnet" readOnly />
        </label>
      </div>
      <label className="grid gap-2">
        <span className="text-sm text-slate-300">Verification rules</span>
        <textarea
          className="min-h-32 rounded-md border border-line bg-ink px-3 py-2"
          defaultValue={"Public GitHub repository exists\nRepository has at least 10 commits\nREADME file exists\nDeployment URL returns HTTP 200\nLatest commit is within the last 14 days"}
        />
      </label>
      {error ? <p className="rounded-md border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button disabled={pending} type="submit">
          <Plus size={16} /> {pending ? "Creating" : "Create grant"}
        </Button>
        <Button disabled type="button" className="border border-line bg-transparent text-slate-400">
          <Coins size={16} /> Deposit handled by contract flow
        </Button>
      </div>
    </form>
  );
}
