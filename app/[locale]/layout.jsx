import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import Script from "next/script";
import { fontVariables } from "../fonts";
import { locales } from "../../i18n/routing";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

const BASE = "https://riz1.dev";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/* Without this, /anything resolves as a locale and returns 200. */
export const dynamicParams = false;

export default async function LocaleLayout({ children, params: { locale } }) {
  if (!locales.includes(locale)) notFound();
  unstable_setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var d=document.documentElement;" +
              "var t=localStorage.getItem('theme-preference')||" +
              "(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');" +
              "d.setAttribute('data-theme',t);" +
              "d.setAttribute('data-palette',localStorage.getItem('palette-preference')||'ember');" +
              "}catch(e){}})()",
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <div className="shell">
            <SiteHeader locale={locale} />
            <main className="container page">{children}</main>
            <SiteFooter locale={locale} />
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
