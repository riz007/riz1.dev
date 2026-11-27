"use client";

import { usePathname } from "next/navigation";
import DocTitle from "./DocTitle";

/* The home route is the desktop itself, so it gets no site chrome. */
export default function SiteShell({ header, footer, children }) {
  const isDesktop = (usePathname() || "").split("/").filter(Boolean).length <= 1;
  if (isDesktop) return children;
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="shell">
        {header}
        <main className="container doc" id="main" tabIndex={-1}>
          <DocTitle />
          <div className="page">{children}</div>
        </main>
        {footer}
      </div>
    </>
  );
}
