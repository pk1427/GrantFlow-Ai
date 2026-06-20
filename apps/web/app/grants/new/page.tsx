import { Card, PageShell, SectionHeader } from "@/components/ui";
import { CreateGrantForm } from "@/components/create-grant-form";

export default function CreateGrantPage() {
  return (
    <PageShell className="max-w-4xl">
      <SectionHeader eyebrow="Create grant" title="Lock milestone funding">
        Define the milestone, reward, and builder account. The backend funding agent records the grant and prepares escrow release state.
      </SectionHeader>
      <Card className="mt-6 p-6">
        <CreateGrantForm />
      </Card>
    </PageShell>
  );
}
