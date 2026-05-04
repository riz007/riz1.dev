import { getTranslations } from "next-intl/server";
import { capabilityCards, experience, skills } from "../../data/profile";
import Link from "next/link";

const BASE = "https://riz1.dev";

export async function generateMetadata({ params: { locale } }) {
  return {
    title: "Rizwanul Islam Rudra — Forward Deployed AI Engineer",
    description:
      "Forward Deployed AI Engineer and Tech Lead specializing in agentic AI systems, RAG pipelines, LLM integration, and scalable product engineering. Based in Bangkok.",
    alternates: {
      canonical: `${BASE}/en`,
      languages: {
        "x-default": `${BASE}/en`,
        en: `${BASE}/en`,
        bn: `${BASE}/bn`,
        th: `${BASE}/th`,
        zh: `${BASE}/zh`,
        de: `${BASE}/de`,
      },
    },
    openGraph: {
      type: "profile",
      firstName: "Rizwanul",
      lastName: "Rudra",
      url: `${BASE}/${locale}`,
    },
  };
}

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Rizwanul Islam Rudra",
  url: BASE,
  jobTitle: "Forward Deployed AI Engineer",
  description:
    "Forward Deployed AI Engineer and Tech Lead specializing in agentic AI systems, RAG pipelines, LLM integration, and scalable product engineering.",
  sameAs: [
    "https://github.com/riz007",
    "https://dev.to/riz007",
    "https://hashnode.com/@rizwanulrudra",
    "https://ieeexplore.ieee.org/document/10202106",
  ],
  knowsAbout: [
    "Generative AI",
    "Agentic AI Systems",
    "Retrieval-Augmented Generation",
    "LLM Integration",
    "System Design",
    "Distributed Systems",
    "React",
    "Vue.js",
    "TypeScript",
    "Python",
    "Node.js",
  ],
  worksFor: {
    "@type": "Organization",
    name: "Codeifai Ltd.",
  },
};

export default async function HomePage({ params: { locale } }) {
  const t = await getTranslations("home");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <div className="fade-in">
        {/* ── Hero ─────────────────────────────────────── */}
        <section className="hero">
          <span className="hero-bg-num" aria-hidden="true">
            01
          </span>
          <div className="hero-inner">
            <p className="hero-eyebrow">{t("eyebrow")}</p>
            <h1 className="hero-title">
              Rizwanul
              <br />
              Islam
              <br />
              <em>Rudra</em>
            </h1>
            <p className="hero-sub">{t("subtitle")}</p>
            <div className="hero-ctas">
              <Link className="btn btn-primary" href={`/${locale}/blog`}>
                {t("ctaPrimary")}
              </Link>
              <Link className="btn btn-ghost" href={`/${locale}/links`}>
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>

          {/* Skills ticker */}
          <div className="skills-marquee-wrap">
            <div className="skills-marquee" aria-hidden="true">
              {[...skills, ...skills].map((skill, i) => (
                <span className="skill-tick" key={i}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Capabilities ─────────────────────────────── */}
        <section className="section">
          <div className="section-eyebrow">
            <span className="section-eyebrow-num">02</span>
            <hr className="section-eyebrow-line" />
          </div>
          <h2 className="section-h">{t("capabilitiesTitle")}</h2>
          <p className="section-lead">{t("capabilitiesBody")}</p>
          <div className="cap-grid">
            {capabilityCards.map((card, i) => (
              <div className="cap-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <span className="cap-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Experience ───────────────────────────────── */}
        <section className="section">
          <div className="section-eyebrow">
            <span className="section-eyebrow-num">03</span>
            <hr className="section-eyebrow-line" />
          </div>
          <h2 className="section-h">{t("experienceTitle")}</h2>
          <p className="section-lead">{t("experienceBody")}</p>
          <div className="exp-list">
            {experience.map((item) => (
              <div className="exp-item" key={`${item.role}-${item.company}`}>
                <p className="exp-range">{item.range}</p>
                <p className="exp-role">{item.role}</p>
                <p className="exp-company">{item.company}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
