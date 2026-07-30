import { ReactNode } from 'react';

interface Props {
  title: string;
  value: string;
  icon?: ReactNode;
}

export function StatCard({
  title,
  value,
  icon,
}: Props) {
  return (
    <div className="rounded-xl border border-astra-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-astra-500">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-semibold">
            {value}
          </h3>
        </div>

        {icon}
      </div>
    </div>
  );
}