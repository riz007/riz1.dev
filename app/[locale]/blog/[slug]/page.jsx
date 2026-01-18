import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs } from "../../../../lib/posts";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((file) => ({ slug: file.replace(/\.md$/, "") }));
}

export async function generateMetadata({ params }) {
  const { slug } = params;

  try {
    const post = await getPostBySlug(slug);
    return {
      title: post.data.title,
      description: post.data.description || ""
    };
  } catch (error) {
    return {
      title: "Post"
    };
  }
}

export default async function BlogPostPage({ params: { locale, slug } }) {
  try {
    const post = await getPostBySlug(slug);

    return (
      <article className="fade-in">
        <Link className="nav-link" href={`/${locale}/blog`}>
          ← Back to blog
        </Link>
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </article>
    );
  } catch (error) {
    notFound();
  }
}
