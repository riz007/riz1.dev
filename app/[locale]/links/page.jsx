import { getTranslations, setRequestLocale } from "next-intl/server";
import links from "../../../data/links.json";
import { pageMetadata } from "../../../lib/seo";

const BASE = "https://riz1.dev";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: "/links",
    title: "Links",
    description:
      "Curated resources on AI engineering, agentic systems, software architecture and engineering craft that Rizwanul Islam Rudra keeps returning to.",
  });
}

export default async function LinksPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("links");

  return (
    <div className="fade-in">
      <h1 className="section-h">{t("title")}</h1>
      <p className="section-lead">{t("subtitle")}</p>

      <div className="links-grid">
        {links.map((link) => (
          <a
            className="link-card"
            href={link.url}
            key={link.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="link-card-arrow" aria-hidden="true">↗</span>
            <p className="link-card-title">{link.title}</p>
            {link.description && (
              <p className="link-card-desc">{link.description}</p>
            )}
            <p className="link-card-url">{link.url}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
