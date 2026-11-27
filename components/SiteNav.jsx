"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteNav({ items }) {
  const pathname = usePathname() || "";
  return (
    <nav className="mast-nav" aria-label="Primary">
      <ul>
        {items.map(({ href, label, exact }) => {
          const current = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} aria-current={current ? "page" : undefined}>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
