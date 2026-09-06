import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import Script from "next/script";
import { fontVariables } from "../fonts";
import { locales } from "../../i18n/routing";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

const BASE = "https://riz1.dev";

/* Pre-rendering every locale at build time. Without this the pages opt into
   dynamic rendering the moment next-intl reads the request locale, which is
   why the homepage was served with `cache-control: no-store` on every hit. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/* [locale] otherwise matches any first path segment, so /anything rendered a
   200 with lang="anything" — a soft 404 that search engines will happily index. */
export const dynamicParams = false;

export default async function LocaleLayout({ children, params: { locale } }) {
  if (!locales.includes(locale)) notFound();
  unstable_setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <div className="shell">
            <SiteHeader locale={locale} />
            <main className="container page">{children}</main>
            <SiteFooter />
          </div>
        </NextIntlClientProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WCHT2DKSX2"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-WCHT2DKSX2');
        `}
        </Script>
      </body>
    </html>
  );
}
