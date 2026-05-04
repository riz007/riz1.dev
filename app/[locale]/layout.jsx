import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

const LOCALES = ["en", "bn", "th", "zh", "de"];
const BASE = "https://riz1.dev";

export function generateMetadata({ params: { locale } }) {
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, `${BASE}/${l}`])
  );
  return {
    alternates: {
      languages: { "x-default": `${BASE}/en`, ...languages },
    },
  };
}

export default async function LocaleLayout({ children, params: { locale } }) {
  unstable_setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="shell">
        <SiteHeader locale={locale} />
        <main className="container page">{children}</main>
        <SiteFooter />
      </div>
    </NextIntlClientProvider>
  );
}
