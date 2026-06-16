import { Bot, CheckCircle2, ExternalLink } from "lucide-react";
import { ApiOffline } from "@/components/api-offline";
import { Badge, Card, LinkButton } from "@/components/ui";
import { ReleasePaymentButton } from "@/components/release-payment-button";
import { apiFetch, type Grant, type IndexerState } from "@/lib/api";

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge tone="success">{grant.status}</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-normal">{milestone.title}</h1>
          <p className="mt-2 break-all text-slate-300">Funder {grant.creator_wallet} · Builder {grant.builder_wallet ?? "Unassigned"}</p>
        </div>
        <LinkButton href={`/grants/${grant.id}/submit`}>Submit evidence</LinkButton>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <h2 className="text-xl font-semibold">Milestone criteria</h2>
          <ul className="mt-4 space-y-3">
            {milestone.verification_rules.map((rule) => (
              <li key={rule} className="flex gap-3 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={17} />
                {rule}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <Bot className="text-cyan" size={30} />
          <h2 className="mt-4 text-xl font-semibold">AI verification</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Confidence {submission?.ai_score ?? 0}%, risk {submission?.risk_score ?? 0}/100, status {milestone.status}.
          </p>
          <LinkButton href={`/reports/${milestone.id}`} className="mt-5">
            View report <ExternalLink size={16} />
          </LinkButton>
          {submission && grant.builder_wallet ? (
            <ReleasePaymentButton
              grantId={grant.id}
              milestoneId={milestone.id}
              amount={milestone.amount}
              builderWallet={grant.builder_wallet}
            />
          ) : null}
        </Card>
      </div>
    </div>
  );
}
