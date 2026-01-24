import { NextResponse } from "next/server";
import { defaultLocale, locales } from "./i18n/routing";

const hasLocalePrefix = (pathname) =>
  locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (hasLocalePrefix(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/(en|bn|th|zh|de)/:path*"],
};
