import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function SiteFooter({ locale = "en" }) {
  const t = await getTranslations("footer");

  return (
    <footer className="foot">
      <div className="foot-inner">
        <div className="foot-mark">
          <Link className="foot-name" href={`/${locale}`}>riz1.dev</Link>
          <p className="foot-tag">
            Writing and work by Rizwanul Islam Rudra — Bangkok.
          </p>
          <p className="foot-copy">{t("copyright")}</p>
        </div>

        <nav className="foot-nav" aria-label="Footer">
          <div className="foot-col">
            <h2 className="foot-h">Site</h2>
            <ul>
              <li><Link href={`/${locale}/profile`}>Profile</Link></li>
              <li><Link href={`/${locale}/blog`}>Writing</Link></li>
              <li><Link href={`/${locale}/dsa`}>Algorithms</Link></li>
              <li><Link href={`/${locale}/links`}>Links</Link></li>
              <li><a href="/feed.xml">RSS</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h2 className="foot-h">Elsewhere</h2>
            <ul>
              <li><a href="mailto:rizwanulrudra@gmail.com">Email</a></li>
              <li><a href="https://www.linkedin.com/in/rizwanulrudra/" target="_blank" rel="noreferrer">LinkedIn</a></li>
              <li><a href="https://github.com/riz007" target="_blank" rel="noreferrer">GitHub</a></li>
              <li><a href="https://dev.to/riz007" target="_blank" rel="noreferrer">Dev.to</a></li>
              <li><a href="https://ieeexplore.ieee.org/document/10202106" target="_blank" rel="noreferrer">IEEE</a></li>
            </ul>
          </div>
        </nav>
      </div>
    </footer>
  );
}
