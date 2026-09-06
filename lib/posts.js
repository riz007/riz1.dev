import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "posts");

/* Legacy posts carried their date inside the body as "*Published on ...*".
   Frontmatter `date` is now the source of truth; this stays as a safety net
   so a post is never emitted with an invalid schema.org date. */
function parsePublishedDate(content) {
  const match = content.match(/\*Published on ([^*]+)\*/);
  return match ? match[1].trim() : null;
}

/* schema.org and RSS both require ISO 8601. "2025-09-10 00:15" is not valid
   ISO 8601 (the date and time must be separated by "T"), and Google discards
   Article dates it cannot parse — so every date goes through here. */
function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value).trim();
  // "YYYY-MM-DD HH:mm" → "YYYY-MM-DDTHH:mm"; bare "YYYY-MM-DD" → midnight UTC
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? `${raw}T00:00:00Z`
    : raw.replace(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(:\d{2})?$/, "$1T$2$3Z");
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function tagSlug(tag) {
  return String(tag)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readingTimeOf(content) {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/* One post's metadata, without paying to render its markdown. */
function metaFrom(file, raw) {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(raw);
  const date = toDate(data.date) || toDate(parsePublishedDate(content));
  const title =
    (data.title && String(data.title).trim()) ||
    content.match(/^#\s+(.*)/m)?.[1]?.trim() ||
    slug.replace(/-/g, " ");
  const tags = Array.isArray(data.tags) ? data.tags.filter(Boolean) : [];

  return {
    slug,
    title,
    description: data.description || "",
    // display date, ISO date for <time>/sitemap, full ISO for schema.org + RSS
    date: date ? date.toISOString().slice(0, 10) : "",
    isoDate: date ? date.toISOString().slice(0, 10) : "",
    isoDateTime: date ? date.toISOString() : "",
    timestamp: date ? date.getTime() : 0,
    tags,
    tagLinks: tags.map((t) => ({ name: t, slug: tagSlug(t) })),
    readingTime: readingTimeOf(content),
  };
}

export async function getPostSlugs() {
  const files = await fs.readdir(postsDirectory);
  return files.filter((file) => file.endsWith(".md"));
}

/* Metadata for every post, newest first. Used by the blog index, the sitemap,
   the RSS feed, tag pages and the RudraOS desktop — none of which need the
   rendered HTML, which is why that is no longer loaded here. */
export async function getPostsIndex() {
  const files = await getPostSlugs();
  const posts = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(postsDirectory, file), "utf8");
      return metaFrom(file, raw);
    })
  );

  return posts.sort((a, b) => b.timestamp - a.timestamp);
}

/* Kept as the historical name used by the sitemap. */
export const getAllPosts = getPostsIndex;

export async function getPostBySlug(slug) {
  const file = `${slug}.md`;
  const raw = await fs.readFile(path.join(postsDirectory, file), "utf8");
  const { content } = matter(raw);
  const meta = metaFrom(file, raw);
  const processed = await remark().use(html).process(content);

  return {
    ...meta,
    contentHtml: processed.toString(),
    // legacy shape — the routed post page reads post.data.*
    data: meta,
  };
}

export async function getAllTags() {
  const posts = await getPostsIndex();
  const counts = new Map();
  for (const post of posts) {
    for (const tag of post.tags) {
      const slug = tagSlug(tag);
      const entry = counts.get(slug) || { name: tag, slug, count: 0 };
      entry.count += 1;
      counts.set(slug, entry);
    }
  }
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}

export async function getPostsByTag(slug) {
  const posts = await getPostsIndex();
  return posts.filter((p) => p.tags.some((t) => tagSlug(t) === slug));
}

/* Posts sharing the most tags with this one — the internal links that were
   missing between related articles. Falls back to recency. */
export async function getRelatedPosts(slug, limit = 3) {
  const posts = await getPostsIndex();
  const current = posts.find((p) => p.slug === slug);
  if (!current) return [];
  const mine = new Set(current.tags.map(tagSlug));

  return posts
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      shared: p.tags.filter((t) => mine.has(tagSlug(t))).length,
    }))
    .sort((a, b) => b.shared - a.shared || b.post.timestamp - a.post.timestamp)
    .slice(0, limit)
    .map((x) => x.post);
}
