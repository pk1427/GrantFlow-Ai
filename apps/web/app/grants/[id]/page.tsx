import { Bot, CheckCircle2, ExternalLink, ShieldCheck, WalletCards } from "lucide-react";
import { ApiOffline } from "@/components/api-offline";
import { GrantLifecycle } from "@/components/grant-lifecycle";
import { Badge, Card, LinkButton, PageShell, ProgressRing, SectionHeader } from "@/components/ui";
import { ReleasePaymentButton } from "@/components/release-payment-button";
import { explorerDeployUrl, formatStatus, isMockHash, shortHash, apiFetch, type Grant, type IndexerState } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function GrantDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let grant: Grant;
  let state: IndexerState;
  try {
    [grant, state] = await Promise.all([
      apiFetch<Grant>(`/grants/${id}`),
      apiFetch<IndexerState>("/indexer/state")
    ]);
  } catch {
    return <ApiOffline title="Grant details need the backend API" />;
  }
  const milestone = grant.milestones[0];
  const submission = state.submissions.find((item) => item.milestone_id === milestone.id);
  const release = state.transactions.find((item) => item.milestone_id === milestone.id && item.label === "Milestone release");
  const canSubmit = milestone.status !== "PAID";
  const canRelease = Boolean(submission && grant.builder_wallet && milestone.status === "VERIFIED" && !release);

  return (
    <PageShell className="max-w-6xl">
      <SectionHeader
        eyebrow="Grant details"
        title={milestone.title}
        action={canSubmit ? <LinkButton href={`/grants/${grant.id}/submit`}>Submit evidence</LinkButton> : null}
      >
        Funder <span className="break-all text-slate-300">{grant.creator_wallet}</span> · Builder{" "}
        <span className="break-all text-slate-300">{grant.builder_wallet ?? "Unassigned"}</span>
      </SectionHeader>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Milestone criteria</h2>
            <Badge tone={grant.status === "RELEASED" ? "success" : "default"}>{formatStatus(grant.status)}</Badge>
          </div>
          <ul className="mt-4 space-y-3">
            {milestone.verification_rules.map((rule) => (
              <li key={rule} className="flex gap-3 rounded-md border border-line bg-ink/45 p-3 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={17} aria-hidden />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg border border-cyan/30 bg-cyan/10 p-3 text-cyan">
              <Bot size={26} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI verification</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Confidence {submission?.ai_score ?? 0}%, risk {submission?.risk_score ?? 0}/100, status {formatStatus(milestone.status)}.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-line bg-ink/50 p-4">
              <ProgressRing value={submission?.ai_score ?? 0} label="AI confidence" tone="cyan" />
            </div>
            <div className="rounded-md border border-line bg-ink/50 p-4">
              <ProgressRing value={100 - (submission?.risk_score ?? 0)} label="Trust score" tone={submission && submission.risk_score < 30 ? "success" : "warn"} />
            </div>
          </div>
          <LinkButton href={`/reports/${milestone.id}`} className="mt-5">
            View report <ExternalLink size={16} />
          </LinkButton>
          {release ? (
            <div className="mt-5 rounded-md border border-success/40 bg-success/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-success">
                <WalletCards size={17} />
                Payment released
              </div>
              {explorerDeployUrl(release.tx_hash) ? (
                <a className="mt-2 block break-all text-xs text-cyan" href={explorerDeployUrl(release.tx_hash)} target="_blank" rel="noreferrer">
                  View deploy {shortHash(release.tx_hash)}
                </a>
              ) : (
                <p className="mt-2 break-all text-xs text-cyan">
                  {shortHash(release.tx_hash)} {isMockHash(release.tx_hash) ? <span className="text-slate-500">(local demo)</span> : null}
                </p>
              )}
            </div>
          ) : null}
          {canRelease && grant.builder_wallet ? (
            <ReleasePaymentButton
              grantId={grant.id}
              milestoneId={milestone.id}
              amount={milestone.amount}
              builderWallet={grant.builder_wallet}
            />
          ) : null}
          {!submission ? (
            <div className="mt-5 rounded-md border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              Submit evidence before the funding agent can authorize payment.
            </div>
          ) : null}
        </Card>
      </div>
      <div className="mt-6">
        <GrantLifecycle grant={grant} submission={submission} release={release} />
      </div>
    </PageShell>
  );
}
