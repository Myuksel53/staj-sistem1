"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const yol = usePathname();
  const aktif = href === "/" ? yol === "/" : yol === href || yol.startsWith(`${href}/`);
  return (
    <Link href={href} aria-current={aktif ? "page" : undefined}
      className={`rounded-lg border px-3.5 py-1.5 text-sm transition ${aktif ? "border-primary-line bg-surface font-bold text-primary shadow-sm" : "border-transparent font-medium text-ink-mute hover:bg-surface hover:text-ink"}`}>
      {children}
    </Link>
  );
}
