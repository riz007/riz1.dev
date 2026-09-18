import { getAllTags, getPostsIndex } from "../lib/posts";

const BASE = "https://riz1.dev";
const LOCALES = ["en", "bn", "th", "zh", "de"];

/* Translated routes — each locale is its own indexable page. */
const TRANSLATED_ROUTES = [
  { path: "",       priority: 1.0, changeFrequency: "weekly"  },
  { path: "/profile", priority: 0.9, changeFrequency: "monthly" },
  { path: "/blog",  priority: 0.9, changeFrequency: "weekly"  },
  { path: "/dsa",   priority: 0.7, changeFrequency: "monthly" },
  { path: "/links", priority: 0.6, changeFrequency: "monthly" },
];

export default async function sitemap() {
  const [posts, tags] = await Promise.all([getPostsIndex(), getAllTags()]);
  const now = new Date();
  const newestPost = posts[0]?.isoDateTime ? new Date(posts[0].isoDateTime) : now;

  const statics = LOCALES.flatMap((locale) =>
    TRANSLATED_ROUTES.map((r) => ({
      url: `${BASE}/${locale}${r.path}`,
      lastModified: r.path === "/blog" ? newestPost : now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    }))
  );

  /* Post bodies are English only; every locale canonicalises to /en. */
  const articles = posts.map((post) => ({
    url: `${BASE}/en/blog/${post.slug}`,
    lastModified: post.isoDateTime ? new Date(post.isoDateTime) : now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const topics = tags.map((tag) => ({
    url: `${BASE}/en/blog/tag/${tag.slug}`,
    lastModified: newestPost,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...statics, ...articles, ...topics];
}
