"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales } from "../i18n/routing";

function buildPathname(targetLocale, pathname) {
  const segments = pathname.split("/");

  if (segments.length > 1 && locales.includes(segments[1])) {
    segments[1] = targetLocale;
  } else {
    segments.splice(1, 0, targetLocale);
  }

  const nextPath = segments.join("/");
  return nextPath === "" ? "/" : nextPath;
}

export default function LocaleSwitcher({ locale }) {
  const pathname = usePathname() || "/";

  return (
    <div className="language-switcher">
      {locales.map((item) => (
        <Link
          key={item}
          className={`language-chip ${item === locale ? "active" : ""}`}
          href={buildPathname(item, pathname)}
        >
          {item}
        </Link>
      ))}
    </div>
  );
}
