import "./globals.css";
import { Fraunces, DM_Sans } from "next/font/google";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

const BASE_URL = "https://riz1.dev";

export const metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "Rizwanul Islam Rudra — Forward Deployed AI Engineer",
    template: "%s | Rizwanul Islam Rudra",
  },

  description:
    "Forward Deployed AI Engineer and Tech Lead specializing in agentic AI systems, RAG pipelines, LLM integration, and scalable product engineering. Based in Bangkok.",

  keywords: [
    "Forward Deployed AI Engineer",
    "Agentic AI",
    "Agentic AI Systems",
    "Agentic Product Engineering",
    "RAG Systems",
    "LLM Integration",
    "Generative AI",
    "Software Engineering Leader",
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
    title: "Rizwanul Islam Rudra — Forward Deployed AI Engineer",
    description:
      "Forward Deployed AI Engineer and Tech Lead specializing in agentic AI systems, RAG pipelines, LLM integration, and scalable product engineering.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Rizwanul Islam Rudra — Forward Deployed AI Engineer",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Rizwanul Islam Rudra — Forward Deployed AI Engineer",
    description:
      "Forward Deployed AI Engineer and Tech Lead specializing in agentic AI systems, RAG pipelines, and scalable product engineering.",
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

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
