import { getPostBySlug, getPostSlugs } from "../../../../lib/posts";

/* Rendered post HTML for the reader, fetched on demand. */
export const dynamic = "force-static";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((file) => ({ slug: file.replace(/\.md$/, "") }));
}

export async function GET(_request, { params }) {
  try {
    const post = await getPostBySlug(params.slug);
    return Response.json({
      slug: post.slug,
      title: post.title,
      contentHtml: post.contentHtml,
    });
  } catch {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
}
