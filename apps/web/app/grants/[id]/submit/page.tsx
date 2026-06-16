import { Card } from "@/components/ui";
import { SubmissionForm } from "@/components/submission-form";
import { apiFetch, type Grant } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function SubmitMilestonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const grant = await apiFetch<Grant>(`/grants/${id}`);
  const milestone = grant.milestones[0];

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
