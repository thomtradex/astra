'use client';

import { useState } from 'react';
import { disableUser } from '@/lib/users';

interface Props {
  id: string;
}

export default function DisableUserButton({
  id,
}: Props) {

  const [loading, setLoading] = useState(false);

  async function disable() {
    setLoading(true);

    await disableUser(id);

    window.location.reload();
  }


  return (
    <button
      onClick={disable}
      disabled={loading}
      className="rounded border border-destructive px-3 py-1 text-sm text-destructive"
    >
      {loading ? 'Disabling...' : 'Disable'}
    </button>
  );
}
