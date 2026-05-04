import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs } from "../../../../lib/posts";

const BASE = "https://riz1.dev";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((file) => ({ slug: file.replace(/\.md$/, "") }));
}

export async function generateMetadata({ params }) {
  const { slug, locale } = params;
  try {
    const post = await getPostBySlug(slug);
    const title = post.data.title;
    const description = post.data.description || "";
    const date = post.data.date || "";

    return {
      title,
      description,
      alternates: {
        canonical: `${BASE}/en/blog/${slug}`,
        languages: {
          "x-default": `${BASE}/en/blog/${slug}`,
          en: `${BASE}/en/blog/${slug}`,
          bn: `${BASE}/bn/blog/${slug}`,
          th: `${BASE}/th/blog/${slug}`,
          zh: `${BASE}/zh/blog/${slug}`,
          de: `${BASE}/de/blog/${slug}`,
        },
      },
      openGraph: {
        type: "article",
        title,
        description,
        url: `${BASE}/${locale}/blog/${slug}`,
        publishedTime: date,
        modifiedTime: date,
        authors: [BASE],
        tags: ["AI Engineering", "Software Engineering", "Agentic AI"],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return { title: "Post" };
  }
}

export default async function BlogPostPage({ params: { locale, slug } }) {
  try {
    const post = await getPostBySlug(slug);

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.data.title,
      description: post.data.description || "",
      datePublished: post.data.date || "",
      dateModified: post.data.date || "",
      inLanguage: locale,
      url: `${BASE}/${locale}/blog/${slug}`,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${BASE}/${locale}/blog/${slug}`,
      },
      author: {
        "@type": "Person",
        name: "Rizwanul Islam Rudra",
        url: BASE,
        jobTitle: "Forward Deployed AI Engineer",
      },
      publisher: {
        "@type": "Person",
        name: "Rizwanul Islam Rudra",
        url: BASE,
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <article className="fade-in post-wrap">
          <Link className="back-link" href={`/${locale}/blog`}>
            <span className="back-arrow" aria-hidden="true">←</span>
            <span>All posts</span>
          </Link>
          {post.data.date && (
            <p className="post-pub-date">{post.data.date}</p>
          )}
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </article>
      </>
    );
  } catch {
    notFound();
  }
}
