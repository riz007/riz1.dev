import { ogCard } from "../../../lib/og";

export { size, contentType } from "../../../lib/og";
export const alt = "Profile of Rizwanul Islam Rudra";

export default function OGImage() {
  return ogCard({
    file: "~/profile",
    title: "Rizwanul Islam Rudra",
    subtitle: "10+ years · Software engineering, system design, technical leadership",
    meta: "TypeScript · Vue · React · Node · Python",
  });
}
