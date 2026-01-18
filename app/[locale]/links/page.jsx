import { getTranslations } from "next-intl/server";
import links from "../../../data/links.json";

export const metadata = {
  title: "Links"
};

export default async function LinksPage() {
  const t = await getTranslations("links");

  return (
    <section className="fade-in">
      <h1 className="section-title">{t("title")}</h1>
      <p className="section-lede">{t("subtitle")}</p>
      <div className="grid cols-2">
        {links.map((link) => (
          <a className="card" href={link.url} key={link.url} target="_blank" rel="noreferrer">
            <h3>{link.title}</h3>
            <p className="section-lede">{link.url}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
