import { ogCard, size, contentType } from "../../../../lib/og";
import { getPostBySlug } from "../../../../lib/posts";

export { size, contentType };

/* size and contentType must be repeated here: when generateImageMetadata is
   present Next ignores the module-level exports, and without them it emits no
   og:image:width/height, which LinkedIn needs to render a large card. */
export async function generateImageMetadata({ params }) {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    return [{ id: slug, alt: post.title, size, contentType }];
  } catch {
    return [{ id: slug, alt: "Blog post", size, contentType }];
  }
}

export default async function OGImage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  return ogCard({
    file: "~/blog",
    title: post?.title || "Writing",
    meta: post ? `Rizwanul Islam Rudra · ${post.date} · ${post.readingTime} min read` : "Rizwanul Islam Rudra",
  });
}
