import Link from "next/link";
import { getTranslations } from "next-intl/server";
import SiteNav from "./SiteNav";
import { ColourMenu, LanguageMenu, ThemeButton } from "./Preferences";

/* The wordmark is a link, not an <h1> — each page has its own content <h1>. */
export default async function SiteHeader({ locale }) {
  const t = await getTranslations("nav");
  const items = [
    { href: `/${locale}`, label: t("home"), exact: true },
    { href: `/${locale}/profile`, label: "Profile" },
    { href: `/${locale}/blog`, label: t("blog") },
    { href: `/${locale}/dsa`, label: t("algorithms") },
    { href: `/${locale}/links`, label: t("links") },
  ];

  return (
    <header className="mast">
      <div className="mast-inner">
        <Link className="mast-name" href={`/${locale}`}>
          riz1.dev
        </Link>
        <SiteNav items={items} />
        <div className="prefs">
          <ColourMenu className="retro-btn small" />
          <ThemeButton className="retro-btn small" />
          <LanguageMenu className="retro-btn small" locale={locale} />
        </div>
      </div>
    </header>
  );
}
