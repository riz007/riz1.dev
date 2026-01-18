import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

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
