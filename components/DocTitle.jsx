"use client";

import { usePathname } from "next/navigation";

export default function DocTitle() {
  const path = (usePathname() || "").split("/").slice(2).join("/");
  return (
    <div className="titlebar" aria-hidden="true">
      <span>~/{path}</span>
    </div>
  );
}
