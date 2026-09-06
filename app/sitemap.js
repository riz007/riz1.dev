import { getAllTags, getPostsIndex } from "../lib/posts";

const BASE = "https://riz1.dev";
const LOCALES = ["en", "bn", "th", "zh", "de"];

/* Routes whose copy is actually translated — every locale is a distinct,
   self-canonical page and belongs in the sitemap. */
const TRANSLATED_ROUTES = [
  { path: "",       priority: 1.0, changeFrequency: "weekly"  },
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
      // the blog index genuinely changes when a post ships; the rest do not
      // change on every deploy, and claiming they do trains crawlers to ignore it
      lastModified: r.path === "/blog" ? newestPost : now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    }))
  );

  /* Post bodies are English only and every locale canonicalises to /en, so
     submitting the other four prefixes would contradict our own canonical. */
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
