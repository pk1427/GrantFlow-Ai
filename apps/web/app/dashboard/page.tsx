import type { ReactNode } from "react";
import { Activity, ArrowUpRight, Gauge, Trophy } from "lucide-react";
import { ApiOffline } from "@/components/api-offline";
import { Badge, Card, LinkButton } from "@/components/ui";
import { apiFetch, explorerDeployUrl, shortHash, type IndexerState } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let state: IndexerState;
  try {
    state = await apiFetch<IndexerState>("/indexer/state");
  } catch {
    return <ApiOffline title="Dashboard needs the backend API" />;
  }
  const latestGrant = state.grants.at(-1);
  const latestMilestone = latestGrant?.milestones[0];
  const stats = [
    { label: "Total grants", value: String(state.stats.total_grants) },
    { label: "Funds locked", value: `${state.stats.funds_locked} CSPR` },
    { label: "Funds released", value: `${state.stats.funds_released} CSPR` },
    { label: "AI score", value: `${state.stats.ai_score}%` },
    { label: "Reputation", value: String(state.stats.reputation_score) }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-cyan">Funder dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal">Milestone funding console</h1>
        </div>
        <LinkButton href="/grants/new">New grant</LinkButton>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge tone="success">{latestGrant?.status ?? "No grants"}</Badge>
              <h2 className="mt-4 text-2xl font-semibold">{latestMilestone?.title ?? "Create your first grant"}</h2>
              <p className="mt-2 text-sm text-slate-300">Escrowed milestone reward: {latestGrant?.total_amount ?? 0} CSPR</p>
            </div>
            <Gauge className="text-cyan" size={32} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric icon={<Activity size={18} />} label="AI confidence" value={`${state.stats.ai_score}%`} />
            <Metric icon={<Trophy size={18} />} label="Contract state" value={state.source} />
            <Metric icon={<ArrowUpRight size={18} />} label="Reputation" value="+14 pts" />
          </div>
          <LinkButton href={latestGrant ? `/grants/${latestGrant.id}` : "/grants/new"} className="mt-6">Open grant</LinkButton>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Transaction history</h2>
          <div className="mt-4 space-y-4">
            {state.transactions.map((tx) => (
              <div key={tx.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{tx.label}</p>
                  <Badge tone="success">{tx.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-400">{tx.amount} CSPR</p>
                {explorerDeployUrl(tx.tx_hash) ? (
                  <a className="mt-1 block break-all text-xs text-cyan" href={explorerDeployUrl(tx.tx_hash)} target="_blank" rel="noreferrer">
                    {shortHash(tx.tx_hash)}
                  </a>
                ) : (
                  <p className="mt-1 break-all text-xs text-cyan">{shortHash(tx.tx_hash)}</p>
                )}
              </div>
            ))}
            {state.transactions.length === 0 ? <p className="text-sm text-slate-400">No indexed transactions yet.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-ink/50 p-4">
      <div className="mb-3 text-cyan">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
