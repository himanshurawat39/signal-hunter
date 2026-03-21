import Link from "next/link";

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/shipping-delivery", label: "Shipping & Delivery" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>Signal Hunter legal and billing information.</p>
        <nav className="flex flex-wrap gap-4">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-cyan-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
