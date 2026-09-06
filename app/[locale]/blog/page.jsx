import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { getAllTags, getPostsIndex } from "../../../lib/posts";

const BASE = "https://riz1.dev";
const LOCALES = ["en", "bn", "th", "zh", "de"];

export async function generateMetadata({ params: { locale } }) {
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, `${BASE}/${l}/blog`])
  );
  return {
    title: "Writing",
    description:
      "Technical blog on frontend architecture, AI-powered applications, system design, and engineering leadership by Rizwanul Islam Rudra.",
    alternates: {
      // this route's copy is genuinely translated, so each locale is its own
      // indexable page — a canonical pointing at /en would cancel the hreflang set
      canonical: `${BASE}/${locale}/blog`,
      languages: { "x-default": `${BASE}/en/blog`, ...languages },
      types: {
        "application/rss+xml": [
          { url: `${BASE}/feed.xml`, title: "riz1.dev — Writing" },
        ],
      },
    },
    openGraph: {
      type: "website",
      url: `${BASE}/${locale}/blog`,
      title: "Writing — Rizwanul Islam Rudra",
      description:
        "Technical blog on frontend architecture, AI-powered applications, system design, and engineering leadership.",
    },
  };
}

export default async function BlogPage({ params: { locale } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations("blog");
  const [posts, tags] = await Promise.all([getPostsIndex(), getAllTags()]);

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "riz1.dev Writing",
      url: `${BASE}/${locale}/blog`,
      author: { "@type": "Person", name: "Rizwanul Islam Rudra", url: BASE },
      blogPost: posts.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description || "",
        datePublished: post.isoDateTime,
        url: `${BASE}/en/blog/${post.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/${locale}` },
        { "@type": "ListItem", position: 2, name: "Writing", item: `${BASE}/${locale}/blog` },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="fade-in">
        <div className="blog-hd">
          <h1 className="section-h">{t("title")}</h1>
          <p className="section-lead" style={{ marginBottom: 0 }}>
            {t("subtitle")}
          </p>
        </div>

        {tags.length > 0 && (
          <nav className="tag-bar" aria-label="Topics">
            {tags.map((tag) => (
              <Link className="tag-chip" href={`/${locale}/blog/tag/${tag.slug}`} key={tag.slug}>
                {tag.name} <span>{tag.count}</span>
              </Link>
            ))}
            <a className="tag-chip feed" href="/feed.xml">RSS</a>
          </nav>
        )}

        <div role="list">
          {posts.map((post) => (
            <Link
              role="listitem"
              className="post-row"
              href={`/${locale}/blog/${post.slug}`}
              key={post.slug}
            >
              <span className="post-row-date">
                {post.isoDate ? (
                  <time dateTime={post.isoDate}>{post.date}</time>
                ) : null}
              </span>
              <div>
                <h2 className="post-row-title">{post.title}</h2>
                {post.description && (
                  <p className="post-row-desc">{post.description}</p>
                )}
                <p className="post-row-meta">{post.readingTime} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
