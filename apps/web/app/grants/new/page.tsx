import { Card } from "@/components/ui";
import { CreateGrantForm } from "@/components/create-grant-form";

export default function CreateGrantPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="text-sm text-cyan">Create grant</p>
      <h1 className="mt-2 text-3xl font-bold tracking-normal">Lock milestone funding</h1>
      <Card className="mt-6">
        <CreateGrantForm />
      </Card>
    </div>
  );
}
