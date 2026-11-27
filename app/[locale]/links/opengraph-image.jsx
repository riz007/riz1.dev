import { ogCard } from "../../../lib/og";

export { size, contentType } from "../../../lib/og";
export const alt = "Links curated by Rizwanul Islam Rudra";

export default function OGImage() {
  return ogCard({
    file: "~/links",
    title: "Useful Links",
    subtitle: "AI engineering, agentic systems and software architecture",
    meta: "Curated by Rizwanul Islam Rudra",
  });
}
