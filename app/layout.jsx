import "./globals.css";
import { Fraunces, Sora } from "next/font/google";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-display"
});

const body = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body"
});

export const metadata = {
  title: {
    default: "Rizwanul Islam Rudra",
    template: "%s | Rizwanul Islam Rudra"
  },
  description:
    "Software engineering leader focused on scalable systems, thoughtful UX, and expressive interfaces."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
