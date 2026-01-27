import { getTranslations } from "next-intl/server";
import { capabilityCards, experience, skills } from "../../data/profile";
import Link from "next/link";

export default async function HomePage({ params: { locale } }) {
  const t = await getTranslations("home");

  return (
    <div className="fade-in">
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">{t("eyebrow")}</p>
          <h1 className="hero-title">{t("title")}</h1>
          <p className="hero-subtitle">{t("subtitle")}</p>
          <div className="hero-actions">
            <Link className="button primary" href={`/${locale}/blog`}>
              {t("ctaPrimary")}
            </Link>
            <Link className="button secondary" href={`/${locale}/links`}>
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>
        <div className="card hero-card stagger">
          <p className="section-title" style={{ marginBottom: "8px" }}>
            {t("focusTitle")}
          </p>
          <p className="section-lede">{t("focusBody")}</p>
          <div className="pill-grid">
            {skills.map((skill) => (
              <span className="pill" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">{t("capabilitiesTitle")}</h2>
        <p className="section-lede">{t("capabilitiesBody")}</p>
        <div className="grid cols-3 stagger capability-grid">
          {capabilityCards.map((card) => (
            <div className="card capability-card" key={card.title}>
              <h3>{card.title}</h3>
              <p className="section-lede">{card.description}</p>
            </div>
          ))}
        </div>
      </section>


      <section className="section">
        <h2 className="section-title">{t("experienceTitle")}</h2>
        <p className="section-lede">{t("experienceBody")}</p>
        <div className="grid cols-2 experience-grid">
          {experience.map((item) => (
            <div className="card experience-item" key={`${item.role}-${item.company}`}>
              <h3>{item.role}</h3>
              <p className="section-lede">{item.company}</p>
              <p className="blog-meta">{item.range}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
