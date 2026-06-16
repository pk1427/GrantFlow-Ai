import type { ReactNode } from "react";
import { CheckCircle2, ShieldAlert, WalletCards } from "lucide-react";
import { ApiOffline } from "@/components/api-offline";
import { Badge, Card } from "@/components/ui";
import { explorerDeployUrl, apiFetch, shortHash, type IndexerState } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function VerificationReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let state: IndexerState;
  try {
    state = await apiFetch<IndexerState>("/indexer/state");
  } catch {
    return <ApiOffline title="Verification report needs the backend API" />;
  }
  const submission = state.submissions.find((item) => item.milestone_id === id);
  const release = state.transactions.find((item) => item.milestone_id === id && item.label === "Milestone release");
  const reasons = submission?.verification?.reasons ?? ["No submission has been verified for this milestone yet."];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Badge tone={release ? "success" : "warn"}>{release ? "Release submitted" : "Awaiting release"}</Badge>
      <h1 className="mt-3 text-3xl font-bold tracking-normal">AI verification report</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <Card>
          <h2 className="text-xl font-semibold">Verification result</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Score label="Confidence" value={`${submission?.ai_score ?? 0}%`} icon={<CheckCircle2 />} />
            <Score label="Risk score" value={`${submission?.risk_score ?? 0}/100`} icon={<ShieldAlert />} />
          </div>
          <ul className="mt-6 space-y-3">
            {reasons.map((reason) => (
              <li key={reason} className="flex gap-3 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={17} />
                {reason}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <WalletCards className="text-cyan" size={30} />
          <h2 className="mt-4 text-xl font-semibold">Casper release</h2>
          <p className="mt-2 text-sm text-slate-300">Funding agent called `release_payment()` on GrantEscrow.</p>
          <div className="mt-5 rounded-md border border-line bg-ink p-4">
            <p className="text-sm text-slate-400">Transaction hash</p>
            {release?.tx_hash && explorerDeployUrl(release.tx_hash) ? (
              <a className="mt-2 block break-all text-sm text-cyan" href={explorerDeployUrl(release.tx_hash)} target="_blank" rel="noreferrer">
                {shortHash(release.tx_hash)}
              </a>
            ) : (
              <p className="mt-2 break-all text-sm text-cyan">{shortHash(release?.tx_hash)}</p>
            )}
          </div>
          <div className="mt-4 rounded-md border border-line bg-ink p-4">
            <p className="text-sm text-slate-400">Builder reputation</p>
            <p className="mt-2 text-2xl font-semibold">98 +14</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Score({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-ink/60 p-4">
      <div className="mb-3 text-cyan">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
