import Link from "next/link";
import { Container } from "@/components/ui";
import { CALCS } from "@/lib/calculators";

export default function NotFound() {
  return (
    <Container className="py-20 text-center">
      <h1 className="font-display text-3xl font-semibold text-ink">Page not found</h1>
      <p className="mx-auto mt-2 max-w-md text-ink-soft">
        That page doesn't exist. Try one of our deck calculators instead:
      </p>
      <div className="mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-2">
        {CALCS.map((c) => (
          <Link key={c.slug} href={`/calculators/${c.slug}`}
            className="rounded-full border border-line bg-card px-3 py-1 text-sm text-ink-soft hover:border-rust-line">
            {c.name}
          </Link>
        ))}
        <Link href="/" className="rounded-full bg-rust px-3 py-1 text-sm font-medium text-white hover:bg-rust-dark">
          Home
        </Link>
      </div>
    </Container>
  );
}
