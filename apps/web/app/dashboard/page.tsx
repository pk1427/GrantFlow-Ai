import type { ReactNode } from "react";
import { Activity, ArrowUpRight, BadgeCheck, Coins, Database, Gauge, ShieldCheck, Trophy, WalletCards } from "lucide-react";
import { ApiOffline } from "@/components/api-offline";
import { GrantLifecycle } from "@/components/grant-lifecycle";
import { Badge, Card, LinkButton, PageShell, SectionHeader } from "@/components/ui";
import { apiFetch, explorerDeployUrl, formatStatus, isMockHash, shortHash, type IndexerState } from "@/lib/api";

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
  const latestSubmission = latestMilestone
    ? state.submissions.find((item) => item.milestone_id === latestMilestone.id)
    : undefined;
  const latestRelease = latestMilestone
    ? state.transactions.find((item) => item.milestone_id === latestMilestone.id && item.label === "Milestone release")
    : undefined;
  const stats = [
    { label: "Total grants", value: String(state.stats.total_grants), icon: Database, tone: "text-cyan" },
    { label: "Funds locked", value: `${state.stats.funds_locked} CSPR`, icon: WalletCards, tone: "text-amber-200" },
    { label: "Funds released", value: `${state.stats.funds_released} CSPR`, icon: Coins, tone: "text-success" },
    { label: "AI score", value: `${state.stats.ai_score}%`, icon: ShieldCheck, tone: "text-cyan" },
    { label: "Reputation", value: String(state.stats.reputation_score), icon: BadgeCheck, tone: "text-success" }
  ];

  return (
    <PageShell>
      <SectionHeader eyebrow="Funder dashboard" title="Milestone funding console" action={<LinkButton href="/grants/new">New grant</LinkButton>}>
        Monitor AI-verified milestones, backend-indexed transactions, and Casper payment release state from one operational view.
      </SectionHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label} className="group">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <stat.icon className={stat.tone} size={18} />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">{stat.value}</p>
            <div className="mt-4 h-1 rounded-full bg-line">
              <div className="h-1 rounded-full bg-cyan/80 transition-all group-hover:bg-cyan" style={{ width: stat.label === "AI score" ? `${state.stats.ai_score}%` : "72%" }} />
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge tone={latestGrant?.status === "RELEASED" ? "success" : "default"}>{formatStatus(latestGrant?.status ?? "No grants")}</Badge>
              <h2 className="mt-4 text-2xl font-semibold">{latestMilestone?.title ?? "Create your first grant"}</h2>
              <p className="mt-2 text-sm text-slate-300">Escrowed milestone reward: {latestGrant?.total_amount ?? 0} CSPR</p>
            </div>
            <div className="rounded-lg border border-cyan/30 bg-cyan/10 p-3 text-cyan">
              <Gauge size={28} />
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric icon={<Activity size={18} />} label="AI confidence" value={`${state.stats.ai_score}%`} />
            <Metric icon={<Trophy size={18} />} label="State source" value={state.source} />
            <Metric icon={<ArrowUpRight size={18} />} label="Reputation" value="+14 pts" />
          </div>
          <LinkButton href={latestGrant ? `/grants/${latestGrant.id}` : "/grants/new"} className="mt-6">Open grant</LinkButton>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Transaction history</h2>
            <Badge>{state.transactions.length} indexed</Badge>
          </div>
          <div className="mt-4 space-y-4">
            {state.transactions.map((tx) => (
              <div key={tx.id} className="rounded-md border border-line bg-ink/45 p-4 transition hover:border-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{tx.label}</p>
                  <Badge tone="success">{formatStatus(tx.status)}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-400">{tx.amount} CSPR</p>
                {explorerDeployUrl(tx.tx_hash) ? (
                  <a className="mt-1 block break-all text-xs text-cyan" href={explorerDeployUrl(tx.tx_hash)} target="_blank" rel="noreferrer">
                    {shortHash(tx.tx_hash)}
                  </a>
                ) : (
                  <p className="mt-1 break-all text-xs text-cyan">
                    {shortHash(tx.tx_hash)} {isMockHash(tx.tx_hash) ? <span className="text-slate-500">(local demo)</span> : null}
                  </p>
                )}
              </div>
            ))}
            {state.transactions.length === 0 ? <p className="text-sm text-slate-400">No indexed transactions yet.</p> : null}
          </div>
        </Card>
      </div>
      <div className="mt-6">
        <GrantLifecycle grant={latestGrant} submission={latestSubmission} release={latestRelease} />
      </div>
      <Card className="mt-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold">Indexed grants</h2>
            <p className="mt-1 text-sm text-slate-400">Application state is read from the backend indexer, not directly from the browser.</p>
          </div>
          <Badge>{state.source}</Badge>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="text-slate-400">
              <tr className="border-b border-line">
                <th className="py-3 pr-4 font-medium">Grant</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Milestone</th>
                <th className="py-3 pr-4 font-medium">Amount</th>
                <th className="py-3 pr-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {state.grants.map((grant) => {
                const milestone = grant.milestones[0];
                return (
                  <tr key={grant.id} className="border-b border-line/70 last:border-0">
                    <td className="py-3 pr-4 font-medium">{grant.id}</td>
                    <td className="py-3 pr-4"><Badge tone={grant.status === "RELEASED" ? "success" : "default"}>{formatStatus(grant.status)}</Badge></td>
                    <td className="py-3 pr-4 text-slate-300">{formatStatus(milestone?.status ?? "PENDING")}</td>
                    <td className="py-3 pr-4 text-slate-300">{grant.total_amount} CSPR</td>
                    <td className="py-3 pr-4">
                      <LinkButton href={`/grants/${grant.id}`} className="h-8 px-3">Open</LinkButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-ink/50 p-4">
      <div className="mb-3 text-cyan">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold">{value}</p>
    </div>
  );
}
