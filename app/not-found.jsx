import "./globals.css";
import { fontVariables } from "./fonts";

/* Root-level 404 — reached only for paths outside the /[locale] tree, which
   render without the locale layout and therefore need their own document. */
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
