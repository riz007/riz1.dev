import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_setRequestLocale } from "next-intl/server";
import { getPostBySlug, getPostSlugs, getRelatedPosts } from "../../../../lib/posts";

const BASE = "https://riz1.dev";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((file) => ({ slug: file.replace(/\.md$/, "") }));
}

export async function generateMetadata({ params: { slug, locale } }) {
  try {
    const post = await getPostBySlug(slug);
    return {
      title: post.title,
      description: post.description,
      // Post bodies exist only in English. Declaring hreflang alternates for
      // locales that serve identical English text makes the cluster untrustworthy,
      // so every locale canonicalises to the one real version instead.
      alternates: { canonical: `${BASE}/en/blog/${slug}` },
      keywords: post.tags,
      authors: [{ name: "Rizwanul Islam Rudra", url: BASE }],
      openGraph: {
        type: "article",
        title: post.title,
        description: post.description,
        url: `${BASE}/${locale}/blog/${slug}`,
        publishedTime: post.isoDateTime,
        modifiedTime: post.isoDateTime,
        authors: [BASE],
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
      },
    };
  } catch {
    return { title: "Post" };
  }
}

export default async function BlogPostPage({ params: { locale, slug } }) {
  unstable_setRequestLocale(locale);

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  const related = await getRelatedPosts(slug);
  const ogImage = `${BASE}/en/blog/${slug}/opengraph-image/${slug}`;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description || "",
      // Google discards Article dates it cannot parse — these are full ISO 8601
      datePublished: post.isoDateTime,
      dateModified: post.isoDateTime,
      // the body is English at every locale prefix
      inLanguage: "en",
      keywords: post.tags.join(", "),
      timeRequired: `PT${post.readingTime}M`,
      // the per-post OG image already exists; Article rich results want it declared
      image: [ogImage],
      url: `${BASE}/en/blog/${slug}`,
      mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}/en/blog/${slug}` },
      author: {
        "@type": "Person",
        name: "Rizwanul Islam Rudra",
        url: BASE,
        jobTitle: "Senior Software Engineer & Technical Lead",
        sameAs: [
          "https://github.com/riz007",
          "https://www.linkedin.com/in/rizwanulrudra/",
        ],
      },
      publisher: { "@type": "Person", name: "Rizwanul Islam Rudra", url: BASE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/${locale}` },
        { "@type": "ListItem", position: 2, name: "Writing", item: `${BASE}/${locale}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: `${BASE}/en/blog/${slug}` },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <article className="fade-in post-wrap">
        <Link className="back-link" href={`/${locale}/blog`}>
          <span className="back-arrow" aria-hidden="true">←</span>
          <span>All posts</span>
        </Link>

        {post.isoDate && (
          <p className="post-pub-date">
            <time dateTime={post.isoDate}>{post.date}</time>
            <span aria-hidden="true"> · </span>
            {post.readingTime} min read
          </p>
        )}

        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {post.tagLinks.length > 0 && (
          <nav className="tag-bar post-tags" aria-label="Topics">
            {post.tagLinks.map((tag) => (
              <Link className="tag-chip" href={`/${locale}/blog/tag/${tag.slug}`} key={tag.slug}>
                {tag.name}
              </Link>
            ))}
          </nav>
        )}

        {related.length > 0 && (
          <aside className="related" aria-labelledby="related-h">
            <h2 className="related-h" id="related-h">Related reading</h2>
            <ul className="related-list">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/${locale}/blog/${r.slug}`}>
                    <span className="related-t">{r.title}</span>
                    {r.description && <span className="related-d">{r.description}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </article>
    </>
  );
}
