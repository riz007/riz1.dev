import { getTranslations } from "next-intl/server";

export default async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="container footer">
      <p className="footer-copy">{t("copyright")}</p>
      <nav className="footer-nav" aria-label="Social links">
        <a href="https://github.com/riz007" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="https://dev.to/riz007" target="_blank" rel="noreferrer">
          Dev.to
        </a>
        <a href="https://hashnode.com/@rizwanulrudra" target="_blank" rel="noreferrer">
          Hashnode
        </a>
        <a href="https://ieeexplore.ieee.org/document/10202106" target="_blank" rel="noreferrer">
          IEEE
        </a>
      </nav>
    </footer>
  );
}
