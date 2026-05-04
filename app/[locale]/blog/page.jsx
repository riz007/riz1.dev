import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getAllPosts } from "../../../lib/posts";

const BASE = "https://riz1.dev";

export async function generateMetadata({ params: { locale } }) {
  return {
    title: "Writing",
    description:
      "Technical blog on agentic AI systems, RAG pipelines, software architecture, and forward deployed AI engineering by Rizwanul Islam Rudra.",
    alternates: {
      canonical: `${BASE}/en/blog`,
      languages: {
        "x-default": `${BASE}/en/blog`,
        en: `${BASE}/en/blog`,
        bn: `${BASE}/bn/blog`,
        th: `${BASE}/th/blog`,
        zh: `${BASE}/zh/blog`,
        de: `${BASE}/de/blog`,
      },
    },
    openGraph: {
      type: "website",
      url: `${BASE}/${locale}/blog`,
      title: "Writing — Rizwanul Islam Rudra",
      description:
        "Technical blog on agentic AI systems, RAG pipelines, software architecture, and forward deployed AI engineering.",
    },
  };
}

export default async function BlogPage({ params: { locale } }) {
  const t = await getTranslations("blog");
  const posts = await getAllPosts();

  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "riz1.dev Writing",
    url: `${BASE}/${locale}/blog`,
    author: {
      "@type": "Person",
      name: "Rizwanul Islam Rudra",
      url: BASE,
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description || "",
      datePublished: post.date,
      url: `${BASE}/${locale}/blog/${post.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />

      <div className="fade-in">
        <div className="blog-hd">
          <h1 className="section-h">{t("title")}</h1>
          <p className="section-lead" style={{ marginBottom: 0 }}>
            {t("subtitle")}
          </p>
        </div>

        <div role="list">
          {posts.map((post) => (
            <Link
              role="listitem"
              className="post-row"
              href={`/${locale}/blog/${post.slug}`}
              key={post.slug}
            >
              <span className="post-row-date">{post.date}</span>
              <div>
                <h2 className="post-row-title">{post.title}</h2>
                {post.description && (
                  <p className="post-row-desc">{post.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
