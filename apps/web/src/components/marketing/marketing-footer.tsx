import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-astra-600 md:flex-row md:justify-between">
        <div>
          <p className="font-semibold text-astra-950">Astra</p>
          <p className="mt-2">Operational Decision Intelligence</p>
        </div>

        <nav className="flex flex-wrap gap-5">
          <Link href="/features">Features</Link>

          <Link href="/security">Security</Link>

          <Link href="/pricing">Pricing</Link>

          <Link href="/contact">Contacto</Link>

          <Link href="/privacy">Privacidade</Link>

          <Link href="/terms">Termos</Link>
        </nav>
      </div>
    </footer>
  );
}
