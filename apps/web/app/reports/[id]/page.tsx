import { CheckCircle2, Circle, WalletCards } from "lucide-react";
import { ApiOffline } from "@/components/api-offline";
import { Badge, Card, PageShell, ProgressRing, SectionHeader } from "@/components/ui";
import { explorerDeployUrl, apiFetch, isMockHash, shortHash, type IndexerState } from "@/lib/api";

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
  const status = release ? "Release submitted" : submission ? "Verified, awaiting release" : "No submission";

  return (
    <PageShell className="max-w-6xl">
      <SectionHeader eyebrow="Agent report" title="AI verification report" action={<Badge tone={release ? "success" : submission ? "default" : "warn"}>{status}</Badge>}>
        Evidence analysis, risk signals, and payment release state for this milestone.
      </SectionHeader>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Verification result</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-line bg-ink/50 p-4">
              <ProgressRing value={submission?.ai_score ?? 0} label="Confidence" tone="cyan" />
            </div>
            <div className="rounded-md border border-line bg-ink/50 p-4">
              <ProgressRing value={100 - (submission?.risk_score ?? 0)} label="Risk-adjusted trust" tone={submission && submission.risk_score < 30 ? "success" : "warn"} />
            </div>
          </div>
          {submission ? (
            <div className="mt-5 rounded-md border border-line bg-ink/60 p-4">
              <p className="text-sm text-slate-400">Evidence</p>
              <a className="mt-2 block break-all text-sm text-cyan" href={submission.github_url} target="_blank" rel="noreferrer">
                {submission.github_url}
              </a>
              <a className="mt-1 block break-all text-sm text-cyan" href={submission.deployment_url} target="_blank" rel="noreferrer">
                {submission.deployment_url}
              </a>
            </div>
          ) : null}
          {submission?.verification?.checks ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <CheckRow label="Repository accessible" ok={submission.verification.checks.repositoryAccessible} />
              <CheckRow label={`Commits: ${submission.verification.checks.commitCount}`} ok={submission.verification.checks.commitCount >= 10} />
              <CheckRow label="README found" ok={submission.verification.checks.readmeFound} />
              <CheckRow label="Recent commit" ok={submission.verification.checks.latestCommitWithin14Days} />
              <CheckRow label="Deployment healthy" ok={submission.verification.checks.deploymentHealthy} />
            </div>
          ) : null}
          <ul className="mt-6 space-y-3">
            {reasons.map((reason) => (
              <li key={reason} className="flex gap-3 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={17} />
                {reason}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <WalletCards className="text-cyan" size={30} />
          <h2 className="mt-4 text-xl font-semibold">Casper release</h2>
          <p className="mt-2 text-sm text-slate-300">
            {release
              ? "Funding agent submitted `release_payment()` through the backend."
              : submission
                ? "Milestone is verified. Return to the grant details page to release payment."
                : "Submit milestone evidence before payment can be released."}
          </p>
          <div className="mt-5 rounded-md border border-line bg-ink p-4">
            <p className="text-sm text-slate-400">Transaction hash</p>
            {release?.tx_hash && explorerDeployUrl(release.tx_hash) ? (
              <a className="mt-2 block break-all text-sm text-cyan" href={explorerDeployUrl(release.tx_hash)} target="_blank" rel="noreferrer">
                {shortHash(release.tx_hash)}
              </a>
            ) : (
              <p className="mt-2 break-all text-sm text-cyan">
                {shortHash(release?.tx_hash)} {isMockHash(release?.tx_hash) ? <span className="text-slate-500">(local demo)</span> : null}
              </p>
            )}
          </div>
          <div className="mt-4 rounded-md border border-line bg-ink p-4">
            <p className="text-sm text-slate-400">Builder reputation</p>
            <p className="mt-2 text-2xl font-semibold">{release ? "98 +14" : "84"}</p>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function CheckRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-line bg-ink/50 p-3 text-sm">
      {ok ? <CheckCircle2 className="text-success" size={17} /> : <Circle className="text-slate-500" size={17} />}
      <span className={ok ? "text-slate-200" : "text-slate-500"}>{label}</span>
    </div>
  );
}
