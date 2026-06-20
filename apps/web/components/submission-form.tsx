"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Github, Rocket } from "lucide-react";
import { Button, Field, LinkButton } from "@/components/ui";
import { apiFetch, type Submission } from "@/lib/api";

export function SubmissionForm({ milestoneId }: { milestoneId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const result = await apiFetch<Submission>(`/milestones/${milestoneId}/submit`, {
        method: "POST",
        body: JSON.stringify({
          github_url: String(formData.get("github_url") ?? ""),
          deployment_url: String(formData.get("deployment_url") ?? "")
        })
      });
      setSubmission(result);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit evidence");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="grid gap-5">
      <label className="grid gap-2">
        <span className="text-sm text-slate-300">GitHub repository URL</span>
        <div className="flex items-center gap-2 rounded-md border border-line bg-ink px-3 py-0 transition focus-within:border-cyan focus-within:ring-2 focus-within:ring-cyan/20">
          <Github size={18} className="text-cyan" />
          <Field name="github_url" className="border-0 bg-transparent px-0 focus:ring-0" defaultValue="https://github.com/pk1427/GrantFlow-Ai" required />
        </div>
        <span className="text-xs text-slate-500">Public GitHub repository used by the verification agent.</span>
      </label>
      <label className="grid gap-2">
        <span className="text-sm text-slate-300">Deployment URL</span>
        <div className="flex items-center gap-2 rounded-md border border-line bg-ink px-3 py-0 transition focus-within:border-cyan focus-within:ring-2 focus-within:ring-cyan/20">
          <Rocket size={18} className="text-cyan" />
          <Field name="deployment_url" className="border-0 bg-transparent px-0 focus:ring-0" defaultValue="https://grant-flow-ai-web.vercel.app" required />
        </div>
        <span className="text-xs text-slate-500">Live app URL checked by the deployment agent.</span>
      </label>
      {error ? <p className="rounded-md border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}
      {submission ? (
        <p className="rounded-md border border-success/40 bg-success/10 p-3 text-sm text-success">
          Verification complete: {submission.ai_score}% confidence, risk {submission.risk_score}/100.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button disabled={pending} type="submit">{pending ? "Verifying" : "Run AI verification"}</Button>
        <LinkButton href={`/reports/${milestoneId}`} className="border border-line bg-transparent text-slate-100 hover:bg-panel">
          Open generated report
        </LinkButton>
      </div>
    </form>
  );
}
