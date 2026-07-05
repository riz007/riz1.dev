import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./i18n/routing";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  // always land on English — no Accept-Language / cookie sniffing;
  // visitors choose a language explicitly via the switcher
  localeDetection: false,
});

export const config = {
  matcher: ["/", "/(en|bn|th|zh|de)/:path*"],
};
