import { UserListItem } from '@/lib/users';

interface UsersTableProps {
  users: UserListItem[];
}

export function UsersTable({
  users,
}: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-astra-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-astra-200 bg-astra-50">
          <tr>
            <th className="px-6 py-4 text-left">
              Nome
            </th>

            <th className="px-6 py-4 text-left">
              Email
            </th>

            <th className="px-6 py-4 text-left">
              Roles
            </th>

            <th className="px-6 py-4 text-left">
              Estado
            </th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-astra-100"
            >
              <td className="px-6 py-4 font-medium">
                {user.firstName} {user.lastName}
              </td>

              <td className="px-6 py-4">
                {user.email}
              </td>

              <td className="px-6 py-4">
                {user.roles.join(', ') || '-'}
              </td>

              <td className="px-6 py-4">
                {user.isActive
                  ? 'Activo'
                  : 'Inactivo'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
