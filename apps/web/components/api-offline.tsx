import { Card, LinkButton } from "@/components/ui";

export function ApiOffline({ title = "Backend API unavailable" }: { title?: string }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Start the backend with `npm run dev:api`, then refresh this page. The frontend reads grants,
          verification reports, and indexed Casper transaction state from the API.
        </p>
        <LinkButton href="/" className="mt-5">Back home</LinkButton>
      </Card>
    </div>
  );
}
