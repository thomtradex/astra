'use client';

import { useState } from 'react';
import {
  assignUserRole,
  removeUserRole,
} from '@/lib/users';

interface Role {
  id: string;
  name: string;
}

interface Props {
  userId: string;
  roles: Role[];
}

const availableRoles: Role[] = [
  {
    id: 'admin',
    name: 'admin',
  },
  {
    id: 'user',
    name: 'user',
  },
];

export default function UserRoles({
  userId,
  roles,
}: Props) {

  const [loading, setLoading] = useState(false);

  async function addRole(roleId: string) {
    setLoading(true);

    await assignUserRole(
      userId,
      roleId,
    );

    window.location.reload();
  }

  async function deleteRole(roleId: string) {
    setLoading(true);

    await removeUserRole(
      userId,
      roleId,
    );

    window.location.reload();
  }

  return (
    <div className="mt-3 space-y-2 rounded border p-3">

      <p className="text-sm font-medium">
        Roles
      </p>

      <div className="space-y-1">
        {roles.map((role) => (
          <div
            key={role.id}
            className="flex items-center justify-between"
          >
            <span className="text-sm">
              {role.name}
            </span>

            <button
              disabled={loading}
              onClick={() => deleteRole(role.id)}
              className="text-xs text-destructive"
            >
              Remove
            </button>
          </div>
        ))}
      </div>


      <div className="flex gap-2 pt-2">
        {availableRoles
          .filter(
            (role) =>
              !roles.some(
                (r) => r.id === role.id,
              ),
          )
          .map((role) => (
            <button
              key={role.id}
              disabled={loading}
              onClick={() => addRole(role.id)}
              className="rounded border px-2 py-1 text-xs"
            >
              Add {role.name}
            </button>
          ))}
      </div>

    </div>
  );
}
