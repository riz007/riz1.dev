import { ogCard } from "../../../lib/og";

export { size, contentType } from "../../../lib/og";
export const alt = "Data Structures & Algorithms by Rizwanul Islam Rudra";

export default function OGImage() {
  return ogCard({
    file: "~/dsa",
    title: "Data Structures & Algorithms",
    subtitle: "Complexity, and how classical algorithms power modern AI",
    meta: "By Rizwanul Islam Rudra",
  });
}
