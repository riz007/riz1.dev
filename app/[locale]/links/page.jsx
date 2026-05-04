import { getTranslations } from "next-intl/server";
import links from "../../../data/links.json";

const BASE = "https://riz1.dev";

export async function generateMetadata({ params: { locale } }) {
  return {
    title: "Links",
    description:
      "A curated collection of resources on AI engineering, agentic systems, software architecture, and engineering craft — tools and references Rizwanul Islam Rudra finds valuable.",
    alternates: {
      canonical: `${BASE}/en/links`,
      languages: {
        "x-default": `${BASE}/en/links`,
        en: `${BASE}/en/links`,
        bn: `${BASE}/bn/links`,
        th: `${BASE}/th/links`,
        zh: `${BASE}/zh/links`,
        de: `${BASE}/de/links`,
      },
    },
    openGraph: {
      type: "website",
      url: `${BASE}/${locale}/links`,
      title: "Links — Rizwanul Islam Rudra",
      description:
        "Curated resources on AI engineering, agentic systems, software architecture, and engineering craft.",
    },
  };
}

export default async function LinksPage() {
  const t = await getTranslations("links");

  return (
    <div className="fade-in">
      <div className="section-eyebrow">
        <span className="section-eyebrow-num">Links</span>
        <hr className="section-eyebrow-line" />
      </div>
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
