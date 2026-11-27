import { ogCard } from "../../../lib/og";

export { size, contentType } from "../../../lib/og";
export const alt = "Writing by Rizwanul Islam Rudra";

export default function OGImage() {
  return ogCard({
    file: "~/blog",
    title: "Writing",
    subtitle: "Software engineering, AI, system design and modern web development",
    meta: "By Rizwanul Islam Rudra",
  });
}
