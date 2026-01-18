import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getAllPosts } from "../../../lib/posts";

export const metadata = {
  title: "Blog"
};

export default async function BlogPage({ params: { locale } }) {
  const t = await getTranslations("blog");
  const posts = await getAllPosts();

  return (
    <section className="fade-in">
      <h1 className="section-title">{t("title")}</h1>
      <p className="section-lede">{t("subtitle")}</p>
      <div className="blog-list">
        {posts.map((post) => (
          <Link className="blog-card" href={`/${locale}/blog/${post.slug}`} key={post.slug}>
            <div className="blog-meta">{post.date}</div>
            <h2>{post.title}</h2>
            {post.description ? <p className="section-lede">{post.description}</p> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
