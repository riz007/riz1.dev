import { getPostBySlug, getPostsIndex } from "../../lib/posts";

const BASE = "https://riz1.dev";

export const dynamic = "force-static";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/* Full-content RSS 2.0 feed — the distribution channel a dev blog is expected
   to expose, and how aggregators, readers and newsletters pick posts up. */
export async function GET() {
  const index = await getPostsIndex();
  const posts = await Promise.all(index.map((p) => getPostBySlug(p.slug)));
  const updated = posts[0]?.isoDateTime || new Date().toISOString();

  const items = posts
    .map((post) => {
      const url = `${BASE}/en/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.isoDateTime).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
${post.tags.map((t) => `      <category>${escapeXml(t)}</category>`).join("\n")}
      <content:encoded><![CDATA[${post.contentHtml.replace(/]]>/g, "]]&gt;")}]]></content:encoded>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>riz1.dev — Writing</title>
    <link>${BASE}/en/blog</link>
    <description>Software engineering, AI, system design, and modern web development — practical insights over hot takes, by Rizwanul Islam Rudra.</description>
    <language>en</language>
    <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
