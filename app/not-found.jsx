import "./globals.css";
import { fontVariables } from "./fonts";

/* Outside the /[locale] tree, so it carries its own document. */
export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function RootNotFound() {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="shell">
          <main className="container page">
            <h1 className="section-h">Page not found</h1>
            <p className="section-lead">
              That page does not exist. <a href="/en">Head back to riz1.dev</a>.
            </p>
          </main>
        </div>
      </body>
    </html>
  );
}
