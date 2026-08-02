import { getUsers } from '@/lib/users';
import CreateUserForm from './create-user-form';
import EditUserForm from './edit-user-form';

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          Users
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage users, roles and permissions.
        </p>
      </header>

      <CreateUserForm />

      <section className="rounded-xl border border-border bg-card p-6">
        {!users?.items.length ? (
          <p className="text-sm text-muted-foreground">
            No users found.
          </p>
        ) : (
          <div className="space-y-3">
            {users.items.map((user) => (
              <div
                key={user.id}
                className="rounded border p-3"
              >
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>

                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>

                <p className="text-xs">
                  {user.roles.join(', ')}
                </p>

                <EditUserForm
                  id={user.id}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  email={user.email}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
