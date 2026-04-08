import Link from "next/link";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Metagames", href: "/metagames" },
  { label: "Admin", href: "/admin" },
  { label: "Feedback", href: "/feedback" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border py-6 text-sm text-text-muted">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4">
        <span>© {new Date().getFullYear()} MTG Metagames</span>
        <nav className="flex gap-4">
          {LINKS.map(({ label, href }) => (
            <Link key={href} href={href} className="transition-colors hover:text-text">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
