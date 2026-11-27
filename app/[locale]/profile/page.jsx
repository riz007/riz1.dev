import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { capabilityCards, experience, skills } from "../../../data/profile";
import { projects } from "../../../data/projects";
import { getPostsIndex } from "../../../lib/posts";
import ProfileArticle from "../../../components/ProfileArticle";
import { identityFor } from "../../../data/identity";
import { pageMetadata } from "../../../lib/seo";

const BASE = "https://riz1.dev";
const LOCALES = ["en", "bn", "th", "zh", "de"];

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: "/profile",
    title: "Profile",
    description:
      "Experience, capabilities and open-source work of Rizwanul Islam Rudra: senior software engineer and technical lead in Bangkok with 10+ years.",
    type: "profile",
    openGraph: { firstName: "Rizwanul", lastName: "Rudra" },
  });
}

export default async function ProfilePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
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
          dsaTitle: t("ctaTertiary"),
        }}
      />
    </>
  );
}
