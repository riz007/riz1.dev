import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_setRequestLocale } from "next-intl/server";
import { getAllTags, getPostsByTag } from "../../../../../lib/posts";

const BASE = "https://riz1.dev";

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag: tag.slug }));
}

async function findTag(slug) {
  const tags = await getAllTags();
  return tags.find((t) => t.slug === slug) || null;
}

export async function generateMetadata({ params: { tag, locale } }) {
  const found = await findTag(tag);
  if (!found) return { title: "Topic" };
  return {
    title: `${found.name} — Writing`,
    description: `Articles on ${found.name} by Rizwanul Islam Rudra — ${found.count} post${found.count === 1 ? "" : "s"} on engineering practice, architecture, and AI systems.`,
    alternates: { canonical: `${BASE}/en/blog/tag/${tag}` },
    openGraph: {
      type: "website",
      url: `${BASE}/${locale}/blog/tag/${tag}`,
      title: `${found.name} — Writing by Rizwanul Islam Rudra`,
    },
  };
}

export default async function TagPage({ params: { locale, tag } }) {
  unstable_setRequestLocale(locale);

  const found = await findTag(tag);
  if (!found) notFound();
  const posts = await getPostsByTag(tag);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${found.name} — Writing`,
    url: `${BASE}/en/blog/tag/${tag}`,
    isPartOf: { "@type": "Blog", name: "riz1.dev Writing", url: `${BASE}/en/blog` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: post.title,
        url: `${BASE}/en/blog/${post.slug}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="fade-in">
        <Link className="back-link" href={`/${locale}/blog`}>
          <span className="back-arrow" aria-hidden="true">←</span>
          <span>All posts</span>
        </Link>

        <div className="blog-hd">
          <h1 className="section-h">{found.name}</h1>
          <p className="section-lead" style={{ marginBottom: 0 }}>
            {found.count} post{found.count === 1 ? "" : "s"} on {found.name.toLowerCase()}.
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
              <span className="post-row-date">
                {post.isoDate ? <time dateTime={post.isoDate}>{post.date}</time> : null}
              </span>
              <div>
                <h2 className="post-row-title">{post.title}</h2>
                {post.description && <p className="post-row-desc">{post.description}</p>}
                <p className="post-row-meta">{post.readingTime} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
