import Link from "next/link";
import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "./LocaleSwitcher";
import ThemeToggle from "./ThemeToggle";

export default async function SiteHeader({ locale }) {
  const t = await getTranslations("nav");

  return (
    <header className="container">
      <div className="nav">
        <Link className="brand" href={`/${locale}`}>
          riz1.dev
        </Link>
        <nav className="nav-links">
          <Link className="nav-link" href={`/${locale}`}>
            {t("home")}
          </Link>
          <Link className="nav-link" href={`/${locale}/blog`}>
            {t("blog")}
          </Link>
          <Link className="nav-link" href={`/${locale}/dsa`}>
            {t("algorithms")}
          </Link>
          <Link className="nav-link" href={`/${locale}/links`}>
            {t("links")}
          </Link>
        </nav>
        <div className="nav-links">
          <ThemeToggle />
          <LocaleSwitcher locale={locale} />
        </div>
      </div>
    </header>
  );
}
