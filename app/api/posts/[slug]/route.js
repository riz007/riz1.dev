import { getPostBySlug, getPostSlugs } from "../../../../lib/posts";

/* Rendered post HTML for the RudraOS reader, fetched on demand.
   Previously every post's full HTML was serialised into the homepage payload,
   which grew the document linearly with each new article. Statically generated
   at build time, so opening a post still costs one cached edge request. */
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
