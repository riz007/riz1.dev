import { getTranslations } from "next-intl/server";
import { ComplexityChart, AlgorithmsInAI, WhyItStillMatters } from "../../../components/DsaVisuals";

const BASE = "https://riz1.dev";

export async function generateMetadata({ params: { locale } }) {
  return {
    title: "Data Structures & Algorithms",
    description:
      "Data structures and algorithms explained for modern software engineers and AI systems builders — complexity analysis, why DSA powers AI, and interactive visualizations.",
    alternates: {
      canonical: `${BASE}/en/dsa`,
      languages: {
        "x-default": `${BASE}/en/dsa`,
        en: `${BASE}/en/dsa`,
        bn: `${BASE}/bn/dsa`,
        th: `${BASE}/th/dsa`,
        zh: `${BASE}/zh/dsa`,
        de: `${BASE}/de/dsa`,
      },
    },
    openGraph: {
      type: "article",
      url: `${BASE}/${locale}/dsa`,
      title: "Data Structures & Algorithms — Rizwanul Islam Rudra",
      description:
        "Complexity analysis, why DSA still matters in the AI age, and how classical algorithms power modern AI systems.",
    },
  };
}

export default async function DsaPage() {
  const t = await getTranslations("dsa");

  return (
    <div className="fade-in">
      <div className="section-eyebrow">
        <span className="section-eyebrow-num">DSA</span>
        <hr className="section-eyebrow-line" />
      </div>
      <h1 className="section-h">{t("title")}</h1>
      <p className="section-lead">{t("lead")}</p>

      <ComplexityChart />
      <WhyItStillMatters />
      <AlgorithmsInAI />

      <div className="dsa-body" style={{ marginTop: "40px" }}>
        {[t("body1"), t("body2"), t("body3")].map((body, i) => (
          <div className="dsa-item" key={i}>
            <span className="dsa-num">{String(i + 1).padStart(2, "0")}</span>
            <p className="dsa-text">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
