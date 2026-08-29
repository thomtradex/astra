import Link from 'next/link';

export function MarketingHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-semibold text-astra-950">
          Astra
        </Link>

        <nav className="flex gap-6 text-sm text-astra-700">
          <Link href="/enterprise">
            Enterprise
          </Link>

          <Link href="/demo">
            Demo
          </Link>

          <Link href="/login">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
