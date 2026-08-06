import { notFound } from 'next/navigation';

import { getUser } from '@/lib/users.server';
import { getUserAudit } from '@/lib/audit.server';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage({
  params,
}: Props) {

  const { id } = await params;

  const user = await getUser(id);

  if (!user) {
    notFound();
  }

  const audit = await getUserAudit(id);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 p-8">

      <section className="rounded-xl border p-6">
        <h1 className="text-3xl font-bold">
          {user.firstName} {user.lastName}
        </h1>

        <p className="text-sm text-muted-foreground">
          {user.email}
        </p>

        <p className="mt-3 text-sm">
          Status:
          {' '}
          {user.isActive ? 'Active' : 'Disabled'}
        </p>

        <p className="mt-2 text-sm">
          Roles:
          {' '}
          {user.roles.join(', ')}
        </p>
      </section>


      <section className="rounded-xl border p-6">

        <h2 className="mb-4 text-xl font-semibold">
          Audit Timeline
        </h2>

        {!audit?.items.length ? (
          <p className="text-sm text-muted-foreground">
            No activity found.
          </p>
        ) : (

          <div className="space-y-3">

            {audit.items.map((item) => (

              <div
                key={item.id}
                className="rounded border p-3"
              >

                <p className="font-medium">
                  {item.action}
                </p>

                <p className="text-xs text-muted-foreground">
                  {new Date(
                    item.createdAt,
                  ).toLocaleString()}
                </p>

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}
