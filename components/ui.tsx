// Shared premium UI primitives — single source of truth for page shell rhythm,
// buttons and framed photography. Keeps the "builder's spec-plate" identity
// (warm paper/ink/rust, sharp corners, thin frames) but adds section bands,
// real depth (shadow), and treated photography.
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

type Size = "6xl" | "5xl" | "4xl" | "3xl";
const MAXW: Record<Size, string> = {
  "6xl": "max-w-6xl",
  "5xl": "max-w-5xl",
  "4xl": "max-w-4xl",
  "3xl": "max-w-3xl",
};

export function Container({
  children, size = "6xl", className = "",
}: { children: React.ReactNode; size?: Size; className?: string }) {
  return <div className={`mx-auto w-full ${MAXW[size]} px-5 sm:px-6 ${className}`}>{children}</div>;
}

type Tone = "paper" | "dim" | "ink" | "tint" | "teal";
const TONE: Record<Tone, string> = {
  paper: "",                                   // transparent → shows the page blueprint grid
  dim: "bg-paper-dim",
  tint: "bg-rust-tint",
  teal: "bg-teal text-teal-tint",
  ink: "bg-ink-deep text-paper grid-dark",     // full-bleed dark band
};

// A full-bleed horizontal band. Each page is a stack of these, which is what
// gives the site its premium vertical rhythm instead of one flat sheet.
export function Section({
  children, tone = "paper", size = "6xl", className = "", innerClassName = "", id,
}: {
  children: React.ReactNode; tone?: Tone; size?: Size;
  className?: string; innerClassName?: string; id?: string;
}) {
  const bordered = tone !== "paper";
  return (
    <section id={id} className={`${TONE[tone]} ${bordered ? "border-y border-line/60" : ""} ${className}`}>
      <Container size={size} className={innerClassName}>{children}</Container>
    </section>
  );
}

const BTN: Record<string, string> = {
  primary:
    "bg-rust text-white hover:bg-rust-dark shadow-[0_10px_24px_-12px_rgba(181,65,12,0.7)]",
  onDark:
    "bg-rust text-white hover:bg-rust-dark",
  secondary:
    "border border-ink text-ink hover:bg-ink hover:text-paper",
  secondaryOnDark:
    "border border-paper/40 text-paper hover:bg-paper hover:text-ink",
  ghost: "text-rust hover:text-rust-dark",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-60";

type Variant = keyof typeof BTN;

export function ButtonLink({
  href, children, variant = "primary", className = "",
}: { href: string; children: React.ReactNode; variant?: Variant; className?: string }) {
  return (
    <Link href={href} className={`${BTN_BASE} ${BTN[variant]} ${className}`}>{children}</Link>
  );
}

export function buttonClass(variant: Variant = "primary", className = "") {
  return `${BTN_BASE} ${BTN[variant]} ${className}`;
}

// A framed photograph, lifted off the grid. Uses next/image for responsive
// srcset + lazy-loading. `priority` opts the hero out of lazy-loading (LCP).
export function PhotoPlate({
  src, alt, className = "", imgClassName = "", priority = false, sizes = "100vw", caption,
}: {
  src: StaticImageData | string; alt: string; className?: string; imgClassName?: string;
  priority?: boolean; sizes?: string; caption?: string;
}) {
  return (
    <figure className={`photo-plate ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover ${imgClassName}`}
      />
      {caption && (
        <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-deep/80 to-transparent p-3 font-mono text-[11px] tracking-wide text-paper/80">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// Consistent secondary-page header: optional breadcrumb slot (children),
// eyebrow kicker, display h1 and lead paragraph. Single source of truth so
// every non-home page opens with the same rhythm.
export function PageHeader({
  eyebrow, title, intro, children, className = "",
}: {
  eyebrow?: React.ReactNode; title: React.ReactNode; intro?: React.ReactNode;
  children?: React.ReactNode; className?: string;
}) {
  return (
    <div className={`max-w-3xl ${className}`}>
      {children}
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className="mt-2 font-display text-3xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      {intro && <p className="mt-4 text-lg leading-relaxed text-ink-soft">{intro}</p>}
    </div>
  );
}

// An "eyebrow" label — the small monospaced kicker above section headings.
export function Eyebrow({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  return (
    <p className={`font-mono text-xs font-medium uppercase tracking-[0.2em] ${onDark ? "text-rust-bright" : "text-rust"}`}>
      {children}
    </p>
  );
}
