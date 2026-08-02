export default function SecurityControlsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Security Controls
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage authentication and security policies.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Controls
        </h2>

        <p className="mt-3 text-sm text-muted-foreground">
          Security policies, MFA configuration and access controls.
        </p>
      </section>
    </main>
  );
}
