import { ApiOffline } from "@/components/api-offline";
import { Card, LinkButton } from "@/components/ui";
import { SubmissionForm } from "@/components/submission-form";
import { apiFetch, type Grant } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function SubmitMilestonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let grant: Grant;
  try {
    grant = await apiFetch<Grant>(`/grants/${id}`);
  } catch {
    return <ApiOffline title="Milestone submission needs the backend API" />;
  }
  const milestone = grant.milestones[0];
  if (milestone.status === "PAID") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-sm text-cyan">Builder submission</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal">Milestone already paid</h1>
        <Card className="mt-6">
          <p className="text-sm leading-6 text-slate-300">
            This milestone has already been verified and released. Further evidence submissions are closed.
          </p>
          <LinkButton href={`/grants/${grant.id}`} className="mt-5">Back to grant</LinkButton>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="text-sm text-cyan">Builder submission</p>
      <h1 className="mt-2 text-3xl font-bold tracking-normal">Submit milestone evidence</h1>
      <Card className="mt-6">
        <SubmissionForm milestoneId={milestone.id} />
      </Card>
    </div>
  );
}
