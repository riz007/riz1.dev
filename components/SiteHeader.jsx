import Link from "next/link";
import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "./LocaleSwitcher";
import ThemeToggle from "./ThemeToggle";
import PaletteSwitcher from "./PaletteSwitcher";

/* The wordmark is a link, not an <h1> — each page has its own content <h1>. */
export default async function SiteHeader({ locale }) {
  const t = await getTranslations("nav");

  return (
    <header className="mast">
      <div className="mast-inner">
        <p className="mast-line">
          Bangkok · Software engineering, system design &amp; agentic AI
        </p>

        <Link className="mast-name" href={`/${locale}`}>
          riz1.dev
        </Link>

        <div className="mast-bar">
          <nav className="mast-nav" aria-label="Primary">
            <ul>
              <li><Link href={`/${locale}`}>{t("home")}</Link></li>
              <li><Link href={`/${locale}/profile`}>Profile</Link></li>
              <li><Link href={`/${locale}/blog`}>{t("blog")}</Link></li>
              <li><Link href={`/${locale}/dsa`}>{t("algorithms")}</Link></li>
              <li><Link href={`/${locale}/links`}>{t("links")}</Link></li>
            </ul>
          </nav>
          <div className="mast-actions">
            <PaletteSwitcher />
            <ThemeToggle />
            <LocaleSwitcher locale={locale} />
          </div>
        </div>
      </div>
    </header>
  );
}
