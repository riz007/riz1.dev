import { locales } from "../i18n/routing";

export const BASE = "https://riz1.dev";
export const NAME = "Rizwanul Islam Rudra";

const OG_LOCALES = { en: "en_US", bn: "bn_BD", th: "th_TH", zh: "zh_CN", de: "de_DE" };
const FEED = { "application/rss+xml": [{ url: `${BASE}/feed.xml`, title: "riz1.dev — Writing" }] };

/* Next merges metadata shallowly, so each page needs the complete objects.
   `translated: false` is for English-only content: canonical /en, no hreflang. */
export function pageMetadata({ locale, path = "", title, description, type = "website", translated = true, openGraph }) {
  const canonical = `${BASE}/${translated ? locale : "en"}${path}`;
  const shareTitle = typeof title === "string" ? `${title} — ${NAME}` : title.absolute;
  return {
    title,
    description,
    alternates: {
      canonical,
      types: FEED,
      ...(translated && {
        languages: {
          "x-default": `${BASE}/en${path}`,
          ...Object.fromEntries(locales.map((l) => [l, `${BASE}/${l}${path}`])),
        },
      }),
    },
    openGraph: {
      type,
      siteName: "riz1.dev",
      locale: OG_LOCALES[locale],
      url: canonical,
      title: shareTitle,
      description,
      ...openGraph,
    },
    twitter: { card: "summary_large_image", creator: "@riz007", title: shareTitle, description },
  };
}
