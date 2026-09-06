import Link from "next/link";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { capabilityCards, experience, skills } from "../../../data/profile";
import { projects } from "../../../data/projects";
import { getPostsIndex } from "../../../lib/posts";
import ProfileArticle from "../../../components/ProfileArticle";
import { identityFor } from "../../../data/identity";

const BASE = "https://riz1.dev";
const LOCALES = ["en", "bn", "th", "zh", "de"];

/* The plain-HTML counterpart to RudraOS: the same person, the same content,
   rendered as an ordinary document. Linked from the desktop's menu bar and
   hero, and the page that carries the homepage's topical weight. */
export async function generateMetadata({ params: { locale } }) {
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, `${BASE}/${l}/profile`])
  );
  return {
    title: "Profile",
    description:
      "Rizwanul Islam Rudra — senior software engineer and technical lead in Bangkok. Software engineering and system design, agentic AI systems, and the technical leadership to ship them. 10+ years across the software lifecycle.",
    alternates: {
      canonical: `${BASE}/${locale}/profile`,
      languages: { "x-default": `${BASE}/en/profile`, ...languages },
    },
    openGraph: {
      type: "profile",
      firstName: "Rizwanul",
      lastName: "Rudra",
      url: `${BASE}/${locale}/profile`,
      title: "Rizwanul Islam Rudra — Senior Software Engineer & Technical Lead",
      description:
        "Software engineering and system design, agentic AI systems, and engineering leadership — 10+ years, based in Bangkok.",
    },
  };
}

export default async function ProfilePage({ params: { locale } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations("home");
  const tb = await getTranslations("blog");
  const td = await getTranslations("dsa");
  const posts = await getPostsIndex();
  const identity = identityFor(t("subtitle"));

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      url: `${BASE}/${locale}/profile`,
      mainEntity: { "@type": "Person", name: identity.name, "@id": `${BASE}/#person` },
      inLanguage: locale,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/${locale}` },
        { "@type": "ListItem", position: 2, name: "Profile", item: `${BASE}/${locale}/profile` },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <p className="view-switch">
        <Link href={`/${locale}`}>
          <span aria-hidden="true">←</span> Launch RudraOS
        </Link>
      </p>
      <ProfileArticle
        locale={locale}
        identity={identity}
        experience={experience}
        capabilities={capabilityCards}
        skills={skills}
        projects={projects}
        posts={posts}
        copy={{
          ctaPrimary: tb("title"),
          ctaSecondary: t("ctaSecondary"),
          focusTitle: t("focusTitle"),
          focusBody: t("focusBody"),
          capabilitiesTitle: t("capabilitiesTitle"),
          capabilitiesBody: t("capabilitiesBody"),
          experienceTitle: t("experienceTitle"),
          experienceBody: t("experienceBody"),
          blogTitle: tb("title"),
          blogSubtitle: tb("subtitle"),
          dsaTitle: td("title"),
        }}
      />
    </>
  );
}
