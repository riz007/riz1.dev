import "./globals.css";

const BASE_URL = "https://riz1.dev";

export const metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "Rizwanul Islam Rudra — Senior Software Engineer & Technical Lead",
    template: "%s | Rizwanul Islam Rudra",
  },

  description:
    "Senior software engineer and technical lead in Bangkok with 10+ years across the software lifecycle. Frontend architecture, design systems, and AI-powered product experiences with TypeScript, Vue, React, and LLMs.",

  keywords: [
    "Senior Software Engineer",
    "Frontend Technical Lead",
    "Frontend Architecture",
    "Design Systems",
    "TypeScript",
    "Vue.js",
    "React",
    "Next.js",
    "AI-Powered Applications",
    "RAG Systems",
    "LLM Integration",
    "Agentic AI",
    "Engineering Leadership",
    "Tech Lead Bangkok",
    "Rizwanul Islam Rudra",
  ],

  authors: [{ name: "Rizwanul Islam Rudra", url: BASE_URL }],
  creator: "Rizwanul Islam Rudra",
  publisher: "Rizwanul Islam Rudra",
  category: "technology",
  classification: "Software Engineering, AI Engineering",

  formatDetection: { email: false, address: false, telephone: false },

  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["bn_BD", "de_DE", "th_TH", "zh_CN"],
    url: BASE_URL,
    siteName: "riz1.dev",
    title: "Rizwanul Islam Rudra — Senior Software Engineer & Technical Lead",
    description:
      "Frontend architecture, design systems, and AI-powered product experiences — built maintainable, performant, and accessible. 10+ years, based in Bangkok.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Rizwanul Islam Rudra — Senior Software Engineer & Technical Lead",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Rizwanul Islam Rudra — Senior Software Engineer & Technical Lead",
    description:
      "Frontend architecture, design systems, and AI-powered product experiences — 10+ years, based in Bangkok.",
    images: ["/opengraph-image"],
    creator: "@riz007",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: `${BASE_URL}/en`,
    types: {
      "application/rss+xml": [
        { url: `${BASE_URL}/feed.xml`, title: "riz1.dev — Writing" },
      ],
    },
    languages: {
      "x-default": `${BASE_URL}/en`,
      en: `${BASE_URL}/en`,
      bn: `${BASE_URL}/bn`,
      th: `${BASE_URL}/th`,
      zh: `${BASE_URL}/zh`,
      de: `${BASE_URL}/de`,
    },
  },
};

/* The <html> element lives in app/[locale]/layout.jsx so `lang` can carry the
   real locale — a single hardcoded lang="en" mislabels every translated page
   for both search engines and screen readers. This layout is the required
   root wrapper and deliberately renders nothing of its own. */
export default function RootLayout({ children }) {
  return children;
}
