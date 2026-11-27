import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComplexityChart, AlgorithmsInAI, WhyItStillMatters } from "../../../components/DsaVisuals";
import { pageMetadata } from "../../../lib/seo";

const BASE = "https://riz1.dev";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: "/dsa",
    title: "Data Structures & Algorithms",
    description:
      "Data structures and algorithms for software engineers and AI builders: complexity analysis, why they power AI, and visual explanations.",
  });
}

export default async function DsaPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dsa");

  return (
    <div className="fade-in">
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
