import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { capabilityCards, experience, skills } from "../../data/profile";
import { projects } from "../../data/projects";
import { getPostsIndex } from "../../lib/posts";
import links from "../../data/links.json";
import Desktop from "../../components/os/Desktop";
import { identityFor } from "../../data/identity";

const BASE = "https://riz1.dev";

/* Refresh stars + descriptions from GitHub at most once an hour (ISR).
   Falls back silently to the curated static data when offline/rate-limited. */
async function getLiveProjects() {
  try {
    const res = await fetch("https://api.github.com/users/riz007/repos?per_page=100", {
      next: { revalidate: 3600 },
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return projects;
    const repos = await res.json();
    if (!Array.isArray(repos)) return projects;
    const byName = new Map(repos.map((r) => [r.name, r]));
    return projects.map((p) => {
      const live = byName.get(p.repo);
      return live
        ? { ...p, stars: live.stargazers_count ?? p.stars, description: p.description || live.description }
        : p;
    });
  } catch {
    return projects;
  }
}

/* GitHub contribution calendar, rendered as ambient art on the desktop.
   Refreshed every 6 hours; the OS omits the layer when data is unavailable. */
async function getContributions() {
  try {
    const res = await fetch(
      "https://github-contributions-api.jogruber.de/v4/riz007?y=last",
      { next: { revalidate: 21600 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json?.contributions) || json.contributions.length === 0) return null;
    return json.contributions.map((c) => c.level ?? 0);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params: { locale } }) {
  return {
    title: "Rizwanul Islam Rudra — Senior Software Engineer & Technical Lead",
    description:
      "Senior software engineer and technical lead in Bangkok with 10+ years across the software lifecycle — software engineering and system design, agentic AI systems, and the technical leadership to ship them.",
    alternates: {
      canonical: `${BASE}/${locale}`,
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
  jobTitle: "Senior Software Engineer & Technical Lead",
  description:
    "Senior software engineer and technical lead with 10+ years across the software lifecycle — software engineering, system design, agentic AI systems, and engineering leadership. Based in Bangkok.",
  email: "mailto:rizwanulrudra@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangkok",
    addressCountry: "TH",
  },
  sameAs: [
    "https://github.com/riz007",
    "https://www.linkedin.com/in/rizwanulrudra/",
    "https://dev.to/riz007",
    "https://hashnode.com/@rizwanulrudra",
    "https://ieeexplore.ieee.org/document/10202106",
  ],
  knowsAbout: [
    "Frontend Architecture",
    "Design Systems",
    "Web Performance",
    "Accessibility",
    "TypeScript",
    "Vue.js",
    "React",
    "Next.js",
    "Generative AI",
    "Agentic AI Systems",
    "Retrieval-Augmented Generation",
    "LLM Integration",
    "System Design",
    "Distributed Systems",
    "Engineering Leadership",
    "Node.js",
    "Python",
  ],
  worksFor: { "@type": "Organization", name: "Codeifai Ltd." },
};

const SOCIALS = [
  { label: "Email", url: "mailto:rizwanulrudra@gmail.com", display: "rizwanulrudra@gmail.com" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/rizwanulrudra/" },
  { label: "GitHub", url: "https://github.com/riz007" },
  { label: "Dev.to", url: "https://dev.to/riz007" },
  { label: "Hashnode", url: "https://hashnode.com/@rizwanulrudra" },
  { label: "IEEE", url: "https://ieeexplore.ieee.org/document/10202106" },
];

export default async function HomePage({ params: { locale } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations("home");
  const tb = await getTranslations("blog");
  const td = await getTranslations("dsa");
  const [posts, liveProjects, contributions] = await Promise.all([
    getPostsIndex(),
    getLiveProjects(),
    getContributions(),
  ]);

  const data = {
    identity: identityFor(t("subtitle")),
    experience,
    skills,
    capabilities: capabilityCards,
    projects: liveProjects,
    contributions,
    posts,
    links,
    socials: SOCIALS,
    l: {
      blogBase: `/${locale}/blog`,
      dsaBase: `/${locale}/dsa`,
      blogEmpty: "No posts yet — check back soon.",
      dsaTitle: td("title"),
      dsaLead: td("lead"),
      dsaBodies: [td("body1"), td("body2"), td("body3")],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <Desktop locale={locale} data={data} />
    </>
  );
}
