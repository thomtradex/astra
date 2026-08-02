import { getSecurityAlerts } from '@/lib/security';

export default async function SecurityAlertsPage() {
  const alerts = await getSecurityAlerts();

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Security Alerts
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Security incidents and suspicious activity.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {!alerts?.items.length ? (
          <p className="text-sm text-muted-foreground">
            No security alerts found.
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.items.map((alert) => (
              <div
                key={alert.id}
                className="rounded border p-3"
              >
                <p className="font-medium">
                  {alert.title}
                </p>

                <p className="text-sm text-muted-foreground">
                  {alert.severity}
                </p>

                <p className="text-xs text-muted-foreground">
                  {alert.createdAt}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
