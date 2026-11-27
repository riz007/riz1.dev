import { ogCard } from "../../../../../lib/og";
import { getAllTags } from "../../../../../lib/posts";

export { size, contentType } from "../../../../../lib/og";
export const alt = "Articles by topic, by Rizwanul Islam Rudra";

export default async function OGImage({ params }) {
  const { tag } = await params;
  const found = (await getAllTags()).find((t) => t.slug === tag);
  return ogCard({
    file: "~/blog/tag",
    title: found?.name || "Writing",
    subtitle: found ? `${found.count} post${found.count === 1 ? "" : "s"}` : "",
    meta: "By Rizwanul Islam Rudra",
  });
}
