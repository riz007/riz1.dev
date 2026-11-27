import { ogCard } from "../lib/og";

export { size, contentType } from "../lib/og";
export const alt = "Rizwanul Islam Rudra — Senior Software Engineer & Technical Lead";

export default function OGImage() {
  return ogCard({
    file: "read_me.txt",
    title: "Rizwanul Islam Rudra",
    subtitle: "Senior Software Engineer · Technical Lead",
    meta: "AI & agentic systems · System design · Bangkok",
  });
}
