import { getAllPosts } from "../lib/posts";

const BASE = "https://riz1.dev";
const LOCALES = ["en", "bn", "th", "zh", "de"];

const STATIC_ROUTES = [
  { path: "",       priority: 1.0, changeFrequency: "weekly"  },
  { path: "/blog",  priority: 0.9, changeFrequency: "weekly"  },
  { path: "/dsa",   priority: 0.7, changeFrequency: "monthly" },
  { path: "/links", priority: 0.6, changeFrequency: "monthly" },
];

export default async function sitemap() {
  const posts = await getAllPosts();
  const now = new Date();

  const statics = LOCALES.flatMap((locale) =>
    STATIC_ROUTES.map((r) => ({
      url: `${BASE}/${locale}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    }))
  );

  const articles = LOCALES.flatMap((locale) =>
    posts.map((post) => ({
      url: `${BASE}/${locale}/blog/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : now,
      changeFrequency: "never",
      priority: 0.7,
    }))
  );

  return [...statics, ...articles];
}
