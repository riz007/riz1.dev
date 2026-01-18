import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Algorithms"
};

export default async function DsaPage() {
  const t = await getTranslations("dsa");

  return (
    <section className="fade-in">
      <h1 className="section-title">{t("title")}</h1>
      <p className="section-lede">{t("lead")}</p>
      <div className="card">
        <p>{t("body1")}</p>
        <p>{t("body2")}</p>
        <p>{t("body3")}</p>
      </div>
    </section>
  );
}
